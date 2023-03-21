import { CallSharp, VideoCallSharp } from "@mui/icons-material";
import { Box, Typography } from "@mui/material";
import { getTime } from "../../utils/getTime";
import { Media } from "../Media";

interface Props {
    id: number;
    text?: string;
    media?: string;
    mediaType?: string;
    ownMessage: boolean;
    createdAt: string;
    callType?: string;
    callDuration?: number;
}

export const Message = ({
    id,
    text,
    media,
    mediaType,
    ownMessage,
    createdAt,
    callType,
    callDuration,
}: Props) => {
    const getDuration = () => {
        if (callDuration === undefined) return;
        if (callDuration < 60)
            return `${callDuration} sec${callDuration > 1 ? "s" : ""}`;
        const mins = Math.ceil(callDuration / 60);
        if (callDuration < 3600) return `${mins} min${mins > 1 ? "s" : ""}`;
        const hr = Math.ceil(callDuration / 3600);
        return `${hr} hr${hr > 1 ? "s" : ""}`;
    };
    return (
        <Box
            id={`msg-${id}`}
            alignSelf={ownMessage ? "flex-end" : "flex-start"}
            m={1}
            maxWidth="60%"
            minWidth="200px"
        >
            <Typography textAlign="center" fontSize={10} fontWeight={200}>
                {getTime(createdAt)}
            </Typography>

            {callType && (
                <Box
                    p={2}
                    bgcolor="#ccc"
                    borderRadius="5px"
                    display="flex"
                    alignItems="center"
                >
                    <Box mr={3}>
                        <Typography
                            maxWidth="100%"
                            component="span"
                            fontFamily="Roboto !important"
                            fontSize={14}
                        >
                            {ownMessage ? "Outgoing" : "Incoming"}
                            {callType === "video-call" ? " Video " : " Audio "}
                            Call
                        </Typography>
                        <Typography
                            maxWidth="100%"
                            fontFamily="Roboto !important"
                            fontSize={12}
                        >
                            {getDuration()}
                        </Typography>
                    </Box>
                    <Box>
                        {callType === "video-call" ? (
                            <VideoCallSharp />
                        ) : (
                            <CallSharp />
                        )}
                    </Box>
                </Box>
            )}
            {text && (
                <Box p={1} bgcolor="#ccc" borderRadius="5px">
                    <Typography
                        maxWidth="100%"
                        component="span"
                        fontFamily="Roboto !important"
                    >
                        {text}
                    </Typography>
                </Box>
            )}
            {media && (
                <Box
                    p={1}
                    maxWidth="60%"
                    pt={1}
                    {...{ [ownMessage ? "ml" : "mr"]: "auto" }}
                >
                    <Media mediaType={mediaType} mediaPath={media} playable />
                </Box>
            )}
        </Box>
    );
};
