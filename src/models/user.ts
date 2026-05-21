const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
    name : {type : String, required: true},
    email : {type : String, required: true, unique: true},
    phone : {type : String, required: true, unique: true},
    password : {type : String, required: true},
    roles: [{type: Schema.Types.ObjectId, ref: "role"}],
    permits: [{type: Schema.Types.ObjectId, ref: "permit"}],
    avatar : {type : String, required: false},
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    wishlist: [{ type: Schema.Types.ObjectId, ref: "product" }],
    createdAt : {type : Date, default: Date.now}
})

const User = mongoose.model("user", userSchema);
module.exports = User;