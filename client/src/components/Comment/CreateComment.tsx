import { gql, useMutation } from "@apollo/client";
import { css } from "@emotion/css";
import { TextareaAutosize } from "@mui/material";
import { Box } from "@mui/system";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Media } from "../Media";
import { UserData } from "../Posts/Post";
import { UploadMedia } from "../UploadMedia";

export interface CommentType {
    id: number;
    content?: string;
    media?: string;
    mediaType?: string;
    createdAt: string;
    User: UserData;
}

interface Props {
    postId: number;
    commentCreated: (comment: CommentType) => void;
}

const CREATE_COMMENT = gql`
    mutation ($postId: Int!, $content: String, $media: Upload) {
        createComment(postId: $postId, content: $content, media: $media) {
            id
            content
            media
            mediaType
            User {
                id
                name
                picture
            }
            createdAt
        }
    }
`;

export const CreateComment = ({ postId, commentCreated }: Props) => {
    const [content, setContent] = useState("");

    const [media, setMedia] = useState<{ type: string; media: Blob } | null>();
    const [mediaPath, setMediaPath] = useState<null | string>(null);
    const [createComment] = useMutation(CREATE_COMMENT, {
        onCompleted(data) {
            commentCreated(Object.values(data)[0] as CommentType);
        },
    });

    const createHandler = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            createComment({
                variables: {
                    postId,
                    content,
                    media: media?.media,
                },
            });
            setContent("");
            setMedia(null);
            setMediaPath("");
            e.preventDefault();
        }
    };

    return (
        <Box>
            <Box
                display="flex"
                flexDirection="row"
                alignItems="center"
                sx={{
                    background: "#ddd",
                    mx: 1,
                    borderRadius: "10px",
                }}
            >
                <TextareaAutosize
                    onKeyDown={createHandler}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className={css({
                        fontFamily: "Roboto",
                        width: "90%",
                        margin: "10px",
                        resize: "none",
                        border: "none",
                        ":focus": { outline: "none" },
                        background: "transparent",
                    })}
                    placeholder={`Write your comment`}
                ></TextareaAutosize>
                <UploadMedia
                    setMedia={setMedia}
                    size="small"
                    setMediaPath={setMediaPath}
                />
            </Box>
            <Box width={100} ml={3} mt={2}>
                <Media mediaPath={mediaPath} mediaType={media?.type} />
            </Box>
        </Box>
    );
};
