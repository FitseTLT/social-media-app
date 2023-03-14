import { Message } from "../models/Message";
import { storeFS } from "../utils/storeFS";
import { Op, Sequelize } from "sequelize";
import { messagesPerPage } from "../constants";
import { Friendship } from "../models/Friendship";
import { User } from "../models/User";
import { FriendshipStatus } from "../models/ENUMS";
import { socketIO } from "../socket";

export const createMessage = async (
    {
        receiverId,
        text,
        media,
    }: {
        receiverId: number;
        text: string;
        media?: any;
    },
    { user }: { user: number }
) => {
    const senderId = user;

    let mediaUrl = null,
        mediaType = null;
    if (media) {
        const { filename, createReadStream, mimetype } = await media.promise;
        const stream = createReadStream();
        const path = await storeFS({ stream, filename });
        mediaUrl = path.path;
        mediaType = mimetype;
    }

    const message = await Message.create({
        senderId,
        receiverId,
        text,
        media: mediaUrl,
        mediaType,
    });

    const friendship = await Friendship.findOne({
        where: {
            [Op.or]: [
                { requestedBy: senderId, acceptedBy: receiverId },
                { requestedBy: receiverId, acceptedBy: senderId },
            ],
        },
    });
    let unread = 1;
    if (friendship) {
        const receiver =
            receiverId === friendship.requestedBy ? "reqUnread" : "accUnread";
        unread = friendship[receiver] + 1;
        await friendship.update({
            [receiver]: unread,
            lastMessage: message.id,
            lastMessageTime: message.createdAt,
        });
    }
    const sender = await User.findByPk(user);
    socketIO
        .to(receiverId.toString())
        .emit("direct-message", message, sender, unread);

    return message;
};

export async function setAsRead(
    { messageId }: { messageId: number },
    { user }: { user: number }
) {
    const message = await Message.findByPk(messageId);

    if (!message) throw new Error("message doesn't exist");

    if (user !== message.receiverId) throw new Error("unauthorized");

    await message.update({ isRead: true });

    const { receiverId, senderId } = message;

    const friendship = await Friendship.findOne({
        where: {
            [Op.or]: [
                { requestedBy: senderId, acceptedBy: receiverId },
                { requestedBy: receiverId, acceptedBy: senderId },
            ],
        },
    });

    if (friendship) {
        const receiver =
            receiverId === friendship.requestedBy ? "reqUnread" : "accUnread";

        await friendship.decrement(receiver);
    }

    return message;
}

export async function setAllAsRead(
    { friendId }: { friendId: number },
    { user }: { user: number }
) {
    const messages = await Message.findAll({
        where: {
            receiverId: user,
            senderId: friendId,
            isRead: false,
        },
    });

    messages.forEach(async (message) => await message.update({ isRead: true }));

    const receiverId = user,
        senderId = friendId;

    const friendship = await Friendship.findOne({
        where: {
            [Op.or]: [
                { requestedBy: senderId, acceptedBy: receiverId },
                { requestedBy: receiverId, acceptedBy: senderId },
            ],
        },
    });

    if (friendship) {
        const receiver =
            receiverId === friendship.requestedBy ? "reqUnread" : "accUnread";

        await friendship.update(receiver, 0);
    }

    return messages;
}

export async function listRecentMessages(
    { page = 0, query = "" },
    { user }: { user: number; query: string }
) {
    const friendships = (await Friendship.findAll({
        where: {
            [Op.or]: [{ requestedBy: user }, { acceptedBy: user }],
            status: FriendshipStatus.Accepted,
        },
        include: [
            {
                model: User,
                foreignKey: "requestedBy",
                as: "RequestedUser",
                where: {
                    [Op.or]: [
                        { name: { [Op.like]: `%${query}%` } },
                        { id: user },
                    ],
                },
            },
            {
                model: User,
                foreignKey: "acceptedBy",
                as: "AcceptedUser",
                where: {
                    [Op.or]: [
                        { name: { [Op.like]: `%${query}%` } },
                        { id: user },
                    ],
                },
            },

            { model: Message, foreignKey: "lastMessage" },
        ],
        order: [["lastMessageTime", "DESC"]],
        limit: messagesPerPage,
        offset: page * messagesPerPage,
    })) as any[];

    return friendships.map(async (friendship) => {
        const {
            id: friendId,
            name,
            picture,
        } = friendship.acceptedBy === user
            ? friendship.RequestedUser
            : friendship.AcceptedUser;

        return {
            friendId,
            name,
            picture,
            lastMessage: friendship.Message?.text,
            unreadMessages:
                friendship.acceptedBy === user
                    ? friendship.accUnread
                    : friendship.reqUnread,
        };
    });
}

export async function getTotalUnread(_: any, { user }: { user: number }) {
    const totalUnread = await Friendship.findAll({
        where: {
            [Op.or]: [{ requestedBy: user }, { acceptedBy: user }],
            status: FriendshipStatus.Accepted,
        },
    });

    const friendIdsWithUnread: number[] = [];

    totalUnread.forEach(({ acceptedBy, accUnread, requestedBy, reqUnread }) => {
        const unread = acceptedBy === user ? accUnread : reqUnread;
        if (unread > 0)
            friendIdsWithUnread.push(
                acceptedBy === user ? requestedBy : acceptedBy
            );
    });

    return { friendIdsWithUnread };
}

export async function listMessages(
    {
        friendId,
        cursor,
        isNextPage = true,
    }: {
        friendId: number;
        cursor?: string;
        isNextPage: boolean;
    },
    { user }: { user: number }
) {
    if (cursor) {
        const messages = await Message.paginate({
            where: {
                [Op.or]: [
                    { senderId: user, receiverId: friendId },
                    { receiverId: user, senderId: friendId },
                ],
            },
            ...(isNextPage ? { before: cursor } : { after: cursor }),
            order: [["createdAt", "DESC"]],
            limit: messagesPerPage,
        });

        const res = messages.edges.map((edge) => ({
            ...edge.node.toJSON(),
            cursor: edge.cursor,
        }));

        return res;
    } else {
        const unreadCount = await Message.count({
            where: {
                isRead: false,
                receiverId: user,
                senderId: friendId,
            },
        });

        if (unreadCount <= messagesPerPage) {
            const messages = await Message.paginate({
                where: {
                    [Op.or]: [
                        { senderId: user, receiverId: friendId },
                        { receiverId: user, senderId: friendId },
                    ],
                },
                order: [["createdAt", "DESC"]],
                limit: messagesPerPage,
            });

            const res = messages.edges.map((edge) => ({
                ...edge.node.toJSON(),
                cursor: edge.cursor,
            }));

            return res;
        } else {
            const messages = await Message.paginate({
                where: {
                    isRead: false,
                    receiverId: user,
                    senderId: friendId,
                },
                order: [["createdAt", "ASC"]],
                limit: messagesPerPage,
            });

            const res = messages.edges.map((edge) => ({
                ...edge.node.toJSON(),
                cursor: edge.cursor,
            }));

            return res;
        }
    }
}
