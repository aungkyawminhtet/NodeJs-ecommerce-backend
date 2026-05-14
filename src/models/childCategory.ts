const mongoose = require("mongoose");
const { Schema } = mongoose;

const childCategorySchema = new Schema({
    name: {type: String, required: true, unique: true},
    image: {type: String, required: true},
    subCategoryId: {type: Schema.Types.ObjectId, ref: "subCategory"},
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now},
});

const childCategory = mongoose.model("childCategory", childCategorySchema);

module.exports = childCategory;