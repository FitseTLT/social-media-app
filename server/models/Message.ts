import { Model, DataTypes } from "sequelize";
import { sequelize } from "../setup";
import { User } from "./User";

export class Message extends Model {
    declare id: number;
    declare senderId: number;
    declare receiverId: number;
    declare text?: string;
    declare media?: string;
    declare createdAt: string;
    declare isRead: boolean;
}

Message.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        senderId: {
            type: DataTypes.INTEGER,
            references: {
                model: User,
                key: "id",
            },
        },
        receiverId: {
            type: DataTypes.INTEGER,
            references: {
                model: User,
                key: "id",
            },
        },
        text: {
            type: DataTypes.STRING(1000),
        },
        media: {
            type: DataTypes.STRING,
            get() {
                return this.getDataValue("media") !== null
                    ? `${process.env.BASE_URL}/${this.getDataValue("media")}`
                    : null;
            },
        },
        isRead: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    },
    {
        sequelize,
    }
);
