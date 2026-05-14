import type e = require("express");
const catDB = require("../models/category");
const {fMs} = require("../utils/helper");
const {deleteImage} = require("../utils/saveFiles");

const addCategory = async(req: e.Request, res: e.Response, next: e.NextFunction) => {
    let check = await catDB.findOne({name : req.body.name});

    if(check){
        return next(new Error("Category already exists"));
    }

    let category = await new catDB(req.body).save();
    
    fMs(res, "Category added successfully", category);
}

const allCategory = async(req: e.Request, res: e.Response, next: e.NextFunction) => {
    let category = await catDB.find().populate({
        path : "subCategory",
        select : "-__v -createdAt -updatedAt",
        populate : {
            path : "childCategories",
            select : "-__v -createdAt -updatedAt"
        }
    });
    
    fMs(res, "All category", category);
}

const getCategoryById = async(req: e.Request, res: e.Response, next: e.NextFunction) => {
    let category = await catDB.findById(req.params.id);
    
    if(!category){
        return next(new Error("Category not found"));
    }
    
    fMs(res, "Category details", category);
}

const updateCategory = async(req: e.Request, res: e.Response, next: e.NextFunction) => {
    
    let category = await catDB.findById(req.params.id);

    if(!category){
        return next(new Error("Category not found"));
    }

    await catDB.findByIdAndUpdate(category._id, req.body);

    let updated = await catDB.findById(category._id);

    fMs(res, "Category updated successfully", updated);
}

const deleteCategory = async(req: e.Request, res: e.Response, next: e.NextFunction) => {
    let category = await catDB.findById(req.params.id);

    if(!category){
        return next(new Error("Category not found"));
    }

    deleteImage(category.image);

    await catDB.findByIdAndDelete(req.params.id);

    fMs(res, "Category deleted successfully");
}

module.exports = {
    addCategory,
    allCategory,
    getCategoryById,
    updateCategory,
    deleteCategory
}