const mongoose = require("mongoose");
const { Schema } = mongoose;

const cartItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: "product", required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  selected: { type: Boolean, default: true },
  addedAt: { type: Date, default: Date.now },
});

const cartSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true,
    unique: true,
  },
  items: [cartItemSchema],
  status: { type: String, enum: ["PENDING", "ACTIVE", "ORDERED"], default: "PENDING" },
  totalItems: { type: Number, default: 0 },
  totalPrice: { type: Number, default: 0 },
  
  updatedAt: { type: Date, default: Date.now },
});

const Cart = mongoose.model("cart", cartSchema);
module.exports = Cart;
