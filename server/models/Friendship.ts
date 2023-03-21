import { Model, DataTypes } from "sequelize";
import { sequelize } from "../setup";
import { FriendshipStatus } from "./ENUMS";
import { Message } from "./Message";
import { User } from "./User";

export class Friendship extends Model {
    declare id: number;
    declare requestedBy: number;
    declare reqUnread: number;
    declare acceptedBy: number;
    declare accUnread: number;
    declare acceptedAt: string;
    declare createdAt: string;
    declare lastMessage: number;
    declare lastMessageTime: Date;
    declare status: FriendshipStatus;
}

Friendship.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        requestedBy: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: User, key: "id" },
            unique: "unique",
        },
        reqUnread: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        acceptedBy: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: User, key: "id" },
            unique: "unique",
        },
        accUnread: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        lastMessage: {
            type: DataTypes.INTEGER,
            references: {
                model: Message,
                key: "id",
            },
        },
        lastMessageTime: {
            type: DataTypes.DATE,
        },
        acceptedAt: { type: DataTypes.DATE },
        status: {
            type: DataTypes.ENUM(
                FriendshipStatus.Requested,
                FriendshipStatus.Accepted,
                FriendshipStatus.Rejected
            ),
            defaultValue: FriendshipStatus.Requested,
        },
    },
    { sequelize }
);

Friendship.belongsTo(Message, { foreignKey: "lastMessage" });
Friendship.belongsTo(User, { foreignKey: "requestedBy", as: "RequestedUser" });
Friendship.belongsTo(User, { foreignKey: "acceptedBy", as: "AcceptedUser" });
