const mongoose = require("mongoose");
const { Schema } = mongoose;
const warrantySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  image: { type: String, required: true },
  remarks: { type: Array },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  updatedAt: {
    type: Date,
    default: Date.now(),
  },
});

const Warranty = mongoose.model("warranty", warrantySchema);

module.exports = Warranty;
