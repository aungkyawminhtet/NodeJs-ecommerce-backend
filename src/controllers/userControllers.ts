import type e = require("express");
const { fMs, encode, decode, token } = require('../utils/helper');
const DB = require("../models/user");

const register = async (req: e.Request , res : e.Response, next: e.NextFunction) => {

    let encodedPassword = encode(req.body.password);
    req.body.password = encodedPassword;

    const user = await DB.findOne({email: req.body.email});

    if(user) {
        return next(new Error("User already exists"));
    }

    const createUser = await new DB(req.body).save();
    fMs(res, "User created successfully", createUser);

}

const allUser = async(req: e.Request , res : e.Response, next: e.NextFunction) => {
    const users = await DB.find();
    fMs(res, "All users", users);
}

module.exports = { register, allUser };