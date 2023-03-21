import { Box, Snackbar, IconButton, Modal } from "@mui/material";
import { css } from "@emotion/css";
import { Tabs, Tab, Typography } from "@mui/material";
import { ChatBubble, Close, Home, People } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client/core";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentUser } from "../store/userSlice";
import { AvatarMenu } from "./AvatarMenu";
import { RootState } from "../store/store";
import { setupSocket } from "../socket/setupSocket";
import { closeNotification, setTotalUnread } from "../store/messageSlice";
import { CallNotification } from "./Message/CallNotification";
import { CallModal } from "./Message/CallModal";
import { setupWebRTC } from "../socket/setupWebRTC";

const currentUser = gql`
    query {
        getCurrentUser {
            id
            name
            picture
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

const MainLayout = () => {
    const { user, message, call } = useSelector((state: RootState) => state);

    useQuery(GET_TOTAL_UNREAD, {
        onCompleted(data) {
            const friendIdsWithUnreadMsgs =
                data?.getTotalUnread?.friendIdsWithUnread;
            dispatch(setTotalUnread(friendIdsWithUnreadMsgs));
        },
    });
    const { pathname } = useLocation();

    useEffect(() => {
        if (pathname.includes("chat")) setTab("/chat");
        else if (pathname.includes("account")) setTab("/account");
        else setTab("/");
    }, []);

    useEffect(() => {
        if (!user.id) return;

        setupSocket(user.id, dispatch);
        setupWebRTC(dispatch);
    }, [user.id]);

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
                <Box sx={{ display: { xs: "none", sm: "block" } }}>
                    <Link to="/">
                        <Typography component="h3" color="brown" m={2}>
                            Social Media App
                        </Typography>
                    </Link>
                </Box>
                <Tabs
                    sx={{ ml: "20px" }}
                    onChange={(e, value) => {
                        setTab(value);
                    }}
                    value={tab}
                >
                    <Tab
                        icon={<Home />}
                        value="/"
                        onClick={() => {
                            navigate("/");
                        }}
                    />
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
                        onClick={() => {
                            navigate("/chat");
                        }}
                    />

                    <Tab
                        icon={<People />}
                        value="/account"
                        onClick={() => {
                            navigate("/account");
                        }}
                    />
                </Tabs>
                <AvatarMenu />
            </nav>
            <Box
                sx={{
                    width: "100%",
                    maxWidth: "100%",
                    bgcolor: "#E4E6EB",
                    mt: "80px",
                    p: { sm: 2 },
                    py: { xs: 2 },
                    minHeight: "calc(100vh - 80px)",
                    boxSizing: "border-box",
                    display: "flex",
                    justifyContent: "center",
                }}
            >
                <Outlet />
            </Box>
            <CallNotification />
            <Modal open={!!call.onCall}>
                <CallModal />
            </Modal>
        </Box>
    );
};

export default MainLayout;
