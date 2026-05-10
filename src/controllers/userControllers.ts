import type e = require("express");
const {
  fMs,
  encode,
  decode,
  token,
  getCache,
  setCache,
} = require("../utils/helper");
const DB = require("../models/user");
const roleDb = require("../models/role");
const permitDb = require("../models/permit");

const register = async (
  req: e.Request,
  res: e.Response,
  next: e.NextFunction,
) => {
  let encodedPassword = encode(req.body.password);
  req.body.password = encodedPassword;

  const user = await DB.findOne({ email: req.body.email });

  if (user) {
    return next(new Error("User already exists"));
  }

  const createUser = await new DB(req.body).save();
  fMs(res, "User created successfully", createUser);
};

const login = async (req: e.Request, res: e.Response, next: e.NextFunction) => {
  const user = await DB.findOne({ email: req.body.email })
    .populate("roles permits", "-__v")
    .select("-__v ");
  if (!user) {
    return next(new Error("User not found"));
  }
  const isPasswordValid = decode(req.body.password, user.password);

  if (!isPasswordValid) {
    return next(new Error("Invalid password"));
  }
  const userToken = token(user.toObject());

  const result = {
    ...user.toObject(),
    token: userToken,
  };
  delete result.password;

  await setCache(user._id, result);

  fMs(res, "User logged in successfully", result);
};

const addRole = async (
  req: e.Request,
  res: e.Response,
  next: e.NextFunction,
) => {
  let user = await DB.findById(req.body.userId);
  let role = await roleDb.findById(req.body.roleId);

  if (!user) {
    return next(new Error("User not found"));
  }

  if (!role) {
    return next(new Error("Role not found"));
  }

  await DB.findByIdAndUpdate(user._id, { $push: { roles: role._id } });
  let result = await DB.findById(user._id)
    .populate("roles permits", "-__v")
    .select("-__v -password");
  fMs(res, "Role added to user successfully", result);
};

const addPermit = async (
  req: e.Request,
  res: e.Response,
  next: e.NextFunction,
) => {
  let user = await DB.findById(req.body.userId);
  let permit = await permitDb.findById(req.body.permitId);

  if (!user) {
    return next(new Error("User not found"));
  }

  if (!permit) {
    return next(new Error("Permit not found"));
  }

  await DB.findByIdAndUpdate(user._id, { $push: { permits: permit._id } });

  let result = await DB.findById(user._id)
    .populate("roles permits", "-__v")
    .select("-__v -password");
    
  fMs(res, "Permit added to user successfully", result);
};

const allUser = async (
  req: e.Request,
  res: e.Response,
  next: e.NextFunction,
) => {
  const users = await DB.find()
    .populate("roles permits", "-__v")
    .select("-__v -password");
  fMs(res, "All users", users);
};

module.exports = { register, login, allUser, addRole, addPermit };
