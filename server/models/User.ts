import { Model, DataTypes } from "sequelize";
import { sequelize } from "../setup";

export class User extends Model {
    declare id: number;
    declare name?: string;
    declare email: string;
    declare password: string;
    declare picture: string;
}

User.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        picture: {
            type: DataTypes.STRING,
            get() {
                return this.getDataValue("picture")
                    ? `${process.env.BASE_URL}${this.getDataValue("picture")}`
                    : null;
            },
        },
    },
    {
        sequelize,
    }
);
