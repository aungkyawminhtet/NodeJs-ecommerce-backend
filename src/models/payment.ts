const mongoose = require("mongoose");
const { Schema } = mongoose;

const paymentSchema = new Schema({
  orderId: { type: Schema.Types.ObjectId, ref: "order", required: true, unique: true },
  userId: { type: Schema.Types.ObjectId, ref: "user", required: true },
  stripeSessionId: { type: String, unique: true },
  stripePaymentIntentId: { type: String },
  amount: { type: Number, required: true },
  currency: { type: String, default: "usd" },
  status: { type: String, enum: ["PENDING", "COMPLETED", "FAILED", "REFUNDED"], default: "PENDING" },
  paymentMethod: { type: String },
  refundId: { type: String },
  metadata: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Payment = mongoose.model("payment", paymentSchema);
module.exports = Payment;
