import { Comment } from "../models/Comment";
import { Like_Dislike } from "../models/Like_Dislike";
import { storeFS } from "../utils/storeFS";

export const createComment = async (
    {
        postId,
        parentComment,
        content,
        media,
    }: {
        postId: number;
        parentComment: number;
        content: string;
        media?: any;
    },
    { user }: { user: number }
) => {
    const commentedBy = user;

    let mediaUrl = null;
    if (media) {
        const { filename, createReadStream } = await media.promise;
        const stream = createReadStream();
        const path = await storeFS({ stream, filename });
        mediaUrl = path.path;
    }

    const comment = await Comment.create({
        commentedBy,
        postId,
        parentComment,
        content,
        media: mediaUrl,
    });

    return comment;
};

export async function likeComment(
    {
        commentId,
        isLike = true,
    }: {
        commentId: number;
        isLike: boolean;
    },
    { user }: { user: number }
) {
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
            userId: user,
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
