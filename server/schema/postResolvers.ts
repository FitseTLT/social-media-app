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

    let mediaUrl = null,
        mediaType = null;
    if (media) {
        const { filename, createReadStream, mimetype } = await media.promise;
        if (!mimetype.includes("image") && !mimetype.includes("video"))
            throw new Error("can only post image or video");
        const stream = createReadStream();
        const path = await storeFS({ stream, filename });
        mediaUrl = path.path;
        mediaType = mimetype;
    }

    const post = await Post.create({
        postedBy,
        content,
        media: mediaUrl,
        mediaType,
    });

    return post;
};

export const fetchTimeline = async (
    { page = 0 }: { page: number },
    { user }: { user: number }
) => {
    const friends = await Friendship.findAll({
        where: Sequelize.and(
            {
                status: FriendshipStatus.Accepted,
            },
            Sequelize.or(
                {
                    requestedBy: user,
                },
                { acceptedBy: user }
            )
        ),
    });

    const friendIds = friends.map((friend) =>
        user === friend.requestedBy ? friend.acceptedBy : friend.requestedBy
    );

    const posts = (await Post.findAll({
        where: {
            postedBy: {
                [Op.in]: friendIds,
            },
        },
        include: User,
        order: [["createdAt", "DESC"]],
        limit: postsPerPage,
        offset: page * postsPerPage,
    })) as any[];

    return posts.map(
        async ({
            id,
            postedBy,
            content,
            media,
            mediaType,
            likes,
            dislikes,
            createdAt,
            User: UserField,
        }) => {
            const lastComment = await Comment.findOne({
                where: {
                    postId: id,
                },
                include: User,
                order: [["createdAt", "DESC"]],
            });

            const like = await Like_Dislike.findOne({
                where: { userId: user, postId: id },
            });

            return {
                id,
                postedBy,
                content,
                media,
                mediaType,
                likes,
                dislikes,
                lastComment,
                User: UserField,
                createdAt,
                hasLiked: like?.isLike,
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
    { user }: { user: number }
) {
    const post = await Post.findByPk(postId);

    if (!post) throw new Error("post doesn't exist");

    const like_dislike = await Like_Dislike.findOne({
        where: {
            postId,
            userId: user,
        },
    });

    if (!like_dislike) {
        await Like_Dislike.create({
            postId,
            isLike,
            userId: user,
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
    { userId, page = 0 }: { userId: number; page: number },
    { user }: { user: number }
) => {
    if (userId !== user) {
        const friendship = await Friendship.findOne({
            where: Sequelize.and(
                {
                    status: FriendshipStatus.Accepted,
                },
                Sequelize.or(
                    {
                        requestedBy: user,
                        acceptedBy: userId,
                    },
                    {
                        acceptedBy: user,
                        requestedBy: userId,
                    }
                )
            ),
        });

        if (!friendship) throw new Error("not authorized to see the posts");
    }

    const posts = (await Post.findAll({
        where: {
            postedBy: userId,
        },
        include: User,
        order: [["createdAt", "DESC"]],
        limit: postsPerPage,
        offset: page * postsPerPage,
    })) as any[];

    return posts.map(
        async ({
            id,
            postedBy,
            content,
            media,
            mediaType,
            likes,
            dislikes,
            createdAt,
            User: UserField,
        }) => {
            const lastComment = await Comment.findOne({
                where: {
                    postId: id,
                },
                include: User,
                order: [["createdAt", "DESC"]],
            });

            const like = await Like_Dislike.findOne({
                where: { userId: user, postId: id },
            });

            return {
                id,
                postedBy,
                content,
                media,
                mediaType,
                likes,
                dislikes,
                lastComment,
                User: UserField,
                createdAt,
                hasLiked: like?.isLike,
            };
        }
    );
};
