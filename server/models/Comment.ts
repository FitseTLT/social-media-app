import { Model, DataTypes } from "sequelize";
import { sequelize } from "../setup";
import { Post } from "./Post";
import { User } from "./User";

class Comment extends Model {
    declare id: number;
    declare commentedBy: number;
    declare content?: string;
    declare media?: string;
    declare mediaType?: string;
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

        content: {
            type: DataTypes.STRING(1000),
        },
        media: {
            type: DataTypes.STRING,
            get() {
                return this.getDataValue("media")
                    ? `${process.env.BASE_URL}${this.getDataValue("media")}`
                    : null;
            },
        },
        mediaType: {
            type: DataTypes.STRING,
        },
    },
    {
        sequelize,
    }
);

Comment.belongsTo(Post, { foreignKey: "postId" });
Comment.belongsTo(User, { foreignKey: "commentedBy" });

export { Comment };
