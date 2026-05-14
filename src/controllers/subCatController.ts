const subCatDB = require("../models/subCategory");
const categoryDB = require("../models/category");
const {fMs} = require("../utils/helper");
import type e = require("express");
const { deleteImage } = require("../utils/saveFiles");


const getAllSubCat = async(req: e.Request, res: e.Response, next: e.NextFunction) => {
    let subCategory = await subCatDB.find().populate("categoryId", "-__v -createdAt -updatedAt");
    fMs(res, "All sub category", subCategory);
}

const getSubCatById = async(req: e.Request, res: e.Response, next: e.NextFunction) => {
    let subCategory = await subCatDB.findById(req.params.id);
    
    if(!subCategory){
        return next(new Error("Sub category not found"));
    }
    
    fMs(res, "Sub category details", subCategory);
}

const createSubCat = async(req: e.Request, res: e.Response, next: e.NextFunction) => {
    let check = await subCatDB.findOne({name : req.body.name});
    let category = await categoryDB.findById(req.body.categoryId);

    if(check){
        return next(new Error("Sub category already exists"));
    }

    let subCategory = await new subCatDB(req.body).save();

    await categoryDB.findByIdAndUpdate(category._id, {$push : {subCategory : subCategory._id}});
    
    fMs(res, "Sub category created successfully", subCategory);
}

const updateSubCat = async(req: e.Request, res: e.Response, next: e.NextFunction) => {
    
    let subCategory = await subCatDB.findById(req.params.id);

    if(!subCategory){
        return next(new Error("Sub category not found"));
    }

    await subCatDB.findByIdAndUpdate(subCategory._id, req.body);

    let updated = await subCatDB.findById(subCategory._id);

    fMs(res, "Sub category updated successfully", updated);
}

const deleteSubCat = async(req: e.Request, res: e.Response, next: e.NextFunction) => {
    let subCategory = await subCatDB.findById(req.params.id);

    if(!subCategory){
        return next(new Error("Sub category not found"));
    }

    deleteImage(subCategory.image);

    await categoryDB.findByIdAndUpdate(subCategory.categoryId, {$pull : {subCategory : subCategory._id}});

    await subCatDB.findByIdAndDelete(req.params.id);

    fMs(res, "Sub category deleted successfully");
}       

module.exports = {
    getAllSubCat,
    getSubCatById,
    createSubCat,
    updateSubCat,
    deleteSubCat
}
