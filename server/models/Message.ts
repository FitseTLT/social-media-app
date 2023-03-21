import { Model, DataTypes, Op } from "sequelize";
import { makePaginate } from "sequelize-cursor-pagination";
import {
    PaginateOptions,
    PaginationConnection,
} from "sequelize-cursor-pagination/types";
import { sequelize } from "../setup";
import { User } from "./User";

export class Message extends Model {
    declare id: number;
    declare senderId: number;
    declare receiverId: number;
    declare text?: string;
    declare media?: string;
    declare mediaType?: string;
    declare createdAt: string;
    declare isRead: boolean;
    declare static paginate: (
        options: PaginateOptions<Message>
    ) => Promise<PaginationConnection<Message>>;
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
                    ? `${process.env.BASE_URL}${this.getDataValue("media")}`
                    : null;
            },
        },
        mediaType: {
            type: DataTypes.STRING,
        },
        isRead: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        callType: {
            type: DataTypes.ENUM("audio-call", "video-call"),
        },
        callDuration: {
            type: DataTypes.INTEGER,
        },
    },
    {
        sequelize,
    }
);

Message.belongsTo(User, { as: "SenderId", foreignKey: "senderId" });
Message.paginate = makePaginate(Message);
