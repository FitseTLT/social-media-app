import { gql, useMutation, useQuery } from "@apollo/client";
import { Avatar, Box, Button, Card, Divider, Typography } from "@mui/material";
import { useEffect, useState } from "react";

const SEARCH_FOR_PEOPLE = gql`
    query ($query: String) {
        searchForPeople(query: $query) {
            id
            name
            picture
            status
        }
    }
`;

const SEND_REQUEST = gql`
    mutation ($acceptedBy: Int!) {
        createFriendRequest(acceptedBy: $acceptedBy) {
            acceptedBy
        }
    }
`;

export const FindFriends = () => {
    const { refetch, data: data } = useQuery(SEARCH_FOR_PEOPLE, {
        fetchPolicy: "network-only",
    });
    const [query, setQuery] = useState("");

    const [
        createRequest,
        { data: friendship, loading: requestLoading, error, called },
    ] = useMutation(SEND_REQUEST);

    const [loadingList, setLoadingList] = useState<number[]>([]);
    const searchHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLoadingList([]);
        const query = e.target.value;
        setQuery(query);
        refetch({
            query,
        });
    };

    const sendRequest = (acceptedBy: number) => {
        createRequest({ variables: { acceptedBy } });
        setLoadingList(loadingList.concat(acceptedBy));
    };

    useEffect(() => {
        if (requestLoading || !called) return;

        const acceptedBy = friendship?.createFriendRequest?.acceptedBy;
        setLoadingList(loadingList.filter((id) => acceptedBy !== id));

        refetch({ query });
    }, [requestLoading]);

    return (
        <>
            <input
                placeholder="Search for new friends"
                className="search-input"
                onChange={searchHandler}
            />
            <Divider sx={{ marginBlock: 2 }} />
            <Box display="flex" alignItems="center" flexDirection="column">
                {!data?.searchForPeople?.length && (
                    <Typography textAlign={"center"} marginTop={2}>
                        No results
                    </Typography>
                )}
                {data?.searchForPeople?.map(
                    ({
                        id,
                        name,
                        picture,
                        status,
                    }: {
                        id: number;
                        name: string;
                        picture: string;
                        status: string;
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
                                <Button
                                    variant="contained"
                                    size="small"
                                    disabled={
                                        !!status || loadingList.includes(id)
                                    }
                                    onClick={() => sendRequest(id)}
                                >
                                    {loadingList.includes(id)
                                        ? "Sending"
                                        : !status
                                        ? "Send Request"
                                        : status.includes("rejected")
                                        ? "Request rejected"
                                        : "Request Sent"}
                                </Button>
                            </Box>
                        </Card>
                    )
                )}
            </Box>
        </>
    );
};
