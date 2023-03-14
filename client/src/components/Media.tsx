import { css } from "@emotion/react";
import { Box } from "@mui/material";

interface Props {
    mediaType: string | undefined;
    mediaPath: string | null | undefined;
    width?: string;
}

export const Media = ({ mediaType, mediaPath, width }: Props) => {
    if (!mediaPath) return null;

    return (
        <Box
            sx={{
                width: width || "90%",
                maxHeight: "300px",
                overflow: "hidden",
                "> img,video": { width: "100%" },
            }}
        >
            {mediaPath && mediaType?.includes("video") && (
                <video src={mediaPath}></video>
            )}
            {mediaPath && mediaType?.includes("image") && (
                <img src={mediaPath} />
            )}
        </Box>
    );
};
