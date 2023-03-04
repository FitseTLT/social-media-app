import { createSlice, Slice } from "@reduxjs/toolkit";

interface User {
    id?: number;
    name?: string;
    picture?: string;
}

const initialState: User = {};

const userSlice: Slice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setCurrentUser: (state, { payload }) => {
            return payload;
        },
    },
});

export default userSlice.reducer;

export const { setCurrentUser } = userSlice.actions;
