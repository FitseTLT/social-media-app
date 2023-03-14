import { Avatar, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { getTime } from "../../utils/getTime";
import { Media } from "../Media";
import { CommentType } from "./CreateComment";

export const Comment = ({
    comment: { content, media, mediaType, User, createdAt },
    prevId,
}: {
    comment: CommentType;
    prevId?: number;
}) => {
    return (
        <Box ml={2} mt={2} display="flex" width={"100%"}>
            <Box sx={{ width: "30px", height: "30px" }}>
                {prevId !== User.id && (
                    <Avatar
                        src={User?.picture}
                        sx={{ width: "100%", height: "100%" }}
                    />
                )}
            </Box>
            <Box ml={1}>
                <Box
                    sx={{
                        borderRadius: "10px",
                        bgcolor: "#eee",
                        p: 1,
                        minWidth: "150px",
                        maxWidth: "60%",
                        " > *": { fontFamily: "Roboto !important" },
                    }}
                >
                    <Typography
                        component={"div"}
                        fontWeight={600}
                        fontSize={13}
                        whiteSpace="pre-wrap"
                    >
                        {User?.name}
                    </Typography>
                    <Typography fontSize={12}>{content}</Typography>
                </Box>
                <Box width={"100px"} mb={"5px"}>
                    <Media mediaPath={media} mediaType={mediaType} />
                </Box>
                <Typography fontSize={9} ml={"10px"}>
                    {getTime(createdAt)}
                </Typography>
            </Box>
        </Box>
    );
};
