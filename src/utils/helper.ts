const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
import type e = require("express");

const fMs = async(res: e.Response, msg:string, result: any[]) => {
    res.status(200).json({
        con: true,
        msg,
        data: result
    });
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

module.exports = {fMs, encode, decode, token};