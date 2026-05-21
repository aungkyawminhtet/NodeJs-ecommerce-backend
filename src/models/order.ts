const mongoose = require("mongoose");
const { Schema } = mongoose;

const orderSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "user", required: true },
  items: [{ type: Schema.Types.ObjectId, ref: "orderItem", required: true }],
  count: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  orderNumber: { type: String, unique: true },
  shippingAddress: {
    fullName: String,
    phone: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  paymentMethod: { type: String, enum: ["STRIPE", "COD", "PAYPAL"], default: "STRIPE" },
  paymentStatus: { type: String, enum: ["PENDING", "COMPLETED", "FAILED", "REFUNDED"], default: "PENDING" },
  paymentIntentId: { type: String },
  shippingCost: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  trackingNumber: { type: String },
  estimatedDelivery: { type: Date },
  notes: { type: String },
  status: { 
    type: String, 
    enum: ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"], 
    default: "PENDING" 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Order = mongoose.model("order", orderSchema);

module.exports = Order;
