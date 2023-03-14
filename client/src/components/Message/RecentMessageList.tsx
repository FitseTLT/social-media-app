import { css } from "@emotion/css";
import { Box, Container, Divider, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { RootState } from "../../store/store";
import { UserAvatar } from "../UserAvatar";

export const RecentMessageList = () => {
    const recentMessages = useSelector(
        (state: RootState) => state.message.recentMessages
    );

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
