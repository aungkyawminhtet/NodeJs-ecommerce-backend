const mongoose = require("mongoose");
const {Schema} = mongoose;

const deliverySchema = new Schema({
    name: {type: String, required: true},
    price: {type: Number, required: true},
    duration: {type: String, required: true},
    image: {type: String, required: true},
    remarks: {type: Array},
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now},
});

const Delivery = mongoose.model("delivery", deliverySchema);

module.exports = Delivery;