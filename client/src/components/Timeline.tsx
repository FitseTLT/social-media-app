import { gql, useQuery } from "@apollo/client";

const FETCH_TIMELINE = gql`
    query {
        fetchTimeline {
            id
            User {
                id
                name
                picture
            }
            postedBy
            content
            media
            likes
            dislikes
            lastComment {
                content
                media
            }
        }
    }
`;

export const Timeline = () => {
    const { data, error, loading } = useQuery(FETCH_TIMELINE);

    return <h1>{JSON.stringify(data)}</h1>;
};
