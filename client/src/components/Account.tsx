import { Box, Container, Tab, Tabs } from "@mui/material";
import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { CreatPost } from "./Posts/CreatePost";

export const Account = () => {
    const navigate = useNavigate();
    const [tab, setTab] = useState("/");
    const { pathname } = useLocation();

    useEffect(() => {
        if (pathname.includes("find-friends")) setTab("/find-friends");
        else if (pathname.includes("friend-requests"))
            setTab("/friend-requests");
        else if (pathname.includes("friends")) setTab("/friends");
        else setTab("/");
    }, []);

    return (
        <Box
            sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                p: { xs: 0 },
            }}
        >
            <Box
                width={{ xs: "100%", md: "800px" }}
                sx={{
                    p: { xs: 2 },
                    borderRadius: "10px",
                    bgcolor: "#fefeff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "between",
                    flexWrap: "wrap",
                    boxSizing: "border-box",
                }}
            >
                <Tabs
                    value={tab}
                    onChange={(_, value) => {
                        setTab(value);
                    }}
                    variant="scrollable"
                    sx={{ mb: 3, mr: 3 }}
                >
                    <Tab
                        label="Posts"
                        value="/"
                        onClick={() => {
                            navigate("/account/");
                        }}
                    ></Tab>
                    <Tab
                        label="friends"
                        value="/friends"
                        onClick={() => {
                            navigate("/account/friends");
                        }}
                    />
                    <Tab
                        label="Find Friends"
                        value="/find-friends"
                        onClick={() => {
                            navigate("/account/find-friends");
                        }}
                    ></Tab>
                    <Tab
                        label="Friend Requests"
                        value="/friend-requests"
                        onClick={() => {
                            navigate("/account/friend-requests");
                        }}
                    ></Tab>
                </Tabs>
                <CreatPost />
            </Box>
            <Box
                sx={{
                    borderRadius: "10px",
                    pt: "1px",
                    mt: "10px",
                    flexGrow: 1,
                    maxWidth: "600px",
                    width: "100%",
                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
};
