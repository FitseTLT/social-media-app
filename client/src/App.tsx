import "./App.css";
import { Route, Routes } from "react-router-dom";
import { Signup } from "./components/Auth/Signup";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Login } from "./components/Auth/Login";
import MainLayout from "./components/MainLayout";
import { ApolloClient } from "@apollo/client";
import { InMemoryCache } from "@apollo/client/cache";
import { ApolloProvider } from "@apollo/client/react/context";
import { EditProfile } from "./components/EditProfile";
import { createUploadLink } from "apollo-upload-client";
import { Account } from "./components/Account";
import { FindFriends } from "./components/Friends/FindFriends";
import { UserPosts } from "./components/Posts/UserPosts";
import { FriendRequests } from "./components/Friends/FriendRequests";
import { FriendsList } from "./components/Friends/FriendsList";
import { FriendDetail } from "./components/Friends/FriendDetail";
import { RecentMessageList } from "./components/Message/RecentMessageList";
import { DirectMessage } from "./components/Message/DirectMessage";
import { io } from "socket.io-client";
import { Timeline } from "./components/Posts/Timeline";

const link = createUploadLink({
    uri: "http://localhost:4000/graphql",
    credentials: "include",
});

const socket = io("http://localhost:4000", { autoConnect: false });

const client = new ApolloClient({
    link,
    cache: new InMemoryCache({
        typePolicies: {
            Query: {
                fields: {
                    fetchTimeline: {
                        keyArgs: false,
                        merge(existing = [], incoming) {
                            return [...existing, ...incoming];
                        },
                    },
                    getComments: {
                        keyArgs: false,
                        merge(existing = [], incoming) {
                            return [...existing, ...incoming];
                        },
                    },
                    listPosts: {
                        keyArgs: false,
                        merge(existing = [], incoming) {
                            return [...existing, ...incoming];
                        },
                    },
                    listMessages: {
                        keyArgs: ["id"],
                        merge(existing = [], incoming) {
                            return [...existing, ...incoming];
                        },
                    },
                },
            },
        },
    }),
});

function App() {
    return (
        <div className="App">
            <ApolloProvider client={client}>
                <ThemeProvider theme={theme}>
                    <Routes>
                        <Route
                            path="/"
                            element={<MainLayout socket={socket} />}
                        >
                            <Route index element={<Timeline />}></Route>
                            <Route path="/profile" element={<EditProfile />} />
                            <Route path="/account" element={<Account />}>
                                <Route index element={<UserPosts />} />
                                <Route
                                    path="find-friends"
                                    element={<FindFriends />}
                                />
                                <Route
                                    path="friend-requests"
                                    element={<FriendRequests />}
                                />
                                <Route
                                    path="friends"
                                    element={<FriendsList />}
                                />
                                <Route
                                    path="friends/:id"
                                    element={<FriendDetail />}
                                />
                            </Route>
                            <Route
                                path="/chat"
                                element={<RecentMessageList />}
                            />
                            <Route
                                path="/chat/:friendId"
                                element={<DirectMessage socket={socket} />}
                            />
                        </Route>
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/login" element={<Login />} />
                    </Routes>
                </ThemeProvider>
            </ApolloProvider>
        </div>
    );
}

const theme = createTheme({
    components: {
        MuiTypography: {
            styleOverrides: { root: { overflowWrap: "break-word" } },
        },
        MuiTab: {
            styleOverrides: {
                root: {
                    ":focus": { outline: "none" },
                    textTransform: "capitalize",
                },
            },
        },
        MuiInputBase: {
            styleOverrides: {
                root: {
                    margin: "0 !important",
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    ":focus": { outline: "none" },
                },
            },
        },
    },
});

export default App;
