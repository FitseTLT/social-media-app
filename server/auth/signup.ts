import { Router } from "express";
import passport from "passport";
import { Strategy } from "passport-local";
import { User } from "../models/User";
import { encrypt } from "../utils/encrypt";

passport.use(
    "signup",
    new Strategy(
        {
            usernameField: "email",
            passwordField: "password",
        },
        async (email, password, done) => {
            const count = await User.count({ where: { email } });

            if (count)
                return done(null, false, {
                    message: "Email already exists",
                });

            const hash = await encrypt(password);
            const newUser = await User.create({ email, password: hash });
            done(null, { id: newUser.id.toString(), email: newUser.email });
        }
    )
);

export const signUp = Router();

signUp.post("/api/signup", (req, res, next) =>
    passport.authenticate(
        "signup",
        { session: true, successRedirect: "/", failureMessage: true },
        (err: any, user: any, info: any) => {
            if (!user || err) return res.status(401).send(info.message);
            try {
                req.login(user, (err) => {
                    if (err) return next(err);

                    return res.send("U Successfully Signed Up");
                });
            } catch (e) {
                return next(e);
            }
        }
    )(req, res, next)
);
