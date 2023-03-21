import { gql, useMutation, useQuery } from "@apollo/client";
import { Avatar, Box, Button, Card, Typography } from "@mui/material";
import { useEffect, useState } from "react";

const LIST_FRIEND_REQUESTS = gql`
    query {
        listFriendRequests {
            friendshipId
            name
            picture
        }
    }
`;

const ACCEPT_FRIEND_REQUEST = gql`
    mutation ($friendshipId: Int!, $accepted: Boolean) {
        acceptFriendRequest(friendshipId: $friendshipId, accepted: $accepted) {
            id
        }
    }
`;

export const FriendRequests = () => {
    const { data, refetch } = useQuery(LIST_FRIEND_REQUESTS, {
        fetchPolicy: "network-only",
    });
    const [acceptRequest, { data: requestData, loading, called }] = useMutation(
        ACCEPT_FRIEND_REQUEST
    );
    const [disableList, setDisableList] = useState<number[]>([]);

    const sendRequest = (friendshipId: number, accept?: boolean) => {
        setDisableList(disableList.concat(friendshipId));
        acceptRequest({
            variables: {
                accept,
                friendshipId,
            },
        });
    };

    useEffect(() => {
        if (!called || loading) return;

        const friendshipId = requestData?.acceptFriendRequest?.id;
        setDisableList(disableList.filter((v) => v !== friendshipId));

        refetch();
    }, [loading]);

    if (!data?.listFriendRequests?.length)
        return (
            <Typography textAlign={"center"} marginTop={2}>
                No Friend Requests
            </Typography>
        );

    return (
        <Box display="flex" alignItems="center" flexDirection="column">
            {data?.listFriendRequests?.map(
                ({
                    friendshipId,
                    name,
                    picture,
                }: {
                    friendshipId: number;
                    name: string;
                    picture: string;
                }) => (
                    <Card
                        elevation={3}
                        key={friendshipId}
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
                                sx={{ fontSize: "10px" }}
                                variant="contained"
                                size="small"
                                onClick={(e) => sendRequest(friendshipId)}
                                disabled={disableList.includes(friendshipId)}
                            >
                                Accept
                            </Button>
                            <Button
                                variant="contained"
                                sx={{
                                    marginLeft: 1,
                                    fontSize: "10px",
                                    bgcolor: "#919191",
                                }}
                                size="small"
                                onClick={(e) =>
                                    sendRequest(friendshipId, false)
                                }
                                disabled={disableList.includes(friendshipId)}
                            >
                                Reject
                            </Button>
                        </Box>
                    </Card>
                )
            )}
        </Box>
    );
};
