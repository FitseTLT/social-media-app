import { Model, DataTypes } from "sequelize";
import { sequelize } from "../setup";
import { Comment } from "./Comment";
import { Post } from "./Post";
import { User } from "./User";

export class Like_Dislike extends Model {
    declare id: number;
    declare userId: number;
    declare isLike: boolean;
    declare commentId?: number;
    declare postId?: number;
}

Like_Dislike.init(
    {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: User, key: "id" },
        },
        isLike: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        commentId: {
            type: DataTypes.INTEGER,
            references: { model: Comment, key: "id" },
        },
        postId: {
            type: DataTypes.INTEGER,
            references: { model: Post, key: "id" },
        },
    },
    { sequelize }
);
