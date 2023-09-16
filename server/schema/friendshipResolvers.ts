import { FriendshipStatus } from "../models/ENUMS";
import { Friendship } from "../models/Friendship";
import { Op } from "sequelize";
import { User } from "../models/User";
import { sequelize } from "../setup";

export async function createFriendRequest(
  { acceptedBy }: { acceptedBy: number },
  { user }: { user: number }
) {
  try {
    const friendRequest = await Friendship.create({
      requestedBy: user,
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
    status: accepted ? FriendshipStatus.Accepted : FriendshipStatus.Rejected,
    acceptedAt: new Date(),
  });

  return friendship;
}

export async function listFriends(
  { query = "" }: { query: string },
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
  });

  return friendsList.map(({ id, name, picture }) => ({
    id,
    name,
    picture,
  }));
}

export async function searchForPeople(
  { query = "" }: { query: string },
  { user }: { user: number }
) {
  const friendshipList = await Friendship.findAll({
    where: {
      [Op.or]: [{ requestedBy: user }, { acceptedBy: user }],
    },
  });

  const acceptedFriends = friendshipList
    .filter((friendship) => friendship.status === FriendshipStatus.Accepted)
    .map((friendship) =>
      friendship.requestedBy === user
        ? friendship.acceptedBy
        : friendship.requestedBy
    );

  const peoplesList = await User.findAll({
    where: {
      id: { [Op.notIn]: acceptedFriends.concat(user) },
      ...(query.length && { name: { [Op.like]: `%${query}%` } }),
    },
    order: [["name", "ASC"]],
  });

  return peoplesList.map(({ id, name, picture }) => {
    const friendship = friendshipList.find(
      ({ requestedBy, acceptedBy }) => id === requestedBy || id === acceptedBy
    );

    return {
      id,
      name,
      picture,
      status: friendship?.status,
    };
  });
}

export async function listFriendRequests(_: any, { user }: { user: number }) {
  const friendshipList = (await Friendship.findAll({
    where: {
      status: FriendshipStatus.Requested,
      acceptedBy: user,
    },
    include: [{ model: User, as: "RequestedUser" }],
  })) as any[];

  return friendshipList.map(
    ({ id: friendshipId, RequestedUser: { id: friendId, name, picture } }) => ({
      friendshipId,
      friendId,
      name,
      picture,
    })
  );
}
