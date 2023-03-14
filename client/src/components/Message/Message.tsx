import { Box, Typography } from "@mui/material";
import { Media } from "../Media";

interface Props {
    text?: string;
    media?: string;
    mediaType?: string;
    ownMessage: boolean;
}

export const Message = ({ text, media, mediaType, ownMessage }: Props) => {
    return (
        <Box
            alignSelf={ownMessage ? "flex-end" : "flex-start"}
            m={1}
            maxWidth="60%"
            minWidth="200px"
        >
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
                <Box p={1} maxWidth="60%" pt={1} ml="auto">
                    <Media mediaType={mediaType} mediaPath={media} />
                </Box>
            )}
        </Box>
    );
};
