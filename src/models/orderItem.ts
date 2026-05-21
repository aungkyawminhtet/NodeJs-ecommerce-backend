const mongoose = require("mongoose");
const { Schema } = mongoose;

const orderItemSchema = new Schema({
  orderId: { type: Schema.Types.ObjectId, ref: "order", required: true },
  productId: {
    type: Schema.Types.ObjectId,
    ref: "product",
    required: true,
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  count: { type: Number, required: true, default: 1 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const OrderItem = mongoose.model("orderItem", orderItemSchema);

module.exports = OrderItem;
