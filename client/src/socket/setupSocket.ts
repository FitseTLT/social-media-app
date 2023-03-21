import { io } from "socket.io-client";
import { messageReceived } from "../store/messageSlice";
import { AppDispatch } from "../store/store";
import { setFriendsStatus, setUserStatus } from "../store/userSlice";

export const socket = io("https://192.168.0.100:4000", { autoConnect: false });

export const setupSocket = (id: number, dispatch: AppDispatch) => {
    socket.auth = { userId: id };

    socket.connect();

    socket.on("friends-status", (data) => {
        dispatch(setFriendsStatus(data));
    });

    socket.on("user-status", (data) => {
        dispatch(setUserStatus(data));
    });

    socket.on("direct-message", (message, user, unread) => {
        if (!message.callType) {
            const notification = document.getElementById(
                "notification-message"
            ) as HTMLAudioElement;

            notification.play();
        }

        dispatch(messageReceived({ message, user, unread }));
    });
};
