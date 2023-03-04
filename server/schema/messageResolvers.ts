import { Message } from "../models/Message";
import { storeFS } from "../utils/storeFS";
import { Op, Sequelize } from "sequelize";
import { messagesPerPage } from "../constants";
import { Friendship } from "../models/Friendship";
import { User } from "../models/User";

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

    let mediaUrl = null;
    if (media) {
        const { filename, createReadStream } = await media.promise;
        const stream = createReadStream();
        const path = await storeFS({ stream, filename });
        mediaUrl = path.path;
    }

    const message = await Message.create({
        senderId,
        receiverId,
        text,
        media: mediaUrl,
    });

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
        const unread = friendship[receiver] + 1;
        await friendship.update({
            [receiver]: unread,
            lastMessage: message.id,
            lastMessageTime: message.createdAt,
        });
    }

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
    { page = 0 },
    { user }: { user: number }
) {
    const friendships = await Friendship.findAll({
        where: {
            [Op.or]: [{ requestedBy: user }, { acceptedBy: user }],
        },
        order: [["lastMessageTime", "DESC"]],
        limit: messagesPerPage,
        offset: page * messagesPerPage,
    });

    return friendships.map(async (friendship) => {
        const friendId =
            friendship.requestedBy === user
                ? friendship.acceptedBy
                : friendship.requestedBy;

        const friend = await User.findByPk(friendId);

        const message = await Message.findByPk(friendship.lastMessage);

        const unreadMessage =
            friendship.requestedBy === user
                ? friendship.reqUnread
                : friendship.accUnread;

        return {
            friendId,
            name: friend?.name,
            picture: friend?.picture,
            lastMessage: message?.text,
            unreadMessage,
        };
    });
}

export async function listMessages(
    {
        friendId,
        page = 0,
        query = "",
    }: { friendId: number; page: number; query: string },
    { user }: { user: number }
) {
    const messages = await Message.findAll({
        where: {
            [Op.or]: [
                { senderId: user, receiverId: friendId },
                { receiverId: user, senderId: friendId },
            ],
        },
        order: [["createdAt", "DESC"]],
        offset: page * messagesPerPage,
        limit: messagesPerPage,
    });

    return messages;
}
