import { Avatar } from "@mui/material";
import { Box } from "@mui/system";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { OnlineStatus, Status } from "../store/userSlice";

export const UserAvatar = ({
    id,
    picture,
}: {
    id?: number;
    picture?: string;
}) => {
    const status = useSelector((state: RootState) =>
        state.user?.friendsStatus.find((status: Status) => status.userId === id)
    );

    return (
        <Box>
            <Box sx={{ position: "relative" }}>
                <Avatar src={picture}></Avatar>
                <Box
                    component={"div"}
                    sx={{
                        position: "absolute",
                        bottom: "1px",
                        right: "1px",
                        borderColor: "white",
                        borderStyle: "solid",
                        borderWidth: "1px",
                        borderRadius: "50%",
                        width: "10px",
                        height: "10px",
                        background:
                            status?.status === OnlineStatus.Connected
                                ? "green"
                                : "gray",
                    }}
                ></Box>
            </Box>
        </Box>
    );
};
