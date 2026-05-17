const mongoose = require("mongoose");
const { Schema } = mongoose;

const orderSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "user", required: true},
  items: [{ type: Schema.Types.ObjectId, ref: "orderItem", required: true }],
  count: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  status: { type: String, enum: ["PENDING", "SHIPPED", "DELIVERED", "CANCELLED"], default: "PENDING" },
  createdAt: { type: Date, default: Date.now() },
  updatedAt: { type: Date, default: Date.now() },
});

const Order = mongoose.model("order", orderSchema);

module.exports = Order;
