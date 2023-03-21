import { Router } from "express";
import passport from "passport";
import { Strategy } from "passport-local";
import { checkPassword } from "../utils/encrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/User";

passport.serializeUser((user, done) => {
    const payload = jwt.sign(
        {
            id: user.id,
            email: user.email,
        },
        process.env.COOKIE_SESSION!
    );

    return done(null, payload);
});

passport.deserializeUser((token, done) => {
    const user = jwt.verify(token as string, process.env.COOKIE_SESSION!);

    return done(null, user as Express.User);
});

passport.use(
    "login",
    new Strategy(
        {
            usernameField: "email",
            passwordField: "password",
        },
        async (email, password, done) => {
            const user = await User.findOne({ where: { email } });

            if (!user)
                return done(null, false, { message: "invalid credentials" });

            const passwordCorrect = await checkPassword(
                user.password,
                password
            );

            if (!passwordCorrect)
                return done(null, false, { message: "invalid credentials" });

            done(
                null,
                { id: user.id.toString(), email: user.email },
                { message: "Successful" }
            );
        }
    )
);

export const login = Router();

login.post("/api/login", (req, res, next) => {
    passport.authenticate("login", (err: any, user: any, info: any) => {
        if (err || !user)
            return res.status(401).send(info.message || "Error Occurred");
        try {
            req.login(user, (err) => {
                if (err) return next(err);

                res.send("U Successfully Logged in");
            });
        } catch (e) {
            return next(e);
        }
    })(req, res, next);
});

declare global {
    namespace Express {
        interface User {
            id: string;
            email: string;
        }
    }
}
