import { useLocation, useParams } from "react-router-dom";
import { UserPosts } from "../Posts/UserPosts";

export const FriendDetail = () => {
    const { id } = useParams();
    const { state } = useLocation();

    return (
        <UserPosts id={Number(id)!} name={state.name} picture={state.picture} />
    );
};
