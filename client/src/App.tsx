import "./App.css";
import { Route, Routes } from "react-router-dom";
import { Signup } from "./components/Signup";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Login } from "./components/Login";
import MainLayout from "./components/MainLayout/MainLayout";
import { ApolloClient } from "@apollo/client";
import { InMemoryCache } from "@apollo/client/cache";
import { ApolloProvider } from "@apollo/client/react/context";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { EditProfile } from "./components/EditProfile";
import { createUploadLink } from "apollo-upload-client";
import { Account } from "./components/Account";
import { Timeline } from "./components/Timeline";
import { FindFriends } from "./components/FindFriends";
import { Posts } from "./components/Posts";
import { FriendRequests } from "./components/FriendRequests";

const link = createUploadLink({
    uri: "http://localhost:4000/graphql",
    credentials: "include",
});

const client = new ApolloClient({ link, cache: new InMemoryCache() });

function App() {
    return (
        <div className="App">
            <Provider store={store}>
                <ApolloProvider client={client}>
                    <ThemeProvider theme={theme}>
                        <Routes>
                            <Route path="/" element={<MainLayout />}>
                                <Route index element={<Timeline />}></Route>
                                <Route
                                    path="/profile"
                                    element={<EditProfile />}
                                />
                                <Route path="/account" element={<Account />}>
                                    <Route index element={<Posts />} />
                                    <Route
                                        path="find-friends"
                                        element={<FindFriends />}
                                    />
                                    <Route
                                        path="friend-requests"
                                        element={<FriendRequests />}
                                    />
                                </Route>
                            </Route>
                            <Route path="/signup" element={<Signup />} />
                            <Route path="/login" element={<Login />} />
                        </Routes>
                    </ThemeProvider>
                </ApolloProvider>
            </Provider>
        </div>
    );
}

const theme = createTheme({
    components: {
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
