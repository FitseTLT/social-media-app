import { gql } from "@apollo/client";
import { Container, Typography } from "@mui/material";
import { useScrollFetch } from "../../hooks/useScrollFetch";
import { Post } from "./Post";

const QUERY = gql`
    query ($page: Int) {
        fetchTimeline(page: $page) {
            id
            User {
                id
                name
                picture
            }
            content
            media
            mediaType
            likes
            dislikes
            lastComment {
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
            createdAt
            hasLiked
        }
    }
`;

export const Timeline = () => {
    const { data, noMoreData, refAnchor } = useScrollFetch({ QUERY });

    if (!data) return null;

    return (
        <Container maxWidth="sm">
            {(Object.values(data)?.[0] as Post[])?.map((post: Post) => (
                <Post post={post} key={post.id} />
            ))}

            {noMoreData ? (
                <Typography textAlign="center" mt={2}>
                    No {(Object.values(data)?.[0] as []).length > 0 && "more "}
                    posts
                </Typography>
            ) : (
                <Typography textAlign="center" ref={refAnchor}>
                    Loading ...
                </Typography>
            )}
        </Container>
    );
};
