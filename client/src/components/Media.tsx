import { css } from "@emotion/react";
import { Box } from "@mui/material";

interface Props {
    mediaType: string | undefined;
    mediaPath: string | null | undefined;
    width?: string;
    playable?: boolean;
}

export const Media = ({
    mediaType,
    mediaPath,
    width,
    playable = false,
}: Props) => {
    if (!mediaPath) return null;

    return (
        <Box
            sx={{
                width: width || "100%",
                maxHeight: "300px",
                overflow: "hidden",
                "> a > img,video": { width: "100%" },
            }}
        >
            {mediaPath && mediaType?.includes("video") && (
                <a href={mediaPath}>
                    <video src={mediaPath} controls={playable}></video>
                </a>
            )}
            {mediaPath && mediaType?.includes("image") && (
                <a href={mediaPath}>
                    <img src={mediaPath} />
                </a>
            )}
        </Box>
    );
};
