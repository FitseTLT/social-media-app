import { Model, DataTypes } from "sequelize";
import { sequelize } from "../setup";
import { Post } from "./Post";
import { User } from "./User";

class Comment extends Model {
    declare id: number;
    declare commentedBy: number;
    declare parentComment: number;
    declare content: string;
    declare media: string;
    declare likes: number;
    declare dislikes: number;
}

Comment.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        commentedBy: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: User,
                key: "id",
            },
        },
        parentComment: {
            type: DataTypes.INTEGER,
            references: {
                model: Comment,
            },
        },
        content: {
            type: DataTypes.STRING(1000),
        },
        media: {
            type: DataTypes.STRING,
            get() {
                return this.getDataValue("media")
                    ? `${process.env.BASE_URL}/${this.getDataValue("media")}`
                    : null;
            },
        },
        likes: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        dislikes: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
    },
    {
        sequelize,
    }
);

Comment.belongsTo(Post, { foreignKey: "postId" });

export { Comment };
