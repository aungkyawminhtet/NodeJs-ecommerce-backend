import type e = require("express");
const { fMs, encode, decode, token, getCache, setCache } = require('../utils/helper');
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

const login = async (req: e.Request , res : e.Response, next: e.NextFunction) => {
    const user = await DB.findOne({email: req.body.email}).populate("roles permits", "-__v").select("-__v ");
    if(!user) {
        return next(new Error("User not found"));
    }
    const isPasswordValid = decode(req.body.password, user.password);

    if(!isPasswordValid) {
        return next(new Error("Invalid password"));
    }
    const userToken = token(user.toObject());

    const result = {
        ...user.toObject(),
        token: userToken
    }
    delete result.password;

    await setCache(user._id, result);

    fMs(res, "User logged in successfully", result);
}

const allUser = async(req: e.Request , res : e.Response, next: e.NextFunction) => {
    const users = await DB.find();
    fMs(res, "All users", users);
}

module.exports = { register, login, allUser };