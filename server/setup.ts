import { createConnection } from "mysql2";
import { Sequelize } from "sequelize";
require("dotenv").config();

const mysql = createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

export const sequelize = new Sequelize(
  "social_media",
  process.env.DB_USER!,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: false,
  }
);

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
