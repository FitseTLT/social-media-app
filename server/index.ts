import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { graphqlHTTP } from "express-graphql";
import { root, schema } from "./schema/schema";
import { signUp } from "./auth/signup";
import bodyParser from "body-parser";
import { login } from "./auth/login";
import session from "express-session";
import passport from "passport";
import { logout } from "./auth/logout";
import sequelizeConnect from "connect-session-sequelize";
import { sequelize } from "./setup";

let graphqlUploadExpress: any;

dotenv.config();
require("./setup");
const app = express();
app.use(
    cors({
        credentials: true,
        origin: ["http://localhost:3000"],
    })
);

const SequelizeStore = sequelizeConnect(session.Store);

app.use(
    session({
        secret: process.env.COOKIE_SESSION!,
        store: new SequelizeStore({
            db: sequelize,
        }),
        cookie: { maxAge: 86400000 },
    })
);
app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.json());

app.use(signUp);
app.use(login);
app.use(logout);

(async () => {
    const module = await import("graphql-upload/graphqlUploadExpress.mjs");
    graphqlUploadExpress = module.default;
    app.use(
        "/graphql",
        (req, res, next) => {
            if (!req.user) return res.status(401).send("Not logged in");
            next();
        },
        graphqlUploadExpress({
            maxFileSize: 100000000,
            maxFiles: 10,
        }),
        graphqlHTTP((req: any) => ({
            graphiql: process.env.NODE_ENV === "development",
            schema,
            rootValue: root,
            context: {
                user: req.user?.id,
            },
        }))
    );
})();

app.listen(process.env.PORT, () => {
    console.log(`Listening on Port ${process.env.PORT}`);
});
