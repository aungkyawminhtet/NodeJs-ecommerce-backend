const mongoose = require("mongoose");
const { Schema } = mongoose;

const roleSchema = new Schema({
    name : {type : String, required: true},
    permits : [{type: Schema.Types.ObjectId, ref: "permit"}]
});

const Role = mongoose.model("role", roleSchema);
module.exports = Role;