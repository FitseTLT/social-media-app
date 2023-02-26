import { Sequelize, Op } from "sequelize";
import { postsPerPage } from "../constants";
import { FriendshipStatus } from "../models/ENUMS";
import { Friendship } from "../models/Friendship";
import { Like_Dislike } from "../models/Like_Dislike";
import { Post } from "../models/Post";
import { storeFS } from "../utils/storeFS";

export const createPost = async (
    {
        postedBy,
        content,
        media,
    }: {
        postedBy: number;
        content: string;
        media?: any;
    },
    { user }: { user: string }
) => {
    const userId = Number(user);
    if (userId !== postedBy) throw new Error("Not authorized to post");

    let mediaUrl = null;
    if (media) {
        const { filename, createReadStream } = await media.promise;
        const stream = createReadStream();
        const path = await storeFS({ stream, filename });
        mediaUrl = path.path;
    }

    const post = Post.create({
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
        order: [["createdAt", "DESC"]],
        limit: postsPerPage,
        offset: page * postsPerPage,
    });

    posts[0].toJSON().comment = "sdf";

    return posts;
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
