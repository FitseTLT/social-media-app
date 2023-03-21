import { configureStore } from "@reduxjs/toolkit";
import callSlice from "./callSlice";
import messageSlice from "./messageSlice";
import userSlice from "./userSlice";

export const store = configureStore({
    reducer: { user: userSlice, message: messageSlice, call: callSlice },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
