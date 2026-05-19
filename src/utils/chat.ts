const {
  getCache,
  setCache,
  deleteCache,
  isUserOnline,
  getUserSocketId,
} = require("../utils/helper");
const messageDB = require("../models/message");
const unReadDB = require("../models/unread");

const liveUser = async (socketId: string, Data: any) => {
  // Store socketId mapping: socket:userId -> socketId
  await setCache(`socket:${Data._id.toString()}`, socketId);
  // Store user data: user:userId -> userData
  await setCache(
    `user:${Data._id.toString()}`,
    Data.toObject ? Data.toObject() : Data,
  );

  console.log("User online:", Data._id.toString());
};

const initialize = async (io: any, socket: any) => {
  socket["currentId"] = socket.userData._id.toString();

  liveUser(socket.currentId, socket.userData);

  socket.on("message", (data: any) => incommingMsg(io, socket, data));

  // Handle disconnect - remove user from online list
  socket.on("disconnect", async () => {
    await deleteCache(`socket:${socket.currentId}`);
    console.log("User disconnected:", socket.currentId);
  });
};

let incommingMsg = async (io: any, socket: any, data: any) => {

  let msg = await new messageDB(data).save();

  let message = await messageDB
    .findById(msg._id)
    .populate("sender", "name _id")
    .populate("receiver", "name _id");

  let receiverSocketId = await getUserSocketId(message.receiver._id.toString());

  console.log("Receiver online:", !!receiverSocketId);

  if (receiverSocketId) {
    let receiverSocket = io.of("/chat").to(receiverSocketId);
    // console.log("to socket id", receiverSocket);
    if (receiverSocket) {
      receiverSocket.emit("message", message);
        console.log("Message sent to receiver:", message);
    } else {
      console.log("Failed to send message: Receiver socket not found");
    }
  } else {
    await new unReadDB({
      sender: message.sender._id,
      receiver: message.receiver._id,
    }).save();
    console.log("Message saved as unread");
  }
};

module.exports = {
  initialize,
};
