import { gql, useQuery } from "@apollo/client";
import { Avatar, Box, Button, Card, Divider, Typography } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";

const SEARCH_FOR_PEOPLE = gql`
    query ($query: String) {
        listFriends(query: $query) {
            id
            name
            picture
        }
    }
`;

export const FriendsList = () => {
    const { refetch, data } = useQuery(SEARCH_FOR_PEOPLE, {
        fetchPolicy: "network-only",
    });

    const searchHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        refetch({
            query,
        });
    };

    return (
        <>
            <input
                placeholder="Search for friends"
                className="search-input"
                onChange={searchHandler}
            />
            <Divider sx={{ marginBlock: 2 }} />
            <Box display="flex" alignItems="center" flexDirection="column">
                {!data?.listFriends?.length && (
                    <Typography textAlign={"center"} marginTop={2}>
                        No results
                    </Typography>
                )}
                {data?.listFriends?.map(
                    ({
                        id,
                        name,
                        picture,
                    }: {
                        id: number;
                        name: string;
                        picture: string;
                    }) => (
                        <Card
                            elevation={3}
                            key={id}
                            sx={{
                                p: 4,
                                display: "flex",
                                alignItems: "center",
                                minWidth: "300px",
                                my: 1,
                            }}
                        >
                            <Avatar src={picture} />
                            <Box marginLeft="auto">
                                <Typography textAlign="center" mb={1}>
                                    {name}
                                </Typography>
                                <Link
                                    to={`/account/friends/${id}`}
                                    state={{ name, picture }}
                                >
                                    See detail
                                </Link>
                            </Box>
                        </Card>
                    )
                )}
            </Box>
        </>
    );
};
