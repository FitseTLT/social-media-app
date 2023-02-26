import { FriendshipStatus } from "../models/ENUMS";
import { Friendship } from "../models/Friendship";

export async function createFriendRequest(
    { requestedBy, acceptedBy }: { requestedBy: number; acceptedBy: number },
    { user }: { user: string }
) {
    if (Number(user) !== requestedBy)
        throw new Error("requested by field is not the logged in user");
    try {
        const friendRequest = await Friendship.create({
            requestedBy,
            acceptedBy,
        });
        return friendRequest;
    } catch (e) {
        throw e;
    }
}
export async function acceptFriendRequest(
    {
        friendshipId,
        accepted = true,
    }: {
        friendshipId: number;
        accepted: boolean;
    },
    { user }: { user: string }
) {
    const friendship = await Friendship.findByPk(friendshipId);

    if (
        !friendship ||
        friendship.status !== FriendshipStatus.Requested ||
        friendship?.acceptedBy !== Number(user)
    )
        throw new Error("Cannot accept the friend request");

    await friendship.update({
        status: accepted
            ? FriendshipStatus.Accepted
            : FriendshipStatus.Rejected,
        acceptedAt: new Date(),
    });

    return friendship;
}
