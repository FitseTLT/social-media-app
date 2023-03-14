import { Box, Container, Tab, Tabs } from "@mui/material";
import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { CreatPost } from "./Posts/CreatePost";

export const Account = () => {
    const navigate = useNavigate();
    const [tab, setTab] = useState("/");

    return (
        <Container
            maxWidth="lg"
            sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
            }}
        >
            <Box
                width="100%"
                sx={{
                    p: 2,
                    bgcolor: "#fefeff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "between",
                    flexWrap: "wrap",
                }}
            >
                <Tabs
                    value={tab}
                    onChange={(_, value) => {
                        setTab(value);
                        navigate(`/account${value}`);
                    }}
                >
                    <Tab label="Posts" value="/"></Tab>{" "}
                    <Tab label="friends" value="/friends" />
                    <Tab label="Find Friends" value="/find-friends"></Tab>
                    <Tab label="Friend Requests" value="/friend-requests"></Tab>
                </Tabs>
                <CreatPost />
            </Box>
            <Container
                maxWidth="sm"
                sx={{
                    borderRadius: "10px",
                    pt: "1px",
                    mt: "10px",
                    flexGrow: 1,
                }}
            >
                <Outlet />
            </Container>
        </Container>
    );
};
