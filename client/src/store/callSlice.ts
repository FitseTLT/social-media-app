import { createSlice } from "@reduxjs/toolkit";

export enum CallStatus {
    Disconnected = "disconnected",
    ReceivingCall = "receiving",
    OnCall = "on-call",
}

export enum CallType {
    AudioCall = "audio-call",
    VideoCall = "video-call",
}

interface CallState {
    call: {
        [friendId: number]: {
            name?: string;
            picture?: string;
            callStatus: CallStatus;
            offer: RTCSessionDescriptionInit;
            callType: CallType;
        };
    };
    onCall?: {
        isCaller: boolean;
        callType: CallType;
        id: number;
        name?: string;
        picture?: string;
        onCall: boolean;
        offer: RTCSessionDescriptionInit;
        answer?: RTCSessionDescriptionInit;
    };
}

const initialState: CallState = {
    call: {},
};

const callSlice = createSlice({
    name: "call",
    initialState,
    reducers: {
        receivingCall(state, { payload }) {
            const { name, picture, id, offer, callType } = payload;
            state.call[id] = {
                name,
                picture,
                offer,
                callStatus: CallStatus.ReceivingCall,
                callType,
            };
        },
        startCall(state, { payload }) {
            state.onCall = payload;
            if (state.call?.[payload.id]) delete state.call[payload.id];
        },
        rejectCall(state, { payload: id }) {
            delete state.call[id];
        },
        receiveAnswer(state, { payload }) {
            const { isAnswer, answer, id } = payload;

            if (!state.onCall || id !== state.onCall.id) return;
            if (isAnswer) {
                state.onCall.onCall = true;
                state.onCall.answer = answer;
            } else delete state.onCall;
        },
        endCall(state) {
            delete state.onCall;
        },
    },
});

export const { receivingCall, startCall, receiveAnswer, endCall, rejectCall } =
    callSlice.actions;

export default callSlice.reducer;
