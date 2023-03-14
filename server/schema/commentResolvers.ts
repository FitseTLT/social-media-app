import { commentsPerPage } from "../constants";
import { Comment } from "../models/Comment";
import { User } from "../models/User";
import { storeFS } from "../utils/storeFS";

export const createComment = async (
    {
        postId,
        content,
        media,
    }: {
        postId: number;
        content: string;
        media?: any;
    },
    { user }: { user: number }
) => {
    const commentedBy = user;

    let mediaUrl = null,
        mediaType = null;
    if (media) {
        const { filename, createReadStream, mimetype } = await media.promise;
        const stream = createReadStream();
        const path = await storeFS({ stream, filename });
        mediaUrl = path.path;
        mediaType = mimetype;
    }

    const comment = await Comment.create({
        commentedBy,
        postId,
        content,
        media: mediaUrl,
        mediaType,
    });

    return await Comment.findByPk(comment.id, { include: User });
};

export const getComments = async ({
    postId,
    page = 0,
}: {
    postId: number;
    page: number;
}) => {
    const comments = await Comment.findAll({
        where: { postId },
        order: [["createdAt", "desc"]],
        include: User,
        limit: commentsPerPage,
        offset: page * commentsPerPage,
    });

    return comments;
};
