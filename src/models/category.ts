const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    name : {type: String, required: true},
    image : {type : String, required: true},
    subCategory : [{type: mongoose.Schema.Types.ObjectId, ref: "subCategory"}],
    createdAt : {type: Date, default: Date.now},
    updatedAt : {type: Date, default: Date.now},
})

const Category = mongoose.model("category", categorySchema);

module.exports = Category;