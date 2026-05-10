const Db = require("../models/role");
const permitDb = require("../models/permit");
const { fMs } = require("../utils/helper");
import type e = require("express");

const allRole = async (
  req: e.Request,
  res: e.Response,
  next: e.NextFunction,
) => {
  let roles = await Db.find().populate("permits", "-__v");
  fMs(res, "All roles", roles);
};

const getRoleById = async (
  req: e.Request,
  res: e.Response,
  next: e.NextFunction,
) => {
  let role = await Db.findById(req.params.id)
    .populate("permits", "-__v")
    .select("-__v");
  if (!role) {
    return next(new Error("Role not found"));
  } else {
    fMs(res, "Role found", role);
  }
};

const createRole = async (
  req: e.Request,
  res: e.Response,
  next: e.NextFunction,
) => {
  
  let check = await Db.findOne({ name: req.body.name });
  if (check) {
    return next(new Error("Role already exists"));
  } else {
    let newRole = await new Db(req.body).save();
    fMs(res, "Role created successfully", newRole);
  }
};

const roleAddPermit = async (
  req: e.Request,
  res: e.Response,
  next: e.NextFunction,
) => {
  let role = await Db.findById(req.body.roleId);
  let permit = await permitDb.findById(req.body.permitId);
  if (!role) {
    return next(new Error("Role not found"));
  } else if (!permit) {
    return next(new Error("Permit not found"));
  } else {
    await Db.findByIdAndUpdate(role._id, { $push: { permits: permit._id } });
    let result = await Db.findById(role._id);
    fMs(res, "Permit added to role successfully", result);
  }
};

const removePermitFromRole = async (
  req: e.Request,
  res: e.Response,
  next: e.NextFunction,
) => {
  let role = await Db.findById(req.body.roleId);
  let permit = await permitDb.findById(req.body.permitId);
  if (!role) {
    return next(new Error("Role not found"));
  } else if (!permit) {
    return next(new Error("Permit not found"));
  } else {
    await Db.findByIdAndUpdate(role._id, { $pull: { permits: permit._id } });
    let result = await Db.findById(role._id);
    fMs(res, "Permit removed from role successfully", result);
  }
};

const updateRole = async (
  req: e.Request,
  res: e.Response,
  next: e.NextFunction,
) => {
  let check = await Db.findById(req.params.id);
  if (!check) {
    return next(new Error("Role not found"));
  } else {
    await Db.findByIdAndUpdate(req.params.id, req.body);
    let updatedRole = await Db.findById(req.params.id);
    fMs(res, "Role updated successfully", updatedRole);
  }
};

const deleteRole = async (
  req: e.Request,
  res: e.Response,
  next: e.NextFunction,
) => {
  let check = await Db.findById(req.params.id);
  if (!check) {
    return next(new Error("Role not found"));
  } else {
    await Db.findByIdAndDelete(req.params.id);
    fMs(res, "Role deleted successfully", null);
  }
};

module.exports = {
  allRole,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  roleAddPermit,
  removePermitFromRole,
};
