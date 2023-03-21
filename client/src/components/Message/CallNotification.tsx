import { Call, CallEnd } from "@mui/icons-material";
import { IconButton, Snackbar } from "@mui/material";
import { Box } from "@mui/system";
import { useDispatch, useSelector } from "react-redux";
import { socket } from "../../socket/setupSocket";
import { answerCall } from "../../socket/setupWebRTC";

import {
    CallStatus,
    CallType,
    rejectCall,
    startCall,
} from "../../store/callSlice";
import { RootState } from "../../store/store";

export const CallNotification = () => {
    const { call } = useSelector((state: RootState) => state);

    return (
        <>
            {Object.entries(call.call).map(([id, call]) => (
                <Snackbar
                    key={id}
                    message={`${
                        call.callType === CallType.VideoCall
                            ? "Video Call: "
                            : ""
                    }${call.name} is calling`}
                    open={call.callStatus === CallStatus.ReceivingCall}
                    action={<CallActions friendId={Number(id)} call={call} />}
                    sx={{
                        background: "#aaa",
                    }}
                    color="#aaa"
                ></Snackbar>
            ))}
        </>
    );
};

const CallActions = ({
    friendId,
    call,
}: {
    friendId: number;
    call: {
        name?: string;
        picture?: string;
        callType: CallType;
        offer: RTCSessionDescriptionInit;
    };
}) => {
    const { id } = useSelector((state: RootState) => state.user);
    const dispatch = useDispatch();
    const answer = async () => {
        dispatch(
            startCall({
                id: friendId,
                name: call.name,
                picture: call.picture,
                isCaller: false,
                callType: call.callType,
                onCall: true,
                offer: call.offer,
            })
        );
        answerCall({
            friendId,
            offer: call.offer,
            id,
            callType: call.callType,
        });
    };

    const endCall = () => {
        dispatch(rejectCall(friendId));
        socket.emit("end-call", friendId);
    };

    return (
        <Box my={1}>
            <IconButton
                sx={{
                    backgroundColor: "green",
                    mr: 2,
                    ":hover": { backgroundColor: "green", opacity: 0.8 },
                }}
                onClick={answer}
            >
                <Call />
            </IconButton>
            <IconButton
                sx={{
                    backgroundColor: "red",
                    color: "#ddd",
                    ":hover": { backgroundColor: "red", opacity: 0.8 },
                }}
                onClick={endCall}
            >
                <CallEnd />
            </IconButton>
        </Box>
    );
};
