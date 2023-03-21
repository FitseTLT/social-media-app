import { createSlice, Slice } from "@reduxjs/toolkit";

export enum OnlineStatus {
    Connected = "connected",
    Disconnected = "disconnected",
}
interface User {
    id?: number;
    name?: string;
    picture?: string;
    friendsStatus: Status[];
}

export interface Status {
    userId: number;
    status: OnlineStatus;
}

const initialState: User = { friendsStatus: [] };

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setCurrentUser: (state, { payload }) => {
            return { ...state, ...payload };
        },
        logout() {
            return undefined;
        },
        setFriendsStatus: (state, { payload }) => {
            state.friendsStatus = payload;
        },
        setUserStatus: (state, { payload }) => {
            const index = state.friendsStatus.findIndex(
                (status: Status) => status.userId === payload.userId
            );
            state.friendsStatus[index] = payload;
        },
    },
});

export default userSlice.reducer;

export const { setCurrentUser, setFriendsStatus, setUserStatus, logout } =
    userSlice.actions;
