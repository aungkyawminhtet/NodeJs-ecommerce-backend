import type e = require("express");
const {
  fMs,
  encode,
  decode,
  token,
  getCache,
  setCache,
  generateTokens,
} = require("../utils/helper");
const crypto = require("crypto");
const DB = require("../models/user");
const roleDb = require("../models/role");
const permitDb = require("../models/permit");

const register = async (
  req: e.Request,
  res: e.Response,
  next: e.NextFunction,
) => {
  try {
    let encodedPassword = encode(req.body.password);
    req.body.password = encodedPassword;

    const user = await DB.findOne({ email: req.body.email });

    if (user) {
      return next(new Error("User already exists"));
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    req.body.emailVerificationToken = verificationToken;

    const createUser = await new DB(req.body).save();

    const { sendEmail } = require("./authController");
    const verificationLink = `${process.env.FRONTEND_URL || "http://localhost:3000/api/v1/auth"}/verify-email?token=${verificationToken}`;
    const emailHtml = `
      <h1>Welcome to our E-Commerce Platform!</h1>
      <p>Thank you for signing up. Please verify your email by clicking the button below:</p>
      <a href="${verificationLink}" style="display:inline-block;padding:10px 20px;background:#28A745;color:#fff;text-decoration:none;border-radius:5px;">Verify Email</a>
      <p>If the button doesn't work, copy-paste this link into your browser: <br/> ${verificationLink}</p>
    `;

    sendEmail(createUser.email, "Verify Your Email Address", emailHtml)
      .catch((err: any) => console.error("Async verification email sending failed:", err));

    fMs(res, "User created successfully. Please check your email to verify your account.", createUser);
  } catch (err) {
    next(err);
  }
};

const login = async (req: any, res: e.Response, next: e.NextFunction) => {
  try {
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

    const tokens = generateTokens(user.toObject());

    const result = {
      ...user.toObject(),
      token: tokens.accessToken,
    };
    delete result.password;

    await setCache(user._id.toString(), result);

    await setCache(`refreshToken:${user._id.toString()}`, tokens.refreshToken);

    // Set HTTP-Only Cookie for Refresh Token
    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: "strict",
    });

    // console.log("user cookie", req.cookies);

    fMs(res, "User logged in successfully", result);
  } catch (err) {
    next(err);
  }
};

const addRole = async (
  req: e.Request,
  res: e.Response,
  next: e.NextFunction,
) => {
  let user = await DB.findById(req.body.userId);
  let role = await roleDb.findById(req.body.roleId);

  let checkRole = await user.roles.filter((r: any) => r.toString() === role._id.toString());

  if (!user) {
    return next(new Error("User not found"));
  }

  if (!role) {
    return next(new Error("Role not found"));
  }

  if (checkRole.length > 0) {
    return next(new Error("Role already has this role"));
  }

  await DB.findByIdAndUpdate(user._id, { $push: { roles: role._id } });
  let result = await DB.findById(user._id)
    .populate("roles permits", "-__v")
    .select("-__v -password");
  fMs(res, "Role added to user successfully", result);
};

const removeRole = async (
  req: e.Request,
  res: e.Response,
  next: e.NextFunction,
) => {
  let user = await DB.findById(req.body.userId);
  let role = await roleDb.findById(req.body.roleId);

  let checkRole = await user.roles.filter((r: any) => r.toString() === role._id.toString());

  if (!user) {
    return next(new Error("User not found"));
  }

  if (!role) {
    return next(new Error("Role not found"));
  }

  if (checkRole.length === 0) {
    return next(new Error("User does not have this role"));
  }

  await DB.findByIdAndUpdate(user._id, { $pull: { roles: role._id } });
  let result = await DB.findById(user._id)
    .populate("roles permits", "-__v")
    .select("-__v -password");
  fMs(res, "Role removed from user successfully", result);
};

const addPermit = async (
  req: e.Request,
  res: e.Response,
  next: e.NextFunction,
) => {
  let user = await DB.findById(req.body.userId);
  let permit = await permitDb.findById(req.body.permitId);

  let checkPermit = await user.permits.filter((p: any) => p.toString() === permit._id.toString());

  if (!user) {
    return next(new Error("User not found"));
  }

  if (!permit) {
    return next(new Error("Permit not found"));
  }

  if (checkPermit.length > 0) {
    return next(new Error("User Permit already has this permit"));
  }

  await DB.findByIdAndUpdate(user._id, { $push: { permits: permit._id } });

  let result = await DB.findById(user._id)
    .populate("roles permits", "-__v")
    .select("-__v -password");

  fMs(res, "Permit added to user successfully", result);
};

const removePermit = async (
  req: e.Request,
  res: e.Response,
  next: e.NextFunction,
) => {
  let user = await DB.findById(req.body.userId);
  let permit = await permitDb.findById(req.body.permitId);

  // console.log(req.body);

  let checkPermit = await user.permits.filter((p: any) => p.toString() === permit._id.toString());

  if (!user) {
    return next(new Error("User not found"));
  }

  if (!permit) {
    return next(new Error("Permit not found"));
  }
  
  if (checkPermit.length === 0) {
    return next(new Error("User does not have this permit"));
  }

  await DB.findByIdAndUpdate(user._id, { $pull: { permits: permit._id } });

  let result = await DB.findById(user._id)
    .populate("roles permits", "-__v")
    .select("-__v -password");

  fMs(res, "Permit removed from user successfully", result);
};


const allUser = async (
  req: e.Request,
  res: e.Response,
  next: e.NextFunction,
) => {
  const users = await DB.find()
    .populate("roles permits", "-__v")
    .select("-__v -password")
    .sort({createdAt: -1});
  fMs(res, "All users", users);
};

module.exports = { register, login, allUser, addRole, removeRole, addPermit, removePermit };
