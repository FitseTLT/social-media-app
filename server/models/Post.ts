import { Model, DataTypes } from "sequelize";
import { sequelize } from "../setup";
import { Comment } from "./Comment";
import { User } from "./User";

export class Post extends Model {
    declare id: number;
    declare postedBy: number;
    declare content?: string;
    declare media?: string;
    declare mediaType?: string;
    declare likes: number;
    declare dislikes: number;
}

Post.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        postedBy: {
            type: DataTypes.INTEGER,
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
                return this.getDataValue("media") !== null
                    ? `${process.env.BASE_URL}${this.getDataValue("media")}`
                    : null;
            },
        },
        mediaType: { type: DataTypes.STRING },
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

Post.belongsTo(User, { foreignKey: "postedBy" });
