const deliveryDB = require("../models/delivery");
const {fMs} = require("../utils/helper");
const {deleteImage} = require("../utils/saveFiles");
import type e = require("express");

const getAllDelivery = async(req: e.Request, res: e.Response, next: e.NextFunction) => {
    let delivery = await deliveryDB.find();
    fMs(res, "All delivery options", delivery);
}

const getDeliveryById = async(req: e.Request, res: e.Response, next: e.NextFunction) => {
    let delivery = await deliveryDB.findById(req.params.id);
    
    if(!delivery){
        return next(new Error("Delivery option not found"));
    }
    
    fMs(res, "Delivery option details", delivery);
}

const createDelivery = async(req: e.Request, res: e.Response, next: e.NextFunction) => {
    let check = await deliveryDB.findOne({name : req.body.name});

    if(check){
        return next(new Error("Delivery option already exists"));
    }

    req.body.remarks = req.body.remarks.split(",");

    let delivery = await new deliveryDB(req.body).save();
    
    fMs(res, "Delivery option created successfully", delivery);
}

const updateDelivery = async(req: e.Request, res: e.Response, next: e.NextFunction) => {
    
    let delivery = await deliveryDB.findById(req.params.id);

    if(!delivery){
        return next(new Error("Delivery option not found"));
    }

    await deliveryDB.findByIdAndUpdate(delivery._id, req.body);

    let updated = await deliveryDB.findById(delivery._id);

    fMs(res, "Delivery option updated successfully", updated);
}

const deleteDelivery = async(req: e.Request, res: e.Response, next: e.NextFunction) => {
    let delivery = await deliveryDB.findById(req.params.id);

    if(!delivery){
        return next(new Error("Delivery option not found"));
    }
    deleteImage(delivery.image);
    await deliveryDB.findByIdAndDelete(req.params.id);

    fMs(res, "Delivery option deleted successfully", null);
}

module.exports = {
    getAllDelivery,
    getDeliveryById,
    createDelivery,
    updateDelivery,
    deleteDelivery
}