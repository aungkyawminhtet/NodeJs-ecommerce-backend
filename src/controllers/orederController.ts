const orderDB = require("../models/order");
const orderItemDB = require("../models/orderItem");
const productDB = require("../models/product");
const {fMs} = require("../utils/helper");
import type e = require("express");

const getAllOrder = async(req: e.Request, res: e.Response, next: e.NextFunction) => {
    let order = await orderDB.find();
    fMs(res, "All orders", order);
}

const getOrderById = async(req: e.Request, res: e.Response, next: e.NextFunction) => {
    let order = await orderDB.findById(req.params.id).populate("user", "-__v -createdAt -updatedAt");
    
    if(!order){
        return next(new Error("Order not found"));
    }
    
    fMs(res, "Order details", order);
}

const createOrder = async(req: any, res: e.Response, next: e.NextFunction) => {

    let user = await req.user;

    let totalPrice = 0;
    const orderedList = [];

    const saveOrder = new orderDB();

    for (let item of req.body.items) {
        let product = await productDB.findById(item.productId);

        let obj = {
            orderId : saveOrder._id,
            productId: product._id,
            name : product.name,
            price : product.price,
        }
        orderedList.push(obj);
        totalPrice += product.price * item.count;
    }

    console.log("Total price calculated", totalPrice);

    let orderItems = await orderItemDB.insertMany(orderedList);

    let orderIds = orderItems.map((item: any) => item._id);

    saveOrder.user = user._id;
    saveOrder.items = orderIds;
    saveOrder.count = req.body.items.length;
    saveOrder.totalPrice = totalPrice;
    saveOrder.status = req.body.status;

    let result = await saveOrder.save();
    
    fMs(res, "Order created successfully", result);
}

const updateOrder = async(req: e.Request, res: e.Response, next: e.NextFunction) => {    
    let order = await orderDB.findById(req.params.id);

    if(!order){
        return next(new Error("Order not found"));
    }

    await orderDB.findByIdAndUpdate(order._id, req.body);

    let result = await orderDB.findById(order._id);
    
    fMs(res, "Order updated successfully", result);
}

const deleteOrder = async(req: e.Request, res: e.Response, next: e.NextFunction) => {
    let order = await orderDB.findById(req.params.id);

    if(!order){
        return next(new Error("Order not found"));
    }

    await orderDB.findByIdAndDelete(req.params.id);
    
    fMs(res, "Order deleted successfully", null);
}

module.exports = {
  getAllOrder,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
}