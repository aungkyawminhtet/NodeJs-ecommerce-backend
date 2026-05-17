const mongoose = require("mongoose");
const { Schema } = mongoose;

const tagSchema = new Schema({
    name: {type: String, required: true, unique: true},
    image: {type: String, required: true},
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now},
});

const Tag = mongoose.model("tag", tagSchema);

module.exports = Tag;