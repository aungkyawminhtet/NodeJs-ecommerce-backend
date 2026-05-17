const productDB = require("../models/product");
const { fMs } = require("../utils/helper");
import type e = require("express");
const { deleteImage } = require("../utils/saveFiles");

const getAllProduct = async (
  req: e.Request,
  res: e.Response,
  next: e.NextFunction,
) => {
  let product = await productDB
    .find()
    .populate("subCategory", "-__v -createdAt -updatedAt")
    .populate("tag", "-__v -createdAt -updatedAt")
    .populate("warranty", "-__v -createdAt -updatedAt");
  fMs(res, "All products", product);
};

const getProductById = async (
  req: e.Request,
  res: e.Response,
  next: e.NextFunction,
) => {
  let product = await productDB.findById(req.params.id);

  if (!product) {
    return next(new Error("Product not found"));
  }

  fMs(res, "Product details", product);
};

const paginateProduct = async(
    req: e.Request,
    res: e.Response,    
    next: e.NextFunction,
) => {
    let page = Number(req.params.page);
    let limit = Number(process.env.PAGE_SIZE);
    
    if(!page || page < 1 || isNaN(page)) {
        page = 1;
    }
    
    if(limit < 1 || isNaN(limit)) {
        limit = 10;
    }
    
    let skip = (page - 1) * limit;

    // console.log("Pagination params", { page, limit, skip });
    
    let product = await productDB.find().skip(skip).limit(limit);
    fMs(res, `All products with pagination ${page}`, product);
}

const customfilterProduct = async(
    req: e.Request,
    res: e.Response,    
    next: e.NextFunction,
) => {
    let checkType = req.params.type;
    let Id = req.params.id;

    let page = Number(req.params.page) || 1;
    let limit = Number(process.env.PAGE_SIZE);

    if (!page || page < 1 || isNaN(page)) {
        page = 1;
    }

    if(limit < 1 || isNaN(limit)) {
        limit = 10;
    }

    let skip = (page - 1) * limit;

    let filter = await productDB.find({ [`${checkType}`]: Id }).skip(skip).limit(limit);

    if(!filter) {
        return next(new Error(`Product with ${checkType} ${Id} not found`));
    }

    fMs(res, `Product with ${checkType} ${Id}`, filter);

}

const createProduct = async (
  req: e.Request,
  res: e.Response,
  next: e.NextFunction,
) => {
  let check = await productDB.findOne({ name: req.body.name });

  if (check) {
    return next(new Error("Product already exists"));
  }

  req.body.images = req.body.images.split(",");
  req.body.colors = req.body.colors.split(",");
  req.body.features = req.body.features.split(",");
  req.body.warranty = req.body.warranty.split(",");
  req.body.delivery = req.body.delivery.split(",");

  let product = await new productDB(req.body).save();

  fMs(res, "Product created successfully", product);
};

const updateProduct = async (
  req: e.Request,
  res: e.Response,
  next: e.NextFunction,
) => {
  let check = await productDB.findById(req.params.id);
  if (!check) {
    return next(new Error("Product not found"));
  } else {
    await productDB.findByIdAndUpdate(req.params.id, req.body);
    let updatedProduct = await productDB.findById(req.params.id);
    fMs(res, "Product updated successfully", updatedProduct);
  }
};

const deleteProduct = async (
  req: e.Request,
  res: e.Response,
  next: e.NextFunction,
) => {
  let check = await productDB.findById(req.params.id);
  if (!check) {
    return next(new Error("Product not found"));
  } else {
    deleteImage(check.image);
    await productDB.findByIdAndDelete(req.params.id);
    fMs(res, "Product deleted successfully", null);
  }
};

module.exports = {
  getAllProduct,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  paginateProduct,
  customfilterProduct
};
