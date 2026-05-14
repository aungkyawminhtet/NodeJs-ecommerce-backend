const chilCatDB = require("../models/childCategory");
const subCatDB = require("../models/subCategory");
const {fMs} = require("../utils/helper");
import type e = require("express");
const { deleteImage } = require("../utils/saveFiles");


const getAllChildCat = async(req: e.Request, res: e.Response, next: e.NextFunction) => {
    let childCategory = await chilCatDB.find().populate("subCategoryId", "-__v");
    fMs(res, "All child category", childCategory);
}

const getChildCatById = async(req: e.Request, res: e.Response, next: e.NextFunction) => {
    let childCategory = await chilCatDB.findById(req.params.id);
    
    if(!childCategory){
        return next(new Error("Child category not found"));
    }
    
    fMs(res, "Child category details", childCategory);
}

const createChildCat = async(req: e.Request, res: e.Response, next: e.NextFunction) => {
    let check = await chilCatDB.findOne({name : req.body.name});
    let subCategory = await subCatDB.findById(req.body.subCategoryId);

    if(check){
        return next(new Error("Child category already exists"));
    }

    let childCategory = await new chilCatDB(req.body).save();

    await subCatDB.findByIdAndUpdate(subCategory._id, {$push : {childCategories : childCategory._id}});
    
    fMs(res, "Child category created successfully", childCategory);
}

const updateChildCat = async(req: e.Request, res: e.Response, next: e.NextFunction) => {
    
    let childCategory = await chilCatDB.findById(req.params.id);

    if(!childCategory){
        return next(new Error("Child category not found"));
    }

    await chilCatDB.findByIdAndUpdate(childCategory._id, req.body);

    let updated = await chilCatDB.findById(childCategory._id);

    fMs(res, "Child category updated successfully", updated);
}

const deleteChildCat = async(req: e.Request, res: e.Response, next: e.NextFunction) => {
    let childCategory = await chilCatDB.findById(req.params.id);

    if(!childCategory){
        return next(new Error("Child category not found"));
    }

    deleteImage(childCategory.image);

    await subCatDB.findByIdAndUpdate(childCategory.subCategoryId, {$pull : {childCategory : childCategory._id}});

    await chilCatDB.findByIdAndDelete(req.params.id);

    fMs(res, "Child category deleted successfully");
}

module.exports = {
    getAllChildCat,
    getChildCatById,
    createChildCat,
    updateChildCat,
    deleteChildCat
};