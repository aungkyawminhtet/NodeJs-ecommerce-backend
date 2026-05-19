const mongoose = require("mongoose");
const { Schema } = mongoose;

const messageSchema = new Schema({
  sender: { type: Schema.Types.ObjectId, ref: "user", required: true },
  receiver: { type: Schema.Types.ObjectId, ref: "user", required: true },
  type: {
    type: String,
    enum: ["Text", "Image"],
    default: "Text",
    required: true,
  },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now() },
  updatedAt: { type: Date, default: Date.now() },
});

const Message = mongoose.model("message", messageSchema);

module.exports = Message;