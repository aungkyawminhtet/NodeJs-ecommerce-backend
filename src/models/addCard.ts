const mongoose = require("mongoose");
const { Schema } = mongoose;

const addCardSchema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: "user", required: true},
    product: {type: Schema.Types.ObjectId, ref: "product", required: true},
    quantity: {type: Number, default: 1, required: true},
    checkout: {type: Boolean, default: false, required: true},
    createdAt: { type: Date, default: Date.now() },
    updatedAt: { type: Date, default: Date.now() },
})