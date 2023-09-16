import { Op } from "sequelize";
import { Server, Socket } from "socket.io";
import { httpServer } from "./index";
import { FriendshipStatus, UserStatus } from "./models/ENUMS";
import { Friendship } from "./models/Friendship";
import { OnlineStatus } from "./models/OnlineStatus";

export let socketIO: Server;
export const socketSetup = () => {
  socketIO = new Server<any, any, any, { userId: number }>(httpServer, {
    cors: { origin: process.env.CLIENT_URL },
  });
  socketIO.use((socket, next) => {
    const userId = socket.handshake.auth.userId;
    if (!userId) return next(new Error("Not authorized to connect"));

    socket.data.userId = userId;
    next();
  });

  socketIO.on("connect", async (socket) => {
    const userId = socket.data.userId;
    if (!userId) return;

    console.log(socket.data.userId, "connected");
    socket.join(userId.toString());
    sendStatus(socket);

    socket.on("offer", (friendId, data) => {
      socket.to(friendId.toString()).emit("offer", data);
    });

    socket.on("answer", (friendId, data) => {
      socket.to(friendId.toString()).emit("answer", data);
    });

    socket.on("candidate", (friendId, candidate) => {
      socket.to(friendId.toString()).emit("candidate", candidate);
    });
    socket.on("end-call", (friendId) => {
      socket.to(friendId.toString()).emit("end-call", userId);
    });
    socket.on("disconnect", () => {
      sendStatus(socket, UserStatus.Disconnected);
    });
  });
};

const sendStatus = async (
  socket: Socket,
  status: UserStatus = UserStatus.Connected
) => {
  const userId = socket.data.userId;

  // persist data to db

  const onlineStatus = await OnlineStatus.upsert({
    userId,
    status,
    lastConnected: new Date(),
  });

  const friendships = await Friendship.findAll({
    where: {
      status: FriendshipStatus.Accepted,
      [Op.or]: [{ acceptedBy: userId }, { requestedBy: userId }],
    },
  });

  const friendIds = friendships.map(({ acceptedBy, requestedBy }) =>
    acceptedBy === userId ? requestedBy.toString() : acceptedBy.toString()
  );

  socket.to(friendIds).emit("user-status", onlineStatus[0]);

  // send connected friends list
  if (status === UserStatus.Connected) {
    const onlineStatuses = await OnlineStatus.findAll({
      where: { userId: { [Op.in]: friendIds } },
    });

    socket.emit("friends-status", onlineStatuses);
  }
};
