import {
    Button,
    Card,
    CardContent,
    Divider,
    IconButton,
    Modal,
    TextareaAutosize,
} from "@mui/material";
import { css } from "@emotion/css";
import { AddAPhoto } from "@mui/icons-material";
import { RootState } from "../../store/store";
import { useSelector } from "react-redux";
import { gql, useMutation } from "@apollo/client";
import { useEffect, useState } from "react";
import { ErrorDisplay } from "../ErrorDisplayer";
import { UploadMedia } from "../UploadMedia";
import { Media } from "../Media";

const CREATE_POST = gql`
    mutation ($content: String, $media: Upload) {
        createPost(content: $content, media: $media) {
            id
        }
    }
`;

export const CreatPost = () => {
    const [createPost, { data, error, loading, reset }] =
        useMutation(CREATE_POST);
    const [content, setContent] = useState<string>("");
    const [media, setMedia] = useState<{ type: string; media: Blob } | null>();
    const [mediaPath, setMediaPath] = useState<null | string>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const { name } = useSelector((state: RootState) => state.user);

    useEffect(() => {
        if (loading) return;
        if (data) {
            resetForm();
            setModalOpen(false);
        }
    }, [loading]);

    const post = () => {
        reset();
        createPost({
            variables: {
                content,
                media: media?.media,
            },
        });
    };

    const resetForm = () => {
        reset();
        setMedia(null);
        setMediaPath(null);
        setContent("");
        setModalOpen(false);
    };

    return (
        <>
            <Button
                variant="contained"
                sx={{ marginLeft: "auto", display: "block" }}
                onClick={() => setModalOpen(true)}
            >
                Create Post
            </Button>
            <Modal
                open={modalOpen}
                onClose={() => {
                    resetForm();
                }}
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Card
                    sx={{
                        width: "500px",
                        height: "400px",
                        textAlign: "center",
                        paddingBottom: "100px",
                        position: "relative",
                    }}
                >
                    <h2>Create Post</h2>
                    <CardContent
                        sx={{
                            overflow: "auto",
                            height: "80%",
                        }}
                    >
                        <Divider />
                        <TextareaAutosize
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className={css({
                                fontFamily: "Roboto",
                                width: "90%",
                                margin: "10px",
                                resize: "none",
                                border: "none",
                                ":focus": { outline: "none" },
                            })}
                            placeholder={`What's on your mind, ${name}?`}
                        ></TextareaAutosize>
                        <Media mediaPath={mediaPath} mediaType={media?.type} />
                    </CardContent>
                    <div
                        className={css({
                            position: "absolute",
                            right: "0",
                            left: "0",
                            bottom: "0",
                            marginBottom: "10px",
                        })}
                    >
                        <ErrorDisplay content={error?.message} />
                        <Button
                            variant="contained"
                            sx={{ width: "calc(90% - 30px)" }}
                            onClick={post}
                            disabled={loading}
                        >
                            Post
                        </Button>
                        <UploadMedia
                            setMedia={setMedia}
                            setMediaPath={setMediaPath}
                        />
                    </div>
                </Card>
            </Modal>
        </>
    );
};
