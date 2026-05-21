const mongoose = require("mongoose");
const { Schema } = mongoose;
const productSchema = new Schema({
  name: { type: String, required: true, unique: true },
  price: { type: Number, required: true },
  brand: { type: String, required: true },
  category: { type: Schema.Types.ObjectId, ref: "category", required: true },
  subCategory: {
    type: Schema.Types.ObjectId,
    ref: "subCategory",
    required: true,
  },
  childCategory: {
    type: Schema.Types.ObjectId,
    ref: "childCategory",
    required: true,
  },
  tag: { type: Schema.Types.ObjectId, ref: "tag", required: true },
  discount: { type: Number, required: true },
  features: { type: Array, required: true },
  description: { type: String, required: true },
  details: { type: String, required: true },
  status: { type: String, required: true },
  delivery: [{ type: Schema.Types.ObjectId, ref: "delivery", required: true }],
  warranty: [{ type: Schema.Types.ObjectId, ref: "warranty", required: true }],
  images: { type: Array, required: true },
  colors: { type: Array, required: true },
  sizes: { type: String, required: true },
  rating: { type: Number, default: 0, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Product = mongoose.model("product", productSchema);

module.exports = Product;
