import { Router } from "express";

export const logout = Router();

logout.post("/api/logout", (req, res) => {
    req.logout(() => {
        res.send("Logged out");
    });
});
