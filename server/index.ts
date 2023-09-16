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
import http from "http";
import { socketSetup } from "./socket";
import fs from "fs";

let graphqlUploadExpress: any;

dotenv.config();

require("./setup");
const app = express();
export const httpServer = http.createServer(app);

app.use(
  cors({
    credentials: true,
    origin: ["/graphql", process.env.CLIENT_URL!],
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

socketSetup();

app.use(bodyParser.json());

app.use("/", express.static("./public/dist"));
app.use("/public", express.static("./public"));

app.get("*", (req, res) => {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(fs.readFileSync("./public/dist/index.html"));
});

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
        user: Number(req.user?.id),
      },
    }))
  );
})();

httpServer.listen(process.env.PORT, () => {
  console.log(`Listening on Port ${process.env.PORT}`);
});
