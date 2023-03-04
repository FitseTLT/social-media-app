import { FriendshipStatus } from "../models/ENUMS";
import { Friendship } from "../models/Friendship";
import { Op } from "sequelize";
import { User } from "../models/User";
import { friendsPerPage, peoplesPerPage } from "../constants";
import { sequelize } from "../setup";

export async function createFriendRequest(
    { requestedBy, acceptedBy }: { requestedBy: number; acceptedBy: number },
    { user }: { user: number }
) {
    if (user !== requestedBy)
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
    { user }: { user: number }
) {
    const friendship = await Friendship.findByPk(friendshipId);

    if (
        !friendship ||
        friendship.status !== FriendshipStatus.Requested ||
        friendship?.acceptedBy !== user
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

export async function listFriends(
    { query = "", page = 0 }: { query: string; page: number },
    { user }: { user: number }
) {
    const friendshipList = await Friendship.findAll({
        where: {
            [Op.and]: [
                { status: FriendshipStatus.Accepted },
                { [Op.or]: [{ requestedBy: user }, { acceptedBy: user }] },
            ],
        },
    });

    const friendsListIds = friendshipList.map((friendship) =>
        friendship.requestedBy === user
            ? friendship.acceptedBy
            : friendship.requestedBy
    );
    const friendsList = await User.findAll({
        where: {
            [Op.and]: [
                { id: { [Op.in]: friendsListIds } },
                { name: { [Op.like]: `%${query}%` } },
            ],
        },
        order: [["name", "ASC"]],
        limit: friendsPerPage,
        offset: page * friendsPerPage,
    });

    return friendsList.map(({ id, name, picture }) => ({
        id,
        name,
        picture,
    }));
}

export async function searchForPeople(
    { query = "", page = 0 }: { query: string; page: number },
    { user }: { user: number }
) {
    const friendshipList = await Friendship.findAll({
        where: {
            [Op.or]: [{ requestedBy: user }, { acceptedBy: user }],
        },
    });

    const friendsListIds = friendshipList.map((friendship) =>
        friendship.requestedBy === user
            ? friendship.acceptedBy
            : friendship.requestedBy
    );

    const peoplesList = await User.findAll({
        where: {
            id: { [Op.notIn]: friendsListIds.concat(user) },
            name: { [Op.like]: `%${query}%` },
        },
        order: [["name", "ASC"]],
        limit: peoplesPerPage,
        offset: page * peoplesPerPage,
    });

    return peoplesList.map(({ id, name, picture }) => ({
        id,
        name,
        picture,
    }));
}

export async function listFriendRequests(
    { page = 0 }: { page: number },
    { user }: { user: number }
) {
    const [friendshipList] = await sequelize.query(`
    select friendships.id as friendshipId, users.name,
     users.picture, users.id as friendId from friendships join
    users on friendships.requestedBy = users.id 
    where friendships.status = "${FriendshipStatus.Requested}"
    and friendships.acceptedBy = ${user} order by users.name asc
     limit ${friendsPerPage} offset ${page * friendsPerPage} 
    `);

    return friendshipList;
}
