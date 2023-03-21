import {
    CallType,
    endCall,
    receiveAnswer,
    receivingCall,
} from "../store/callSlice";
import { AppDispatch } from "../store/store";
import { socket } from "./setupSocket";

const rtcConfiguration = {
    iceServers: [
        { urls: "stun:stun.stunprotocol.org:3478" },
        { urls: "stun:stun.l.google.com:19302" },
    ],
};
export var localStream: { stream?: MediaStream; sender?: RTCRtpSender },
    localVideo: HTMLVideoElement;
export var onCallFriendId: number | null = null;
export var remoteVideo: HTMLVideoElement;
export var supportsFaceMode = false;
export var remoteAudio: HTMLAudioElement;

export let webRTC_Connection: RTCPeerConnection;

export const setupWebRTC = async (dispatch: AppDispatch) => {
    socket.on("offer", async (data) => {
        dispatch(receivingCall(data));
    });

    socket.on("candidate", (candidate) => {
        webRTC_Connection?.addIceCandidate(new RTCIceCandidate(candidate));
    });

    socket.on("answer", ({ id, answer, isAnswer }) => {
        dispatch(receiveAnswer({ isAnswer, answer, id }));
        webRTC_Connection.setRemoteDescription(
            new RTCSessionDescription(answer)
        );
    });

    socket.on("end-call", (friendId) => hangUp(dispatch, friendId));
};

export const hangUp = (dispatch: AppDispatch, friendId: number) => {
    if (friendId !== onCallFriendId) return;
    onCallFriendId = null;
    if (webRTC_Connection) {
        webRTC_Connection.close();
        webRTC_Connection.onicecandidate = null;
        webRTC_Connection.ontrack = null;
    }
    if (localVideo?.srcObject)
        (localVideo.srcObject as MediaStream).getTracks().forEach((track) => {
            track.stop();
            (localVideo.srcObject as MediaStream).removeTrack(track);
        });
    if (remoteVideo?.srcObject)
        (remoteVideo.srcObject as MediaStream).getTracks().forEach((track) => {
            track.stop();
            (remoteVideo.srcObject as MediaStream).removeTrack(track);
        });

    if (remoteAudio?.srcObject)
        (remoteAudio.srcObject as MediaStream).getTracks().forEach((track) => {
            track.stop();
            (remoteAudio.srcObject as MediaStream).removeTrack(track);
        });

    if (localVideo) {
        localStream.stream
            ?.getTracks()
            .forEach((track) => localStream.stream?.removeTrack(track));
        localStream.stream = undefined;
        localVideo.srcObject = null;
        remoteVideo.srcObject = null;
    }
    if (remoteAudio) {
        remoteAudio.srcObject = null;
    }
    dispatch(endCall());
};

export const setupConnection = async (friendId: number, callType: CallType) => {
    webRTC_Connection = new RTCPeerConnection(rtcConfiguration);

    onCallFriendId = friendId;

    const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: callType === CallType.VideoCall,
    });
    if (callType === CallType.VideoCall) {
        localVideo = document.querySelector("#local-box") as HTMLVideoElement;
        remoteVideo = document.querySelector("#remote-box") as HTMLVideoElement;

        supportsFaceMode =
            !!navigator.mediaDevices.getSupportedConstraints().facingMode;

        localStream = { stream };

        localVideo.srcObject = stream;

        webRTC_Connection.addTrack(stream.getAudioTracks()[0], stream);

        localStream.sender = webRTC_Connection.addTrack(
            stream.getVideoTracks()[0],
            stream
        );
        webRTC_Connection.ontrack = (event) => {
            remoteVideo.srcObject = event.streams[0];
        };
    } else {
        remoteAudio = document.querySelector(
            "#remote-audio"
        ) as HTMLAudioElement;

        webRTC_Connection.addTrack(stream.getAudioTracks()[0], stream);
        webRTC_Connection.ontrack = (event) => {
            remoteAudio.srcObject = event.streams[0];
        };
    }
    webRTC_Connection.onicecandidate = (ev) => {
        if (ev.candidate) socket.emit("candidate", friendId, ev.candidate);
    };
};

export const makeCall = async ({
    friendId,
    id,
    name,
    picture,
    callType,
}: {
    friendId: number;
    id?: number;
    name?: string;
    picture?: string;
    callType: CallType;
}) => {
    setTimeout(async () => {
        await setupConnection(friendId, callType);
        webRTC_Connection.createOffer().then((offer) => {
            webRTC_Connection.setLocalDescription(offer);

            socket.emit("offer", friendId, {
                id,
                name,
                picture,
                offer,
                callType,
            });
        });
    });
};

export const answerCall = async ({
    friendId,
    offer,
    id,
    callType,
}: {
    id?: number;
    friendId: number;
    offer: RTCSessionDescriptionInit;
    callType: CallType;
}) => {
    setTimeout(async () => {
        await setupConnection(friendId, callType);
        await webRTC_Connection.setRemoteDescription(
            new RTCSessionDescription(offer)
        );
        webRTC_Connection.createAnswer().then(async (answer) => {
            await webRTC_Connection.setLocalDescription(answer);
            socket.emit("answer", friendId, {
                id,
                answer,
                isAnswer: true,
            });
        });
    });
};
