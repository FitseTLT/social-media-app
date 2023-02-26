import { Model, DataTypes } from "sequelize";
import { sequelize } from "../setup";
import { FriendshipStatus } from "./ENUMS";
import { User } from "./User";

export class Friendship extends Model {
    declare id: number;
    declare requestedBy: number;
    declare acceptedBy: number;
    declare acceptedAt: string;
    declare createdAt: string;
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
        acceptedBy: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: User, key: "id" },
            unique: "unique",
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
