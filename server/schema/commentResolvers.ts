import { Sequelize, Op } from "sequelize";
import { postsPerPage } from "../constants";
import { Comment } from "../models/Comment";
import { FriendshipStatus } from "../models/ENUMS";
import { Friendship } from "../models/Friendship";
import { Like_Dislike } from "../models/Like_Dislike";
import { Post } from "../models/Post";
import { storeFS } from "../utils/storeFS";

export const createComment = async (
    {
        commentedBy,
        commentOf,
        parentComment,
        content,
        media,
    }: {
        commentedBy: number;
        commentOf: number;
        parentComment: number;
        content: string;
        media?: any;
    },
    { user }: { user: string }
) => {
    const userId = Number(user);
    if (commentedBy !== userId) throw new Error("Not authorized to comment");

    let mediaUrl = null;
    if (media) {
        const { filename, createReadStream } = await media.promise;
        const stream = createReadStream();
        const path = await storeFS({ stream, filename });
        mediaUrl = path.path;
    }

    const comment = await Comment.create({
        commentedBy,
        commentOf,
        parentComment,
        content,
        media: mediaUrl,
    });

    return comment;
};

// export const fetchTimeline = async (
//     { page = 0 }: { page: number },
//     { user }: { user: string }
// ) => {
//     const userId = Number(user);
//     const friends = await Friendship.findAll({
//         where: Sequelize.and(
//             {
//                 status: FriendshipStatus.Accepted,
//             },
//             Sequelize.or(
//                 {
//                     requestedBy: userId,
//                 },
//                 { acceptedBy: userId }
//             )
//         ),
//     });

//     const friendIds = friends.map((friend) =>
//         userId === friend.requestedBy ? friend.acceptedBy : friend.requestedBy
//     );

//     const posts = await Post.findAll({
//         where: {
//             postedBy: {
//                 [Op.in]: friendIds,
//             },
//         },
//         order: [["createdAt", "DESC"]],
//         limit: postsPerPage,
//         offset: page * postsPerPage,
//     });
//     return posts;
// };

export async function likeComment(
    {
        commentId,
        isLike = true,
    }: {
        commentId: number;
        isLike: boolean;
    },
    { user }: { user: string }
) {
    const userId = Number(user);

    const comment = await Comment.findByPk(commentId);

    if (!comment) throw new Error("comment doesn't exist");

    const like_dislike = await Like_Dislike.findOne({
        where: {
            commentId,
        },
    });

    if (!like_dislike) {
        await Like_Dislike.create({
            commentId,
            isLike,
            userId,
        });

        isLike
            ? await comment.increment("likes")
            : await comment.increment("dislikes");
    } else {
        if (isLike === like_dislike.isLike) {
            like_dislike.destroy();
            isLike
                ? await comment.decrement("likes")
                : await comment.decrement("dislikes");
        } else {
            await like_dislike.update({ isLike });
            if (isLike) {
                await comment.increment("likes");
                await comment.decrement("dislikes");
            } else {
                await comment.increment("dislikes");
                await comment.decrement("likes");
            }
        }
    }
    return await comment.reload();
}
