import { Container, Box, Snackbar, IconButton } from "@mui/material";
import { css } from "@emotion/css";
import { Tabs, Tab, Typography } from "@mui/material";
import { ChatBubble, Close, Home, People, Timeline } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client/core";
import { Link, Outlet, Route, Routes, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentUser } from "../store/userSlice";
import { AvatarMenu } from "./AvatarMenu";
import { io, Socket } from "socket.io-client";
import { RootState } from "../store/store";
import { setupSocket } from "../socket/setupSocket";
import { useScrollFetch } from "../hooks/useScrollFetch";
import {
    closeNotification,
    setRecentMessages,
    setTotalUnread,
} from "../store/messageSlice";
import { borderRadius } from "@mui/system";

const currentUser = gql`
    query {
        getCurrentUser {
            id
            name
            picture
        }
    }
`;

const LIST_RECENT_MESSAGES = gql`
    query ($page: Int, $query: String) {
        listRecentMessages(query: $query, page: $page) {
            friendId
            name
            picture
            lastMessage
            unreadMessages
        }
    }
`;

const GET_TOTAL_UNREAD = gql`
    query {
        getTotalUnread {
            friendIdsWithUnread
        }
    }
`;

const MainLayout = ({ socket }: { socket: Socket }) => {
    const { user, message } = useSelector((state: RootState) => state);
    const [query, setQuery] = useState("");
    const [page, setPage] = useState(0);
    const { data: messagesList, error: err } = useScrollFetch({
        QUERY: LIST_RECENT_MESSAGES,
        variables: {
            page,
            query,
        },
    });
    useQuery(GET_TOTAL_UNREAD, {
        onCompleted(data) {
            const friendIdsWithUnreadMsgs =
                data?.getTotalUnread?.friendIdsWithUnread;
            dispatch(setTotalUnread(friendIdsWithUnreadMsgs));
        },
    });

    useEffect(() => {
        if (!user.id) return;

        setupSocket(socket, user.id, dispatch);
    }, [user.id]);

    useEffect(() => {
        if (messagesList)
            dispatch(setRecentMessages(messagesList?.listRecentMessages));
    }, [messagesList]);

    const { loading, error, data } = useQuery(currentUser, {
        onCompleted(data) {
            const { id, name, picture } = data?.getCurrentUser;
            dispatch(setCurrentUser({ id, name, picture }));
        },
    });
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [tab, setTab] = useState("/");

    useEffect(() => {
        if (loading) return;

        if (error || !data) {
            return navigate("/login");
        }
    }, [loading]);

    const close = () => dispatch(closeNotification());

    return (
        <Box width="100%">
            <Snackbar
                open={message.notification.open}
                message={`${message.notification.name} sent you a message`}
                onClose={close}
                autoHideDuration={5000}
                action={
                    <IconButton onClick={close} color="inherit">
                        <Close />
                    </IconButton>
                }
            />
            <nav
                className={css({
                    backgroundColor: "white",
                    zIndex: 2,
                    height: "80px",
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    boxShadow: "0px 5px 10px 0px rgba(0, 0, 0, 0.15)",
                })}
            >
                <Link to="/">
                    <Typography component="h3" color="brown" m={2}>
                        Social Media App
                    </Typography>
                </Link>
                <Tabs
                    onChange={(e, value) => {
                        setTab(value);
                        navigate(value);
                    }}
                    value={tab}
                >
                    <Tab icon={<Home />} value="/" />
                    <Tab
                        icon={
                            <Box position="relative">
                                <ChatBubble />
                                {message.friendIdsWithUnread.length > 0 && (
                                    <Box
                                        sx={{
                                            position: "absolute",
                                            right: -9,
                                            bottom: -2,
                                            fontSize: "12px",
                                            width: "20px",
                                            height: "20px",
                                            borderRadius: "50%",
                                            background: "#0B85EE",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <Typography
                                            sx={{
                                                fontSize: "12px",
                                                color: "white",
                                            }}
                                        >
                                            {message.friendIdsWithUnread.length}
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        }
                        value="/chat"
                    />

                    <Tab icon={<People />} value="/account" />
                </Tabs>
                <AvatarMenu />
            </nav>
            <Container
                maxWidth={false}
                sx={{
                    width: "100%",
                    maxWidth: "100%",
                    bgcolor: "#E4E6EB",
                    mt: "80px",
                    p: 2,
                    minHeight: "calc(100vh - 80px)",
                }}
            >
                <Outlet />
            </Container>
        </Box>
    );
};

export default MainLayout;
