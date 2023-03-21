import { gql } from "@apollo/client";
import { Avatar, Container, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useScrollFetch } from "../../hooks/useScrollFetch";
import { RootState } from "../../store/store";
import { Post } from "./Post";

const QUERY = gql`
    query ($userId: Int!, $page: Int) {
        listPosts(userId: $userId, page: $page) {
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

interface Props {
    id?: number;
    name?: string;
    picture?: string;
}

export const UserPosts = (prop: Props) => {
    const { id, name, picture } = prop?.id
        ? prop
        : useSelector((state: RootState) => state.user);

    const { data, noMoreData, refAnchor } = useScrollFetch({
        QUERY,
        variables: { userId: id },
    });

    return (
        <Box maxWidth="sm">
            <Box
                sx={{
                    backgroundColor: "background.paper",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    p: 2,
                    m: 1,
                    mb: 4,
                }}
            >
                <Avatar src={picture} sx={{ width: "60px", height: "60px" }} />
                <Typography ml={2} fontSize={18}>
                    {name}
                </Typography>
            </Box>
            {data &&
                (Object.values(data)?.[0] as Post[])?.map((post: Post) => (
                    <Post post={post} key={post.id} />
                ))}
            {noMoreData ? (
                <Typography textAlign="center">
                    No {(Object.values(data)?.[0] as []).length > 0 && "more"}{" "}
                    posts
                </Typography>
            ) : (
                <Typography textAlign="center" ref={refAnchor}>
                    Loading ...
                </Typography>
            )}
        </Box>
    );
};
