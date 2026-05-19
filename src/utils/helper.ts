const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
import type e = require("express");
const Redis = require("async-redis").createClient();

const fMs = async (res: e.Response, msg: string, result: any[]) => {
  res.status(200).json({
    con: true,
    msg,
    data: result,
  });
};

const getCache = async (id: any) => {
  try {
    const cached = await Redis.get(id.toString());
    return cached ? JSON.parse(cached) : null;
  } catch (err) {
    console.error("Cache parse error:", err);
    return null;
  }
};

const setCache = async (id: any, data: any) => {
  return await Redis.set(id.toString(), JSON.stringify(data));
};

const deleteCache = async (id: any) => {
  return await Redis.del(id.toString());
};

const isUserOnline = async (userId: any) => {
  const socketId = await getCache(`socket:${userId.toString()}`);
  return socketId ? true : false;
};

const getUserSocketId = async (userId: any) => {
  return await getCache(`socket:${userId.toString()}`);
};

const encode = (data: string) => {
  return bcrypt.hashSync(data);
};

const decode = (data: string, hash: string) => {
  return bcrypt.compareSync(data, hash);
};

const token = (payload: string) => {
  const secrectKey = process.env.SECRET_KEY;
  return jwt.sign(payload, secrectKey, { expiresIn: "1h" });
};

const verifyToken = (token: string) => {
  const secrectKey = process.env.SECRET_KEY;
  try {
    return jwt.verify(token, secrectKey);
  } catch (err) {
    return null;
  }
};

module.exports = {
  fMs,
  encode,
  decode,
  token,
  getCache,
  setCache,
  deleteCache,
  verifyToken,
  isUserOnline,
  getUserSocketId,
};
