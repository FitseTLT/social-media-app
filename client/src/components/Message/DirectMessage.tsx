import { gql, useMutation } from "@apollo/client";
import { css } from "@emotion/css";
import {
    CallSharp,
    KeyboardArrowDown,
    MoreVert,
    VideoCallSharp,
} from "@mui/icons-material";
import {
    Divider,
    IconButton,
    Menu,
    MenuItem,
    MenuList,
    Typography,
} from "@mui/material";
import { Box, Container } from "@mui/system";
import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useScrollFetch } from "../../hooks/useScrollFetch";
import {
    createMessage,
    setAllMessagesAsRead,
    setMessageAsRead,
    setMessages,
} from "../../store/messageSlice";
import { RootState } from "../../store/store";
import { Media } from "../Media";
import { UploadMedia } from "../UploadMedia";
import { UserAvatar } from "../UserAvatar";
import { Message } from "./Message";
import { CallType, startCall } from "../../store/callSlice";
import { makeCall } from "../../socket/setupWebRTC";
import { OnlineStatus } from "../../store/userSlice";

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
            callType
            callDuration
        }
    }
`;

const SET_AS_READ = gql`
    mutation ($messageId: Int!) {
        setAsRead(messageId: $messageId) {
            id
        }
    }
`;

const SET_ALL_AS_READ = gql`
    mutation ($friendId: Int!) {
        setAllAsRead(friendId: $friendId) {
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

export const DirectMessage = () => {
    const [media, setMedia] = useState<{ type: string; media: Blob } | null>();
    const [mediaPath, setMediaPath] = useState<null | string>(null);
    const param = useParams();
    const friendId = Number(param.friendId);
    const { user, message } = useSelector((state: RootState) => state);
    const online =
        user.friendsStatus.find(({ userId }) => userId === friendId)?.status ===
        OnlineStatus.Connected;
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
                    createdAt: data.createdAt,
                })
            );
        },
    });
    const scrollEl = useRef<HTMLElement | null>(null);
    const scrolledToBottomRef = useRef<boolean>(true);

    const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

    const msgIdsList = useRef<number[]>([]);

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

    const [setAsRead] = useMutation(SET_AS_READ, {
        onCompleted(data) {
            const id = data?.setAsRead?.id;
            if (id) dispatch(setMessageAsRead({ friendId, id }));
        },
    });
    const [setAllAsRead] = useMutation(SET_ALL_AS_READ, {
        onCompleted(data) {
            const messages = data?.setAllAsRead;
            if (messages)
                dispatch(setAllMessagesAsRead({ friendId, messages }));
        },
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

    const handleSetAllAsRead = () => {
        setAllAsRead({ variables: { friendId } });
        scrollEl.current?.scroll({ top: scrollEl.current.scrollHeight });
    };

    const handleMessageRead = () => {
        if (!scrollEl.current) return;
        if (
            scrollEl.current?.scrollTop + scrollEl.current?.clientHeight + 10 >
            scrollEl.current?.scrollHeight
        )
            scrolledToBottomRef.current = true;
        else scrolledToBottomRef.current = false;

        if (!scrollEl.current || !msgIdsList?.current.length) return;
        const scrollRect = scrollEl.current.getBoundingClientRect();
        const ids: number[] = [];
        msgIdsList.current.forEach((id) => {
            const el = scrollEl.current?.querySelector(`#msg-${id}`);
            if (el) {
                const elRect = el.getBoundingClientRect();
                if (elRect.top < scrollRect.bottom) {
                    ids.push(id);
                    setAsRead({ variables: { messageId: id } });
                }
            }
        });
        msgIdsList.current = msgIdsList.current.filter(
            (id) => !ids.includes(id)
        );
    };

    useEffect(() => {
        scrollEl.current?.addEventListener("scroll", handleMessageRead);
        return () =>
            scrollEl.current?.removeEventListener("scroll", handleMessageRead);
    }, []);

    useLayoutEffect(() => {
        scrollEl.current?.scroll({
            top: scrollEl.current.scrollHeight,
        });
    }, []);

    useLayoutEffect(() => {
        if (scrolledToBottomRef.current)
            scrollEl.current?.scroll({
                top: scrollEl.current.scrollHeight,
            });
    }, [message.messages]);

    useEffect(() => {
        msgIdsList.current =
            message?.messages?.[friendId]?.messages
                .filter((msg) => !msg.isRead && msg.senderId === friendId)
                .map((msg) => msg.id) || [];
        handleMessageRead();
    }, [message]);

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

    const call = (callType: CallType) => {
        dispatch(
            startCall({
                callType,
                isCaller: true,
                id: friendId,
                name: recentMessage?.name,
                picture: recentMessage?.picture,
                onCall: false,
            })
        );
        makeCall({
            friendId,
            id: user.id,
            name: user.name,
            picture: user.picture,
            callType,
        });
    };

    return (
        <Container
            maxWidth="sm"
            sx={{
                display: "flex",
                alignContent: "center",
                flexDirection: "column",
                height: "calc(100vh - 112px)",
                position: "relative",
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "row",
                    padding: "15px",
                    borderRadius: "15px",
                    position: "relative",
                    alignItems: "center",
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
                <IconButton
                    sx={{ ml: "auto" }}
                    onClick={(e) => setMenuAnchor(e.currentTarget)}
                >
                    <MoreVert />
                </IconButton>
                <Menu
                    open={!!menuAnchor}
                    anchorEl={menuAnchor}
                    onClose={() => setMenuAnchor(null)}
                >
                    <MenuList>
                        <MenuItem
                            disabled={!online}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                mb: 1,
                            }}
                            onClick={() => {
                                call(CallType.AudioCall);
                                setMenuAnchor(null);
                            }}
                        >
                            <CallSharp />
                            <Typography>Call</Typography>
                        </MenuItem>
                        <MenuItem
                            disabled={!online}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                            }}
                            onClick={() => {
                                call(CallType.VideoCall);
                                setMenuAnchor(null);
                            }}
                        >
                            <VideoCallSharp />
                            <Typography ml={2}>Video Call</Typography>
                        </MenuItem>
                    </MenuList>
                </Menu>
            </Box>
            <Divider sx={{ my: 1 }} />

            <>
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
                            ({
                                id,
                                text,
                                media,
                                mediaType,
                                senderId,
                                createdAt,
                                callType,
                                callDuration,
                            }) => {
                                return (
                                    <Fragment key={id}>
                                        <Message
                                            id={id}
                                            createdAt={createdAt}
                                            text={text}
                                            media={media}
                                            mediaType={mediaType}
                                            ownMessage={senderId === user.id}
                                            callType={callType}
                                            callDuration={callDuration}
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
                        {(message?.recentMessages?.find(
                            (msg) => msg?.friendId === friendId
                        )?.unreadMessages || 0) > 0 && (
                            <Box
                                sx={{
                                    position: "absolute",
                                    bottom: 90,
                                    right: 70,
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                }}
                            >
                                <Box
                                    sx={{
                                        fontSize: "12px",
                                        width: "25px",
                                        height: "25px",
                                        borderRadius: "50%",
                                        background: "#0B85EE",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        mb: "5px",
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            fontSize: "12px",
                                            color: "white",
                                        }}
                                    >
                                        {
                                            message?.recentMessages?.find(
                                                (msg) =>
                                                    msg.friendId === friendId
                                            )?.unreadMessages
                                        }
                                    </Typography>
                                </Box>
                                <Box
                                    sx={{
                                        fontSize: "12px",
                                        width: "35px",
                                        height: "35px",
                                        borderRadius: "50%",
                                        background: "#0B85EE",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <IconButton
                                        onClick={handleSetAllAsRead}
                                        sx={{
                                            ":focus": { outline: "none" },
                                        }}
                                    >
                                        <KeyboardArrowDown
                                            sx={{ color: "white" }}
                                        />
                                    </IconButton>
                                </Box>
                            </Box>
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
                            className={`message-input ${css({
                                flexGrow: 1,
                            })}`}
                            placeholder="Type Message here"
                            onKeyDown={sendMessage}
                        ></input>
                        <UploadMedia
                            setMedia={setMedia}
                            setMediaPath={setMediaPath}
                        />
                    </Box>
                </Box>
            </>
        </Container>
    );
};
