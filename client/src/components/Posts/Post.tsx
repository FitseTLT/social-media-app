import { gql, useMutation } from "@apollo/client";
import {
    Button,
    Card,
    CardContent,
    Container,
    Divider,
    Modal,
    Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import {
    useEffect,
    useState,
    Dispatch,
    SetStateAction,
    createContext,
    useRef,
} from "react";
import { useScrollFetch } from "../../hooks/useScrollFetch";
import { getTime } from "../../utils/getTime";
import { Comment } from "../Comment/Comment";
import { CommentType, CreateComment } from "../Comment/CreateComment";
import { LikeDislike } from "../LikeDislike";
import { LoadMore } from "../LoadMore";
import { Media } from "../Media";
import { UserAvatar } from "../UserAvatar";

export interface UserData {
    id: number;
    name: string;
    picture: string;
}

export interface Post {
    id: number;
    User: UserData;
    content?: string;
    media?: string;
    mediaType?: string;
    likes: number;
    dislikes: number;
    lastComment: CommentType;
    createdAt: string;
    hasLiked: boolean;
}

const GET_COMMENTS = gql`
    query ($postId: Int!, $page: Int) {
        getComments(postId: $postId, page: $page) {
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

const LIKE_POST = gql`
    mutation ($isLike: Boolean, $postId: Int!) {
        likePost(postId: $postId, isLike: $isLike) {
            id
        }
    }
`;

export const likeContext = createContext<{
    likeCount: number;
    dislikeCount: number;
    hasLiked: boolean | null;
    likeHandler: (isLike: boolean) => void;
}>({
    likeCount: 0,
    dislikeCount: 0,
    hasLiked: false,
    likeHandler: (isLike: boolean) => {},
});

export const Post = ({ post }: { post: Post }) => {
    const [open, setOpen] = useState(false);
    const scrollEl = useRef<HTMLElement | null>(null);

    const {
        data: comments,
        noMoreData,
        refAnchor,
        fetch,
    } = useScrollFetch({
        QUERY: GET_COMMENTS,
        variables: { postId: post.id },
        scrollEl,
        onWindow: false,
        reverseScroll: true,
    });

    const [lastComment, setLastComment] = useState(post?.lastComment);

    const [likeCount, setLikeCount] = useState(post.likes);
    const [dislikeCount, setDislikeCount] = useState(post.dislikes);

    const [hasLiked, setHasLiked] = useState<boolean | null>(post.hasLiked);
    const [likePost] = useMutation(LIKE_POST);

    const likeHandler = (isLike: boolean) => {
        likePost({ variables: { postId: post.id, isLike } });

        if (isLike === hasLiked) {
            setHasLiked(null);
            isLike
                ? setLikeCount(likeCount - 1)
                : setDislikeCount(dislikeCount - 1);
        } else {
            setHasLiked(isLike);

            if (hasLiked !== null)
                isLike
                    ? setDislikeCount(dislikeCount - 1)
                    : setLikeCount(likeCount - 1);

            isLike
                ? setLikeCount(likeCount + 1)
                : setDislikeCount(dislikeCount + 1);
        }
    };

    const viewMoreComments = () => {
        setOpen(true);
        fetch();
    };

    return (
        <likeContext.Provider
            value={{ likeCount, dislikeCount, hasLiked, likeHandler }}
        >
            <Modal open={open} onClose={(_) => setOpen(false)}>
                <Container
                    maxWidth="sm"
                    sx={{
                        height: "100vh",
                        outline: "none",
                        pr: "0 !important",
                        display: "flex",
                        alignItems: "center",
                        "& > *": { height: "95%", flexGrow: 1 },
                    }}
                >
                    <PostDisplay
                        mode={"full"}
                        post={post}
                        viewMoreComments={viewMoreComments}
                        comments={comments?.getComments}
                        setLastComment={setLastComment}
                        noMoreData={noMoreData}
                        refAnchor={refAnchor}
                        scrollEl={scrollEl}
                    />
                </Container>
            </Modal>

            <PostDisplay
                mode={"normal"}
                post={post}
                viewMoreComments={viewMoreComments}
                setLastComment={setLastComment}
                lastComment={lastComment}
            />
        </likeContext.Provider>
    );
};

const PostDisplay = ({
    post,
    mode = "normal",
    viewMoreComments,
    comments,
    lastComment,
    setLastComment,
    refAnchor,
    scrollEl,
    noMoreData,
}: {
    post: Post;
    lastComment?: CommentType;
    setLastComment: Dispatch<SetStateAction<CommentType>>;
    mode: "normal" | "full";
    viewMoreComments: Function;
    comments?: CommentType[];
    noMoreData?: boolean;
    refAnchor?: React.MutableRefObject<HTMLElement | null>;
    scrollEl?: React.MutableRefObject<HTMLElement | null>;
}) => {
    const [showCreateComment, setShowCreateComment] = useState(mode === "full");

    const [commentsAdded, setCommentsAdded] = useState<CommentType[]>([]);
    const newRef = useRef<HTMLElement | null>(null);
    const commentCreated = (comment: CommentType) => {
        setLastComment(comment);
        if (mode === "full") {
            setCommentsAdded([comment, ...commentsAdded]);
        }
    };

    useEffect(() => {
        setCommentsAdded([]);
    }, [comments]);

    return (
        <Card
            variant="outlined"
            sx={{
                display: "flex",
                p: 0,
                flexDirection: "column",
                margin: 1,
                maxHeight: "100%",
            }}
        >
            <Box
                sx={{
                    flexGrow: 1,
                    display: "flex",
                    p: 0,
                    flexDirection: "column",
                    margin: 1,
                    overflowY: "auto",
                    overflowX: "hidden",
                }}
                ref={scrollEl}
            >
                <Box
                    sx={{
                        p: "5px",
                        display: "flex",
                        alignItems: "center",
                        "& > *": { margin: 1 },
                    }}
                >
                    <UserAvatar
                        picture={post?.User?.picture}
                        id={post.User.id}
                    />
                    <Box>
                        <Typography fontWeight="500">
                            {post?.User?.name}
                        </Typography>
                        <Typography fontWeight="200" fontSize={11}>
                            {getTime(post?.createdAt)}
                        </Typography>
                    </Box>
                </Box>
                <CardContent
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        m: 0,
                        p: 0,
                        "& >*": {
                            width: "100%",
                        },
                    }}
                >
                    {post?.content && <LoadMore text={post?.content} />}

                    {post?.media && (
                        <Box
                            my={2}
                            mx={0}
                            display="flex"
                            justifyContent="center"
                        >
                            <Media
                                playable
                                mediaPath={post.media}
                                mediaType={post.mediaType}
                            />
                        </Box>
                    )}
                    <Divider sx={{ mt: 2 }} />
                    <Box
                        display="flex"
                        width="100%"
                        justifyContent="space-around"
                        sx={{ "& > * ": { width: "33%" } }}
                    >
                        <LikeDislike postId={post?.id} />
                        <Button
                            sx={{
                                color: "#777",
                                textTransform: "capitalize",
                            }}
                            onClick={() => setShowCreateComment(true)}
                        >
                            Comment
                        </Button>
                    </Box>
                    <Divider />
                    {lastComment && mode === "normal" && (
                        <>
                            <Box
                                sx={{
                                    mt: 2,
                                    ml: 3,
                                }}
                            >
                                <Typography
                                    onClick={() => viewMoreComments()}
                                    sx={{
                                        ":hover": {
                                            textDecoration: "underline",
                                        },
                                        fontSize: "14px",
                                        cursor: "pointer",
                                        display: "inline-block",
                                    }}
                                >
                                    View more comments
                                </Typography>
                            </Box>
                            <Comment comment={lastComment} />
                        </>
                    )}
                    {commentsAdded?.map((comment) => (
                        <Comment key={comment.id} comment={comment} />
                    ))}
                    {comments &&
                        comments?.map((comment, i) => (
                            <Comment
                                key={comment.id}
                                prevId={comments?.[i - 1]?.User?.id}
                                comment={comment}
                            />
                        ))}
                    {noMoreData === false && (
                        <Typography
                            textAlign="center"
                            fontSize={12}
                            ref={refAnchor}
                        >
                            Loading ...
                        </Typography>
                    )}
                </CardContent>
            </Box>
            {(showCreateComment || mode === "full") && (
                <Container>
                    <CreateComment
                        postId={post.id}
                        commentCreated={commentCreated}
                    />
                </Container>
            )}
        </Card>
    );
};
