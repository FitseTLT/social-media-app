import { gql, useMutation } from "@apollo/client";
import { css } from "@emotion/css";
import {
    ThumbDownAlt,
    ThumbDownAltOutlined,
    ThumbUpAlt,
    ThumbUpAltOutlined,
} from "@mui/icons-material";
import { Button } from "@mui/material";
import { useContext, useState } from "react";
import { likeContext } from "./Posts/Post";

interface Props {
    postId: number;
}

export const LikeDislike = ({ postId }: Props) => {
    const { likeCount, dislikeCount, hasLiked, likeHandler } =
        useContext(likeContext);

    return (
        <>
            <Button
                sx={{
                    color: "#555",
                    "& > * ": { margin: "5px" },
                    fontFamily: "Roboto !important",
                }}
                onClick={() => likeHandler(true)}
            >
                {hasLiked === true ? (
                    <ThumbUpAlt color="primary" />
                ) : (
                    <ThumbUpAltOutlined />
                )}
                <span
                    className={css({
                        color: "#555",
                        "& > * ": { margin: "3px" },
                        fontFamily: "Roboto !important",
                    })}
                >
                    {likeCount}
                </span>
            </Button>
            <Button
                sx={{
                    color: "#555",
                    "& > * ": { margin: "5px" },
                    fontFamily: "Roboto !important",
                }}
                onClick={() => likeHandler(false)}
            >
                {hasLiked === false ? (
                    <ThumbDownAlt color="primary" />
                ) : (
                    <ThumbDownAltOutlined />
                )}
                <span
                    className={css({
                        color: "#555",
                        "& > * ": { margin: "3px" },
                        fontFamily: "Roboto !important",
                    })}
                >
                    {dislikeCount}
                </span>
            </Button>
        </>
    );
};
