const mongoose = require("mongoose");
const { Schema } = mongoose;

const subCategorySchema = new Schema({
    name: {type: String, required: true, unique: true},
    image: {type: String, required: true},
    categoryId: {type: Schema.Types.ObjectId, ref: "category"},
    childCategories: [{type: Schema.Types.ObjectId, ref: "childCategory"}],
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now},
});


const subCategory = mongoose.model("subCategory", subCategorySchema);

module.exports = subCategory;
