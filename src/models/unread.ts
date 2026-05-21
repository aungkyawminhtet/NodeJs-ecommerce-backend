const mongoose = require("mongoose");
const { Schema } = mongoose;

const messageSchema = new Schema({
  sender: { type: Schema.Types.ObjectId, ref: "user", required: true },
  receiver: { type: Schema.Types.ObjectId, ref: "user", required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Unread = mongoose.model("unread", messageSchema);

module.exports = Unread;