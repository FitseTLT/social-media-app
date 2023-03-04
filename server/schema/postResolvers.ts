import { Sequelize, Op } from "sequelize";
import { postsPerPage } from "../constants";
import { Comment } from "../models/Comment";
import { FriendshipStatus } from "../models/ENUMS";
import { Friendship } from "../models/Friendship";
import { Like_Dislike } from "../models/Like_Dislike";
import { Post } from "../models/Post";
import { User } from "../models/User";
import { storeFS } from "../utils/storeFS";

export const createPost = async (
    {
        content,
        media,
    }: {
        content: string;
        media?: any;
    },
    { user }: { user: number }
) => {
    if (!content && !media) throw new Error("can not have an empty post");

    const postedBy = user;

    let mediaUrl = null;
    if (media) {
        const { filename, createReadStream, mimetype } = await media.promise;
        if (!mimetype.includes("image") && !mimetype.includes("video"))
            throw new Error("can only post image or video");
        const stream = createReadStream();
        const path = await storeFS({ stream, filename });
        mediaUrl = path.path;
    }

    const post = await Post.create({
        postedBy,
        content,
        media: mediaUrl,
    });

    return post;
};

export const fetchTimeline = async (
    { page = 0 }: { page: number },
    { user }: { user: string }
) => {
    const userId = Number(user);
    const friends = await Friendship.findAll({
        where: Sequelize.and(
            {
                status: FriendshipStatus.Accepted,
            },
            Sequelize.or(
                {
                    requestedBy: userId,
                },
                { acceptedBy: userId }
            )
        ),
    });

    const friendIds = friends.map((friend) =>
        userId === friend.requestedBy ? friend.acceptedBy : friend.requestedBy
    );

    const posts = await Post.findAll({
        where: {
            postedBy: {
                [Op.in]: friendIds,
            },
        },
        include: User,
        order: [["createdAt", "DESC"]],
        limit: postsPerPage,
        offset: page * postsPerPage,
    });

    return posts.map(
        async ({ id, postedBy, content, media, likes, dislikes }) => {
            const lastComment = await Comment.findOne({
                where: {
                    postId: id,
                },
                order: [["createdAt", "DESC"]],
            });

            return {
                id,
                postedBy,
                content,
                media,
                likes,
                dislikes,
                lastComment,
            };
        }
    );
};

export async function likePost(
    {
        postId,
        isLike = true,
    }: {
        postId: number;
        isLike: boolean;
    },
    { user }: { user: string }
) {
    const userId = Number(user);

    const post = await Post.findByPk(postId);

    if (!post) throw new Error("post doesn't exist");

    const like_dislike = await Like_Dislike.findOne({
        where: {
            postId,
        },
    });

    if (!like_dislike) {
        await Like_Dislike.create({
            postId,
            isLike,
            userId,
        });

        isLike
            ? await post.increment("likes")
            : await post.increment("dislikes");
    } else {
        if (isLike === like_dislike.isLike) {
            like_dislike.destroy();
            isLike
                ? await post.decrement("likes")
                : await post.decrement("dislikes");
        } else {
            await like_dislike.update({ isLike });
            if (isLike) {
                await post.increment("likes");
                await post.decrement("dislikes");
            } else {
                await post.increment("dislikes");
                await post.decrement("likes");
            }
        }
    }
    return await post.reload();
}

export const listPosts = async (
    { friendId, page = 0 }: { friendId: number; page: number },
    { user }: { user: number }
) => {
    const friendship = await Friendship.findOne({
        where: Sequelize.and(
            {
                status: FriendshipStatus.Accepted,
            },
            Sequelize.or(
                {
                    requestedBy: user,
                    acceptedBy: friendId,
                },
                {
                    acceptedBy: user,
                    requestedBy: friendId,
                }
            )
        ),
    });

    if (!friendship) throw new Error("not authorized to see the posts");

    const posts = await Post.findAll({
        where: {
            postedBy: friendId,
        },
        order: [["createdAt", "DESC"]],
        limit: postsPerPage,
        offset: page * postsPerPage,
    });

    return posts.map(
        async ({ id, postedBy, content, media, likes, dislikes }) => {
            const lastComment = await Comment.findOne({
                where: {
                    postId: id,
                },
                order: [["createdAt", "DESC"]],
            });

            return {
                id,
                postedBy,
                content,
                media,
                likes,
                dislikes,
                lastComment,
            };
        }
    );

    return posts;
};
