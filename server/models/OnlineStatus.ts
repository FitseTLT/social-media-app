import { DataTypes, Model } from "sequelize";
import { sequelize } from "../setup";
import { UserStatus } from "./ENUMS";

export class OnlineStatus extends Model {
    declare userId: number;
    declare status: UserStatus;
    declare lastConnected: Date;
}

OnlineStatus.init(
    {
        userId: {
            type: DataTypes.INTEGER,
            unique: true,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM(UserStatus.Connected, UserStatus.Disconnected),
            allowNull: false,
        },
        lastConnected: { type: DataTypes.DATE, allowNull: false },
    },
    { sequelize }
);
