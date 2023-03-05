import {
    Box,
    Button,
    Card,
    CardContent,
    Container,
    Divider,
    IconButton,
    Modal,
    Tab,
    Tabs,
    TextareaAutosize,
} from "@mui/material";
import { useState, useEffect } from "react";
import { RootState } from "../store/store";
import { useSelector } from "react-redux";
import { css } from "@emotion/css";
import { AddAPhoto } from "@mui/icons-material";
import { gql, useMutation } from "@apollo/client";
import { ErrorDisplay } from "./ErrorDisplayer";
import { Outlet, useNavigate } from "react-router-dom";

const CREATE_POST = gql`
    mutation ($content: String, $media: Upload) {
        createPost(content: $content, media: $media) {
            id
        }
    }
`;

export const Account = () => {
    const navigate = useNavigate();
    const [tab, setTab] = useState("/");
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
        <Container maxWidth="lg">
            <Box
                width="100%"
                sx={{
                    p: 2,
                    bgcolor: "#fefeff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "between",
                    flexWrap: "wrap",
                }}
            >
                <Tabs
                    value={tab}
                    onChange={(_, value) => {
                        setTab(value);
                        navigate(`/account${value}`);
                    }}
                >
                    <Tab label="Posts" value="/"></Tab>
                    <Tab label="Find Friends" value="/find-friends"></Tab>
                    <Tab label="Friend Requests" value="/friend-requests"></Tab>
                </Tabs>
                <Button
                    variant="contained"
                    sx={{ marginLeft: "auto", display: "block" }}
                    onClick={() => setModalOpen(true)}
                >
                    Create Post
                </Button>
            </Box>
            <Container
                maxWidth="sm"
                sx={{
                    backgroundColor: "background.paper",
                    borderRadius: "10px",
                    pt: "1px",
                    mt: "10px",
                }}
            >
                <Outlet />
            </Container>
            <Modal
                open={modalOpen}
                onClose={() => {
                    reset();
                    setMedia(null);
                    setMediaPath(null);
                    setContent("");
                    setModalOpen(false);
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
                        <div
                            className={css({
                                width: "90%",
                                maxHeight: "300px",
                                overflow: "hidden",
                            })}
                        >
                            {mediaPath && media?.type.includes("video") && (
                                <video src={mediaPath}></video>
                            )}
                            {mediaPath && media?.type.includes("image") && (
                                <img src={mediaPath} />
                            )}
                        </div>
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
                            accept="video/*, image/*"
                            hidden={true}
                            onChange={selectMedia}
                        />
                    </div>
                </Card>
            </Modal>
        </Container>
    );
};
