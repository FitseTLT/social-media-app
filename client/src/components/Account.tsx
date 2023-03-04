import {
    Button,
    Card,
    Container,
    Divider,
    IconButton,
    Modal,
    TextareaAutosize,
} from "@mui/material";
import { useState, useEffect } from "react";
import { RootState } from "../store/store";
import { useSelector } from "react-redux";
import { css } from "@emotion/css";
import { AddAPhoto } from "@mui/icons-material";
import { gql, useMutation } from "@apollo/client";
import { ErrorDisplay } from "./ErrorDisplayer";
import { useNavigate } from "react-router-dom";

const CREATE_POST = gql`
    mutation ($content: String, $media: Upload) {
        createPost(content: $content, media: $media) {
            id
        }
    }
`;

export const Account = () => {
    const { name } = useSelector((state: RootState) => state.user);
    const [modalOpen, setModalOpen] = useState(false);
    const [content, setContent] = useState<string>("");
    const [media, setMedia] = useState<{ type: string; media: Blob } | null>();
    const [mediaPath, setMediaPath] = useState<null | string>(null);
    const [createPost, { data, error, loading, reset }] =
        useMutation(CREATE_POST);

    const selectMedia = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setMedia({
            type: file.type,
            media: file,
        });
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onloadend = () => {
            setMediaPath(reader.result as string);
        };
    };

    useEffect(() => {
        if (loading) return;
        if (data) {
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

    return (
        <Container maxWidth="sm">
            <Button
                variant="contained"
                sx={{ marginLeft: "auto", display: "block" }}
                onClick={() => setModalOpen(true)}
            >
                Create Post
            </Button>
            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
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
                        paddingBottom: "40px",
                        position: "relative",
                    }}
                >
                    <h2>Create Post</h2>
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
                    {mediaPath && media?.type.includes("video") && (
                        <video
                            className={css({
                                width: "90%",
                            })}
                            src={mediaPath}
                        ></video>
                    )}
                    {mediaPath && media?.type.includes("image") && (
                        <img
                            src={mediaPath}
                            className={css({ width: "90%" })}
                        />
                    )}
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
                        <IconButton
                            sx={{
                                marginLeft: "10px",
                                marginRight: "10px",
                                ":focus": { outline: "none" },
                            }}
                        >
                            <label htmlFor="media">
                                <AddAPhoto />
                            </label>
                        </IconButton>
                        <input
                            id="media"
                            type="file"
                            hidden={true}
                            onChange={selectMedia}
                        />
                    </div>
                </Card>
            </Modal>
        </Container>
    );
};
