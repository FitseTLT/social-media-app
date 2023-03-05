import { Container, Box } from "@mui/material";
import { css } from "@emotion/css";
import { Tabs, Tab, Typography } from "@mui/material";
import { ChatBubble, Home, People } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client/core";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCurrentUser } from "../../store/userSlice";
import { AvatarMenu } from "../AvatarMenu";

const currentUser = gql`
    query {
        getCurrentUser {
            id
            name
            picture
        }
    }
`;

const MainLayout = () => {
    const { loading, error, data } = useQuery(currentUser);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [tab, setTab] = useState("/");

    useEffect(() => {
        if (loading) return;

        if (error || !data) {
            return navigate("/login");
        }

        const { id, name, picture } = data?.getCurrentUser;
        dispatch(setCurrentUser({ id, name, picture }));
    }, [loading]);

    return (
        <Box width="100%">
            <nav
                className={css({
                    height: "80px",
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    boxShadow: "0px 5px 10px 0px rgba(0, 0, 0, 0.15)",
                })}
            >
                <Link to="/">
                    <Typography component="h3" color="brown" m={2}>
                        Social Media App
                    </Typography>
                </Link>
                <Tabs
                    onChange={(e, value) => {
                        setTab(value);
                        navigate(value);
                    }}
                    value={tab}
                >
                    <Tab icon={<Home />} value="/" />
                    <Tab icon={<ChatBubble />} value="/chat" />
                    <Tab icon={<People />} value="/account" />
                </Tabs>
                <AvatarMenu />
            </nav>
            <Container
                maxWidth={false}
                sx={{
                    width: "100%",
                    maxWidth: "100%",
                    bgcolor: "#E4E6EB",
                    position: "absolute",
                    top: "80px",
                    bottom: 0,
                    right: 0,
                    left: 0,
                    p: 2,
                    overflow: "auto",
                }}
            >
                <Outlet />
            </Container>
        </Box>
    );
};

export default MainLayout;
