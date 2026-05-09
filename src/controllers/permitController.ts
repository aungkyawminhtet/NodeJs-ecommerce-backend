import type e = require("express");
const Db = require("../models/permit");
const { fMs } = require("../utils/helper");

const allPermit = async (
  req: e.Request,
  res: e.Response,
  next: e.NextFunction,
) => {
  let permits = await Db.find();
  fMs(res, "All permits", permits);
};

const getPermitById = async (
  req: e.Request,
  res: e.Response,
  next: e.NextFunction,
) => {
  let permit = await Db.findById(req.params.id);
  if (!permit) {
    return next(new Error("Permit not found"));
  } else {
    fMs(res, "Permit found", permit);
  }
};

const addPermit = async (
  req: e.Request,
  res: e.Response,
  next: e.NextFunction,
) => {
  let check = await Db.findOne({ name: req.body.name });
  if (check) {
    return next(new Error("Permit already exists"));
  } else {
    let newPermit = await new Db(req.body).save();
    fMs(res, "Permit created successfully", newPermit);
  }
};

const updatePermit = async (
  req: e.Request,
  res: e.Response,
  next: e.NextFunction,
) => {
  let check = await Db.findById(req.params.id);
  if (!check) {
    return next(new Error("Permit not found"));
  } else {
    await Db.findByIdAndUpdate(req.params.id, req.body);
    let updatedPermit = await Db.findById(req.params.id);
    fMs(res, "Permit updated successfully", updatedPermit);
  }
};

const deletePermit = async (
  req: e.Request,
  res: e.Response,
  next: e.NextFunction,
) => {
  let check = await Db.findById(req.params.id);
  if (!check) {
    return next(new Error("Permit not found"));
  } else {
    await Db.findByIdAndDelete(req.params.id);
    fMs(res, "Permit deleted successfully", null);
  }
};

module.exports = {
  addPermit,
  allPermit,
  getPermitById,
  updatePermit,
  deletePermit,
};
