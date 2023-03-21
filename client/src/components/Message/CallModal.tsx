import { gql, useMutation } from "@apollo/client";
import { css } from "@emotion/css";
import {
    CallEnd,
    Cameraswitch,
    Mic,
    MicOff,
    Videocam,
    VideocamOff,
} from "@mui/icons-material";
import { IconButton, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { socket } from "../../socket/setupSocket";
import {
    hangUp,
    localStream,
    supportsFaceMode,
} from "../../socket/setupWebRTC";
import { CallType } from "../../store/callSlice";
import { createMessage } from "../../store/messageSlice";
import { RootState } from "../../store/store";

const CREATE_MESSAGE = gql`
    mutation (
        $receiverId: Int!
        $callType: String!
        $callDuration: Int!
        $callerId: Int!
    ) {
        createMessage(
            receiverId: $receiverId
            callType: $callType
            callDuration: $callDuration
            callerId: $callerId
        ) {
            id
            receiverId
            senderId
            text
            media
            mediaType
            createdAt
            callType
            callDuration
        }
    }
`;

export const CallModal = () => {
    const { call, user } = useSelector((state: RootState) => state);
    const dispatch = useDispatch();

    const [timer, setTimer] = useState(0);
    const [audio, setAudio] = useState(true);
    const [video, setVideo] = useState(true);
    const [faceUser, setFaceUser] = useState(true);
    const remoteRef = useRef<HTMLElement | null>(null);
    const localRef = useRef<HTMLElement | null>(null);
    const [isLocalFullScreen, setIsLocalFullScreen] = useState(true);

    const [create] = useMutation(CREATE_MESSAGE, {
        onCompleted({ createMessage: data }) {
            dispatch(
                createMessage({
                    friendId: call.onCall?.id,
                    id: data.id,
                    senderId: data.senderId,
                    receiverId: data.receiverId,
                    text: data.text,
                    media: data.media,
                    mediaType: data.mediaType,
                    createdAt: data.createdAt,
                    callType: data.callType,
                    callDuration: data.callDuration,
                })
            );
        },
    });

    useEffect(() => {
        if (call.onCall?.onCall)
            setTimeout(() => {
                setTimer(timer + 1);
            }, 1000);
    }, [timer]);

    useEffect(() => {
        if (call.onCall?.onCall) {
            setIsLocalFullScreen(false);
            setTimeout(() => {
                setTimer(timer + 1);
            }, 1000);
        }
    }, [call.onCall?.onCall]);

    const toggleVideo = () => {
        const newVideo = !video;
        setVideo(newVideo);
        if (
            localStream.stream &&
            localStream.stream?.getVideoTracks()?.length > 0
        ) {
            localStream.stream.getVideoTracks()[0].enabled = newVideo;
        }
    };

    const toggleAudio = () => {
        const newAudio = !audio;
        setAudio(newAudio);
        if (
            localStream.stream &&
            localStream.stream?.getAudioTracks()?.length > 0
        ) {
            localStream.stream.getAudioTracks()[0].enabled = newAudio;
        }
    };

    const flipCamera = () => {
        if (
            !supportsFaceMode ||
            !(call.onCall?.callType === CallType.VideoCall)
        )
            return;
        if (localStream.stream) {
            localStream.stream.getVideoTracks()?.[0].stop();
        }

        const newFaceUser = !faceUser;
        setFaceUser(newFaceUser);
        navigator.mediaDevices
            .getUserMedia({
                video: { facingMode: newFaceUser ? "user" : "environment" },
            })
            .then((stream) => {
                const videoTrack = stream.getVideoTracks();

                if (localStream.stream && videoTrack.length) {
                    localStream.stream.removeTrack(
                        localStream.stream.getVideoTracks()?.[0]
                    );
                    localStream.stream.addTrack(videoTrack[0]);

                    localStream.sender?.replaceTrack(videoTrack[0]);
                }
            });
    };

    const toggleView = (e: React.MouseEvent<HTMLElement>) => {
        if (
            (isLocalFullScreen && e.currentTarget === remoteRef.current) ||
            (!isLocalFullScreen && e.currentTarget === localRef.current)
        )
            setIsLocalFullScreen(!isLocalFullScreen);
    };

    const endCall = () => {
        hangUp(dispatch, call.onCall?.id!);
        create({
            variables: {
                receiverId: call.onCall?.id,
                callType: call.onCall?.callType,
                callDuration: timer,
                callerId: call.onCall?.isCaller ? user.id : call.onCall?.id,
            },
        });
        socket.emit("end-call", call.onCall?.id);
    };

    const getTimer = () => {
        const secs = (timer % 60).toString().padStart(2, "0");
        const mins = Math.floor((timer % 3600) / 60)
            .toString()
            .padStart(2, "0");
        const hrs = Math.floor(timer / 3600)
            .toString()
            .padStart(2, "0");
        return `${timer >= 3600 ? hrs + ":" : ""}${mins}:${secs}`;
    };

    return (
        <>
            <Box
                sx={{
                    backgroundColor: "rgba(0,0,0,0.8)",
                    position: "fixed",
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0,
                    zIndex: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Box
                    sx={{
                        position: "relative",
                        height: "100%",
                        width: "100%",
                        maxWidth: "500px",
                        overflow: "hidden",
                        borderRadius: "15px",
                        "> div.video-box": {
                            display: "flex",
                            justifyContent: "center",
                        },
                    }}
                >
                    <Box position="absolute" width="100%" top="10%">
                        <Typography
                            fontSize="17px"
                            textAlign="center"
                            color="white"
                        >
                            {call.onCall?.name}
                        </Typography>
                        {call.onCall?.onCall && (
                            <Typography
                                fontSize="14px"
                                textAlign="center"
                                color="white"
                            >
                                {getTimer()}
                            </Typography>
                        )}
                        {!call.onCall?.onCall && (
                            <Typography
                                fontSize="14px"
                                textAlign="center"
                                color="white"
                            >
                                Waiting...
                            </Typography>
                        )}
                    </Box>
                    {call.onCall?.callType === CallType.AudioCall && (
                        <audio autoPlay id="remote-audio"></audio>
                    )}
                    {call.onCall?.callType === CallType.VideoCall && (
                        <>
                            <Box
                                className={`video-box ${
                                    isLocalFullScreen ? "mini-box" : "full-box"
                                }`}
                                ref={remoteRef}
                                onClick={toggleView}
                            >
                                <video
                                    autoPlay
                                    id="remote-box"
                                    className={css({
                                        height: "100%",
                                    })}
                                ></video>
                            </Box>
                            <Box
                                onClick={toggleView}
                                ref={localRef}
                                className={`video-box ${
                                    isLocalFullScreen ? "full-box" : "mini-box"
                                }`}
                            >
                                <video
                                    autoPlay
                                    muted
                                    id="local-box"
                                    className={css({ height: "100%" })}
                                ></video>
                            </Box>
                        </>
                    )}
                    <Box
                        sx={{
                            position: "absolute",
                            bottom: "30px",
                            width: "100%",
                            display: "flex",
                            justifyContent: "space-around",
                            zIndex: 2,
                        }}
                    >
                        {call.onCall?.callType === CallType.VideoCall && (
                            <>
                                {supportsFaceMode && (
                                    <IconButton
                                        onClick={flipCamera}
                                        sx={{
                                            backgroundColor: "rgba(0,0,0,.2)",
                                        }}
                                    >
                                        <Cameraswitch sx={{ color: "white" }} />
                                    </IconButton>
                                )}
                                <IconButton onClick={toggleVideo}>
                                    {video ? (
                                        <Videocam sx={{ color: "white" }} />
                                    ) : (
                                        <VideocamOff sx={{ color: "white" }} />
                                    )}
                                </IconButton>
                                <IconButton onClick={toggleAudio}>
                                    {audio ? (
                                        <Mic sx={{ color: "white" }} />
                                    ) : (
                                        <MicOff sx={{ color: "white" }} />
                                    )}
                                </IconButton>
                            </>
                        )}
                        <IconButton
                            sx={{
                                background: "red",
                                ":hover": { background: "red" },
                            }}
                            onClick={endCall}
                        >
                            <CallEnd sx={{ color: "white" }} />
                        </IconButton>
                    </Box>
                </Box>
            </Box>
        </>
    );
};
