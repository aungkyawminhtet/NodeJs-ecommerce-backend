const AddressDB = require("../models/address");
const { fMs } = require("../utils/helper");
import type e = require("express");

const getAddresses = async (req: any, res: e.Response, next: e.NextFunction) => {
  try {
    const userId = req.user._id;
    const addresses = await AddressDB.find({ userId }).sort({ isDefault: -1, createdAt: -1 });
    fMs(res, "User addresses retrieved successfully", addresses);
  } catch (err) {
    next(err);
  }
};

const addAddress = async (req: any, res: e.Response, next: e.NextFunction) => {
  try {
    const userId = req.user._id;
    const { isDefault } = req.body;

    const hasAddresses = await AddressDB.exists({ userId });

    let finalIsDefault = isDefault || !hasAddresses;

    if (finalIsDefault) {
      await AddressDB.updateMany({ userId }, { isDefault: false });
    }

    const address = new AddressDB({
      ...req.body,
      userId,
      isDefault: finalIsDefault,
    });

    await address.save();

    fMs(res, "Address added successfully", address);
    
  } catch (err) {
    next(err);
  }
};

const updateAddress = async (req: any, res: e.Response, next: e.NextFunction) => {
  try {
    const userId = req.user._id;
    const addressId = req.params.id;
    const { isDefault } = req.body;

    const address = await AddressDB.findOne({ _id: addressId, userId });
    if (!address) {
      return next(new Error("Address not found or unauthorized"));
    }

    if (isDefault === true) {
      await AddressDB.updateMany({ userId }, { isDefault: false });
    }

    const updated = await AddressDB.findByIdAndUpdate(
      addressId,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );

    fMs(res, "Address updated successfully", updated);
  } catch (err) {
    next(err);
  }
};

const deleteAddress = async (req: any, res: e.Response, next: e.NextFunction) => {
  try {
    const userId = req.user._id;
    const addressId = req.params.id;

    const address = await AddressDB.findOne({ _id: addressId, userId });
    if (!address) {
      return next(new Error("Address not found or unauthorized"));
    }

    await AddressDB.findByIdAndDelete(addressId);

    if (address.isDefault) {
      const remaining = await AddressDB.findOne({ userId }).sort({ createdAt: -1 });
      if (remaining) {
        remaining.isDefault = true;
        await remaining.save();
      }
    }

    fMs(res, "Address deleted successfully", null);
  } catch (err) {
    next(err);
  }
};

const setDefaultAddress = async (req: any, res: e.Response, next: e.NextFunction) => {
  try {
    const userId = req.user._id;
    const addressId = req.params.id;

    const address = await AddressDB.findOne({ _id: addressId, userId });
    if (!address) {
      return next(new Error("Address not found or unauthorized"));
    }

    await AddressDB.updateMany({ userId }, { isDefault: false });

    address.isDefault = true;
    address.updatedAt = new Date();
    await address.save();

    fMs(res, "Address marked as default successfully", address);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
