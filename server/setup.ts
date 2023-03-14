import { createConnection } from "mysql2";
import { Sequelize } from "sequelize";

const mysql = createConnection({
    host: "localhost",
    user: "root",
    password: "",
});

export const sequelize = new Sequelize("social_media", "root", "", {
    host: "localhost",
    dialect: "mysql",
    logging: false,
});

mysql.query(`create database if not exists social_media`, (err) => {
    if (err) throw err;

    (async () => {
        try {
            await sequelize.authenticate();
            await sequelize.sync();

            console.log("MySql DB connected successfully");
        } catch (e) {
            console.log(e);
        }
    })();
});

mysql.end();
