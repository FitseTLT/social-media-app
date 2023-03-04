import { Avatar, IconButton, Menu, MenuItem, MenuList } from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { useState } from "react";
import axios from "../axios";
import { Link, useNavigate } from "react-router-dom";
import { css } from "@emotion/css";

export const AvatarMenu = () => {
    const user = useSelector((state: RootState) => state.user);
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const navigate = useNavigate();

    const logout = async () => {
        try {
            await axios("/logout");
            navigate("/login");
        } catch (e) {}
    };

    return (
        <div>
            <IconButton
                onClick={(e) => setAnchorEl(e.currentTarget)}
                className={css({ ":focus": { outline: "none" } })}
            >
                <Avatar src={user.picture} />
            </IconButton>
            <Menu
                open={Boolean(anchorEl)}
                onClose={() => {
                    setAnchorEl(null);
                }}
                anchorEl={anchorEl}
            >
                <MenuList>
                    <Link to="/profile" className={css({ color: "black" })}>
                        <MenuItem>Edit Profile</MenuItem>
                    </Link>
                    <MenuItem
                        onClick={logout}
                        className={css({ color: "black" })}
                    >
                        Logout
                    </MenuItem>
                </MenuList>
            </Menu>
        </div>
    );
};
