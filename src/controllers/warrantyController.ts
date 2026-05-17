const warrantyDB = require("../models/warranty");
const {fMs} = require("../utils/helper");
import type e = require("express");
const { deleteImage } = require("../utils/saveFiles");

const getAllWarranty = async(req: e.Request, res: e.Response, next: e.NextFunction) => {
    let warranty = await warrantyDB.find();
    fMs(res, "All warranties", warranty);
}

const getWarrantyById = async(req: e.Request, res: e.Response, next: e.NextFunction) => {
    let warranty = await warrantyDB.findById(req.params.id);
    
    if(!warranty){
        return next(new Error("Warranty not found"));
    }
    
    fMs(res, "Warranty details", warranty);
}

const createWarranty = async(req: e.Request, res: e.Response, next: e.NextFunction) => {
    let check = await warrantyDB.findOne({name : req.body.name});

    if(check){
        return next(new Error("Warranty already exists"));
    }

    req.body.remarks = req.body.remarks.split(",");

    let warranty = await new warrantyDB(req.body).save();
    
    fMs(res, "Warranty created successfully", warranty);
}

const updateWarranty = async(req: e.Request, res: e.Response, next: e.NextFunction) => {
    let check = await warrantyDB.findById(req.params.id);
    if (!check) {
      return next(new Error("Warranty not found"));
    } else {
      await warrantyDB.findByIdAndUpdate(req.params.id, req.body);
      let updatedWarranty = await warrantyDB.findById(req.params.id);
      fMs(res, "Warranty updated successfully", updatedWarranty);
    }
  };

const deleteWarranty = async(req: e.Request, res: e.Response, next: e.NextFunction) => {
    let check = await warrantyDB.findById(req.params.id);
    if (!check) {
      return next(new Error("Warranty not found"));
    } else {
      deleteImage(check.image);
      await warrantyDB.findByIdAndDelete(req.params.id);
      fMs(res, "Warranty deleted successfully", null);
    }
  };

module.exports = {
    getAllWarranty,
    getWarrantyById,
    createWarranty,
    updateWarranty,
    deleteWarranty
}