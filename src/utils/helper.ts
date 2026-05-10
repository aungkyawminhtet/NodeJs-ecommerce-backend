const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
import type e = require("express");
const Redis = require('async-redis').createClient();

const fMs = async(res: e.Response, msg:string, result: any[]) => {
    res.status(200).json({
        con: true,
        msg,
        data: result
    });
}

const getCache = async(id : any) => {
    return await JSON.parse(await Redis.get(id.toString()));
}

const setCache = async(id: any, data: any) => {
    return await Redis.set(id.toString(), JSON.stringify(data));
}

const deleteCache = async(id: any) => {
    return await Redis.del(id.toString());
}

const encode = (data: string) => {
    return bcrypt.hashSync(data);
}

const decode = (data: string, hash: string) => {
    return bcrypt.compareSync(data, hash);
}

const token = (payload : string) => {
    const secrectKey = process.env.SECRET_KEY;
    return jwt.sign(payload, secrectKey, {expiresIn: '1h'});
}

const verifyToken = (token: string) => {
    const secrectKey = process.env.SECRET_KEY;
    try {
        return jwt.decode(token, secrectKey);
    } catch (err) {
        return null;
    }
}

module.exports = {fMs, encode, decode, token, getCache, setCache, deleteCache, verifyToken};