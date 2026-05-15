const tagDB = require("../models/tag");
const {fMs} = require("../utils/helper");
const {deleteImage} = require("../utils/saveFiles");
import type e = require("express");

const getAllTag = async(req: e.Request, res: e.Response, next: e.NextFunction) => {
    let tag = await tagDB.find();
    fMs(res, "All tags", tag);
}

const getTagById = async(req: e.Request, res: e.Response, next: e.NextFunction) => {
    let tag = await tagDB.findById(req.params.id);
    
    if(!tag){
        return next(new Error("Tag not found"));
    }
    
    fMs(res, "Tag details", tag);
}

const createTag = async(req: e.Request, res: e.Response, next: e.NextFunction) => {
    let check = await tagDB.findOne({name : req.body.name});

    if(check){
        return next(new Error("Tag already exists"));
    }

    let tag = await new tagDB(req.body).save();
    
    fMs(res, "Tag created successfully", tag);
}

const updateTag = async(req: e.Request, res: e.Response, next: e.NextFunction) => {

    console.log("updateTag", req.params.id, req.body);
    
    let tag = await tagDB.findById(req.params.id);

    if(!tag){
        return next(new Error("Tag not found"));
    }

    await tagDB.findByIdAndUpdate(tag._id, req.body);

    let updated = await tagDB.findById(tag._id);

    fMs(res, "Tag updated successfully", updated);
}

const deleteTag = async(req: e.Request, res: e.Response, next: e.NextFunction) => {
    let tag = await tagDB.findById(req.params.id);

    if(!tag){
        return next(new Error("Tag not found"));
    }

    deleteImage(tag.image);

    await tagDB.findByIdAndDelete(req.params.id);

    fMs(res, "Tag deleted successfully");
}

module.exports = {
    getAllTag,
    getTagById,
    createTag,
    updateTag,
    deleteTag
};