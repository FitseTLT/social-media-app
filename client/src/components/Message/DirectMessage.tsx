import { gql, useMutation } from "@apollo/client";
import { css } from "@emotion/css";
import { KeyboardArrowDown } from "@mui/icons-material";
import { Divider, Typography } from "@mui/material";
import { Box, Container } from "@mui/system";
import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { Socket } from "socket.io-client";
import { useScrollFetch } from "../../hooks/useScrollFetch";
import { createMessage, setMessages } from "../../store/messageSlice";
import { RootState } from "../../store/store";
import { getTime } from "../../utils/getTime";
import { Media } from "../Media";
import { UploadMedia } from "../UploadMedia";
import { UserAvatar } from "../UserAvatar";
import { Message } from "./Message";

const CREATE_MESSAGE = gql`
    mutation ($receiverId: Int!, $text: String, $media: Upload) {
        createMessage(receiverId: $receiverId, text: $text, media: $media) {
            id
            receiverId
            senderId
            text
            media
            mediaType
            createdAt
        }
    }
`;

const LIST_MESSAGES = gql`
    query ($friendId: Int!, $cursor: String, $isNextPage: Boolean) {
        listMessages(
            friendId: $friendId
            cursor: $cursor
            isNextPage: $isNextPage
        ) {
            id
            text
            media
            mediaType
            senderId
            receiverId
            createdAt
            isRead
            cursor
        }
    }
`;

export const DirectMessage = ({ socket }: { socket: Socket }) => {
    const [media, setMedia] = useState<{ type: string; media: Blob } | null>();
    const [mediaPath, setMediaPath] = useState<null | string>(null);
    const param = useParams();
    const friendId = Number(param.friendId);
    const { user, message } = useSelector((state: RootState) => state);
    const recentMessage = message?.recentMessages.find(
        (msg) => msg.friendId === Number(friendId)
    );
    const dispatch = useDispatch();
    const pageInfo = useRef<{ startCursor?: string; endCursor?: string }>({});

    const [create] = useMutation(CREATE_MESSAGE, {
        onCompleted({ createMessage: data }) {
            dispatch(
                createMessage({
                    friendId,
                    id: data.id,
                    senderId: data.senderId,
                    receiverId: data.receiverId,
                    text: data.text,
                    media: data.media,
                    mediaType: data.mediaType,
                })
            );
        },
    });
    const scrollEl = useRef<HTMLElement | null>(null);
    const unreadRef = useRef<HTMLElement | null>(null);

    const { data, refAnchor, refAnchor2, hasNextPage, hasPreviousPage } =
        useScrollFetch({
            QUERY: LIST_MESSAGES,
            variables: { friendId },
            scrollEl,
            onWindow: false,
            mergeData: false,
            pageInfo: pageInfo.current,
            twoWayScroll: true,
        });

    useEffect(() => {
        if (data)
            dispatch(
                setMessages({
                    friendId,
                    messages: data?.listMessages,
                })
            );
    }, [data]);

    useEffect(() => {
        const page = message.messages?.[friendId]?.pageInfo;
        pageInfo.current.startCursor = page?.startCursor;
        pageInfo.current.endCursor = page?.endCursor;
    }, [message.messages?.[friendId]]);

    useLayoutEffect(() => {
        unreadRef.current?.scrollIntoView();
        // scrollEl.current?.scroll({ top: scrollEl.current.scrollHeight - 30 });
    }, [scrollEl.current, message.messages]);

    const sendMessage = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            const text = e.currentTarget.value;
            if (!text && !media) return;
            create({
                variables: {
                    senderId: user.id,
                    receiverId: friendId,
                    text,
                    media: media?.media,
                },
            });
            e.currentTarget.value = "";
            setMedia(null);
            setMediaPath(null);
        }
    };

    return (
        <Container
            maxWidth="sm"
            sx={{
                display: "flex",
                alignContent: "center",
                flexDirection: "column",
                height: "calc(100vh - 112px)",
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "row",
                    padding: "15px",
                    borderRadius: "15px",
                    position: "relative",
                }}
            >
                <UserAvatar
                    id={recentMessage?.friendId}
                    picture={recentMessage?.picture}
                />
                <Box ml={3}>
                    <Typography color={"#121212"}>
                        {recentMessage?.name}
                    </Typography>
                </Box>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box flexGrow={1} overflow="auto" ref={scrollEl}>
                <Box display="flex" flexDirection="column">
                    {hasPreviousPage && (
                        <Typography
                            textAlign="center"
                            fontSize={12}
                            ref={refAnchor}
                        >
                            Loading ...
                        </Typography>
                    )}
                    {message.messages?.[friendId]?.messages?.map(
                        (
                            {
                                id,
                                text,
                                media,
                                mediaType,
                                senderId,
                                isRead,
                                createdAt,
                            },
                            index
                        ) => {
                            return (
                                <Fragment key={id}>
                                    {isRead === false &&
                                        (index === 0 ||
                                            message.messages?.[friendId]
                                                ?.messages?.[index - 1]
                                                ?.isRead) && (
                                            <Box
                                                bgcolor="#ddd"
                                                display="flex"
                                                alignItems={"center"}
                                                justifyContent="center"
                                                borderRadius="5px"
                                                width="80%"
                                                mx="auto"
                                            >
                                                <Typography
                                                    component={"span"}
                                                    ref={unreadRef}
                                                    textAlign="center"
                                                    fontSize={11}
                                                    display="inline-block"
                                                    ml="auto"
                                                >
                                                    Unread Messages
                                                </Typography>
                                                <KeyboardArrowDown
                                                    sx={{
                                                        ml: "auto",
                                                        mr: "40px",
                                                    }}
                                                />
                                            </Box>
                                        )}
                                    {getTime(createdAt)},{isRead?.toString()}
                                    <Message
                                        text={text}
                                        media={media}
                                        mediaType={mediaType}
                                        ownMessage={senderId === user.id}
                                    />
                                </Fragment>
                            );
                        }
                    )}
                    {hasNextPage && (
                        <Typography
                            textAlign="center"
                            fontSize={12}
                            ref={refAnchor2}
                        >
                            Loading ...
                        </Typography>
                    )}
                </Box>
            </Box>
            <Box>
                <Media
                    width="50px"
                    mediaPath={mediaPath}
                    mediaType={media?.type}
                />
                <Box display={"flex"} alignItems="center" px={3}>
                    <input
                        className={`message-input ${css({ flexGrow: 1 })}`}
                        placeholder="Type Message here"
                        onKeyDown={sendMessage}
                    ></input>
                    <UploadMedia
                        setMedia={setMedia}
                        setMediaPath={setMediaPath}
                    />
                </Box>
            </Box>
        </Container>
    );
};
