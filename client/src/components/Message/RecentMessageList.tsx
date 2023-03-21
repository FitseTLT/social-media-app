import { gql } from "@apollo/client";
import { css } from "@emotion/css";
import { Box, Container, Divider, Typography } from "@mui/material";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useScrollFetch } from "../../hooks/useScrollFetch";
import { setRecentMessages } from "../../store/messageSlice";
import { RootState } from "../../store/store";
import { UserAvatar } from "../UserAvatar";

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

export const RecentMessageList = () => {
    const { data: messagesList } = useScrollFetch({
        QUERY: LIST_RECENT_MESSAGES,
    });
    const recentMessages = useSelector(
        (state: RootState) => state.message.recentMessages
    );
    const dispatch = useDispatch();

    useEffect(() => {
        if (messagesList)
            dispatch(setRecentMessages(messagesList?.listRecentMessages));
    }, [messagesList]);

    return (
        <Container maxWidth="sm" sx={{ mt: 4, minHeight: "100%" }}>
            {recentMessages.map(
                ({ name, friendId, picture, lastMessage, unreadMessages }) => (
                    <Box key={friendId} position="relative">
                        <Link
                            className={css({
                                display: "flex",
                                flexDirection: "row",
                                padding: "15px",
                                ":hover": { backgroundColor: "#aaa" },
                                borderRadius: "15px",
                                position: "relative",
                            })}
                            to={`/chat/${friendId}`}
                        >
                            <UserAvatar id={friendId} picture={picture} />
                            <Box ml={3}>
                                <Typography color={"#121212"}>
                                    {name}
                                </Typography>
                                <Typography
                                    color={"#626262"}
                                    fontSize={12}
                                    ml={1}
                                    maxWidth={"250px"}
                                    textOverflow="ellipsis"
                                    overflow={"hidden"}
                                    whiteSpace="nowrap"
                                    fontFamily={"Roboto !important"}
                                >
                                    {lastMessage}
                                </Typography>
                            </Box>
                            {unreadMessages > 0 && (
                                <Box
                                    sx={{
                                        position: "absolute",
                                        right: 30,
                                        bottom: "50%",
                                        translate: "0 50%",
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
                                        {unreadMessages}
                                    </Typography>
                                </Box>
                            )}
                        </Link>
                        <Divider sx={{ my: 1 }} />
                    </Box>
                )
            )}
        </Container>
    );
};
