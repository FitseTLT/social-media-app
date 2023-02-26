import { Router } from "express";

export const logout = Router();

logout.get("/logout", (req, res) => {
    req.logout(() => {
        res.send("Logged out");
    });
});
