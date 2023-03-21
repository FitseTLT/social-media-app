import { Message } from "../models/Message";
import { storeFS } from "../utils/storeFS";
import { Op, Sequelize } from "sequelize";
import { messagesPerPage } from "../constants";
import { Friendship } from "../models/Friendship";
import { User } from "../models/User";
import { FriendshipStatus } from "../models/ENUMS";
import { socketIO } from "../socket";
import { Comment } from "../models/Comment";

export const createMessage = async (
    {
        receiverId,
        text,
        media,
        callType,
        callDuration,
        callerId,
    }: {
        receiverId: number;
        text: string;
        media?: any;
        callType?: string;
        callDuration?: number;
        callerId?: number;
    },
    { user }: { user: number }
) => {
    const senderId = callerId ?? user;

    let mediaUrl = null,
        mediaType = null;
    if (media) {
        const { filename, createReadStream, mimetype } = await media.promise;
        const stream = createReadStream();
        const path = await storeFS({ stream, filename });
        mediaUrl = path.path;
        mediaType = mimetype;
    }
    const callReceiver = receiverId !== callerId ? receiverId : user;

    const message = await Message.create({
        senderId,
        receiverId: callerId ? callReceiver : receiverId,
        text,
        media: mediaUrl,
        mediaType,
        callType,
        callDuration,
        isRead: !!callType,
    });

    const friendship = await Friendship.findOne({
        where: {
            [Op.or]: [
                { requestedBy: senderId, acceptedBy: receiverId },
                { requestedBy: receiverId, acceptedBy: senderId },
            ],
        },
    });
    let unread = callType ? 0 : 1;
    if (friendship) {
        const receiver =
            receiverId === friendship.requestedBy ? "reqUnread" : "accUnread";
        unread = friendship[receiver] + (callType ? 0 : 1);
        await friendship.update({
            [receiver]: unread,
            lastMessage: message.id,
            lastMessageTime: message.createdAt,
        });
    }
    const sender = await User.findByPk(user);

    const msg = await Message.paginate({ where: { id: message.id } });

    socketIO
        .to(receiverId.toString())
        .emit("direct-message", msg.edges?.[0].node, sender, unread);

    return message;
};

export async function setAsRead(
    { messageId }: { messageId: number },
    { user }: { user: number }
) {
    const message = await Message.findByPk(messageId);

    if (!message) throw new Error("message doesn't exist");

    if (user !== message.receiverId) throw new Error("unauthorized");
    if (!message.isRead) {
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
                receiverId === friendship.requestedBy
                    ? "reqUnread"
                    : "accUnread";
            if (friendship[receiver] > 0) await friendship.decrement(receiver);
        }
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

        await friendship.update({ [receiver]: 0 });
    }

    const ids = messages.map((msg) => msg.id);
    const msgs = await Message.paginate({
        where: {
            id: { [Op.in]: ids },
        },
    });

    return msgs.edges.map((msg) => msg.node);
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
