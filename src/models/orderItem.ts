const mongoose = require("mongoose");
const { Schema } = mongoose;

const orderSchema = new Schema({
  orderId: { type: Schema.Types.ObjectId, ref: "order", required: true },
  productId: {
    type: Schema.Types.ObjectId,
    ref: "product",
    required: true,
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now() },
  updatedAt: { type: Date, default: Date.now() },
});

const OrderItem = mongoose.model("orderItem", orderSchema);

module.exports = OrderItem;
