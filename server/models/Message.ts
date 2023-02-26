import { Model, DataTypes } from "sequelize";
import { sequelize } from "../setup";
import { User } from "./User";

export class Message extends Model {
    declare id: number;
    declare senderId: number;
    declare receiverId: number;
    declare text?: string;
    declare media?: string;
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
    },
    {
        sequelize,
    }
);
