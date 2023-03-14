import { createSlice } from "@reduxjs/toolkit";

interface Message {
    recentMessages: {
        friendId: number;
        name: string;
        picture: string;
        lastMessage: string;
        unreadMessages: number;
    }[];
    messages: {
        [friendId: number]: {
            messages: {
                id?: number;
                senderId?: number;
                receiverId?: number;
                text?: string;
                media?: string;
                mediaType?: string;
                isRead?: boolean;
                createdAt: string;
                cursor: string;
            }[];
            pageInfo: {
                startCursor: string;
                endCursor: string;
            };
        };
    };
    friendIdsWithUnread: number[];
    notification: { name: string; open: boolean };
}

const initialState: Message = {
    friendIdsWithUnread: [],
    recentMessages: [],
    messages: {},
    notification: {
        name: "",
        open: false,
    },
};

const messageSlice = createSlice({
    name: "message",
    initialState,
    reducers: {
        setTotalUnread(state, { payload }) {
            state.friendIdsWithUnread = payload;
        },
        setRecentMessages(state, { payload }) {
            state.recentMessages = payload;
        },
        createMessage(state, { payload }) {
            const { friendId, ...message } = payload;
            const messageList = state.messages[friendId]?.messages || [];
            messageList.push(message);
            state.messages[friendId].messages = messageList;
            const lastMessage = state.recentMessages.find(
                (value) => value.friendId === friendId
            );

            lastMessage!.lastMessage = message.text;
        },
        setMessages(state, { payload }) {
            const { friendId, messages } = payload;

            if (!friendId) return;
            const msgData = state.messages[friendId] || { messages: [] };

            const ids: number[] = [];
            const messageArray = [...msgData.messages, ...messages].filter(
                (msg) => {
                    if (!ids.includes(msg.id)) {
                        ids.push(msg.id);
                        return true;
                    }
                    return false;
                }
            );

            msgData.messages = messageArray;

            msgData.messages.sort((msg1, msg2) =>
                msg1.createdAt < msg2.createdAt ? -1 : 1
            );
            msgData.pageInfo = {
                startCursor: msgData.messages[0].cursor,
                endCursor: msgData.messages[msgData.messages.length - 1].cursor,
            };

            state.messages[friendId] = msgData;
        },
        messageReceived(state, { payload }) {
            const {
                user,
                message: { updatedAt, ...message },
                unread,
            } = payload;
            if (!state.friendIdsWithUnread.includes(user.id))
                state.friendIdsWithUnread.push(user.id);

            const index = state.recentMessages.findIndex(
                ({ friendId }) => friendId === user.id
            );

            if (index !== -1) {
                const [msg] = state.recentMessages.splice(index, 1);

                msg.lastMessage = message.text;
                msg.unreadMessages = unread;
                state.recentMessages.unshift(msg);
            } else {
                state.recentMessages.unshift({
                    friendId: user.id,
                    name: user.name,
                    picture: user.picture,
                    lastMessage: message.text,
                    unreadMessages: unread,
                });
            }

            if (!state.messages?.[user.id])
                state.messages[user.id].messages = [];

            state.messages[user.id].messages.push({
                ...message,
            });

            state.notification = { name: user.name, open: true };
        },

        closeNotification(state) {
            state.notification = { name: "", open: false };
        },
    },
});

export const {
    setRecentMessages,
    createMessage,
    setMessages,
    setTotalUnread,
    messageReceived,
    closeNotification,
} = messageSlice.actions;

export default messageSlice.reducer;
