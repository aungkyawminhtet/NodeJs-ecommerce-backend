const CartDB = require("../models/cart");
const productDB = require("../models/product");
const orderDB = require("../models/order");
const orderItemDB = require("../models/orderItem");
const { fMs, setCache } = require("../utils/helper");
import type e = require("express");


const recalcCart = (cart: any) => {
  let totalItems = 0;
  let totalPrice = 0;
  cart.items.forEach((it: any) => {
    totalItems += it.quantity;
    totalPrice += it.quantity * it.price;
  });
  cart.totalItems = totalItems;
  cart.totalPrice = totalPrice;
  cart.updatedAt = new Date();
  return cart;
};

const addToCart = async (req: any, res: e.Response, next: e.NextFunction) => {
  try {
    const userId = req.user._id;

    if (!req.body.items || !Array.isArray(req.body.items) || req.body.items.length === 0) {
      return next(new Error("Cart items are required"));
    }

    let cart = await CartDB.findOne({ userId: userId });

    if (!cart) {
      cart = new CartDB({ userId: userId, items: [], status: "ACTIVE" });
    }

    if (cart.status === "ORDERED") {
      cart.items = [];
      cart.totalItems = 0;
      cart.totalPrice = 0;
      cart.status = "ACTIVE";
      cart.updatedAt = new Date();
    }

    for (let item of req.body.items) {
      let product = await productDB.findById(item.productId);
      if (product) {
        let existing = cart.items.find(
          (i: any) => i.productId.toString() === item.productId.toString(),
        );
        if (existing) {
          existing.quantity = existing.quantity + Number(item.quantity || 1);
          existing.selected = true;
        } else {
          cart.items.push({
            productId: item.productId,
            quantity: Number(item.quantity || 1),
            price: product.price,
            selected: true,
          });
        }
      } else {
        console.log("Product not found for cart item", item.productId);
      }
    }

    recalcCart(cart);

    await cart.save();
    await setCache(`cart:${userId.toString()}`, cart);

    fMs(res, "Cart updated", cart);
  } catch (err) {
    next(err);
  }
};

const getCart = async (req: any, res: e.Response, next: e.NextFunction) => {
  try {
    const userId = req.user._id;
    let cart = await CartDB.findOne({ userId: userId }).populate(
      "items.productId",
      "name price",
    );
    if (!cart)
      return fMs(res, "Cart empty", {
        items: [],
        totalItems: 0,
        totalPrice: 0,
      });
    fMs(res, "User cart", cart);
  } catch (err) {
    next(err);
  }
};

const checkoutSelectedItems = async (
  req: any,
  res: e.Response,
  next: e.NextFunction,
) => {
  try {
    const userId = req.user._id;

    let cart = await CartDB.findOne({ userId: userId });
    if (!cart || !cart.items.length) {
      return next(new Error("Cart not found"));
    }

    const selectedItems = cart.items.filter((item: any) => item.selected);

    if (!selectedItems.length) {
      return next(new Error("No selected items to checkout"));
    }

    const saveOrder = new orderDB();
    const orderedList: any[] = [];
    let totalPrice = 0;

    for (let item of selectedItems) {
      const product = await productDB.findById(item.productId);
      if (!product) {
        return next(new Error(`Product not found for item ${item.productId}`));
      }

      orderedList.push({
        orderId: saveOrder._id,
        productId: product._id,
        name: product.name,
        price: product.price,
        count: item.quantity,
      });

      totalPrice += product.price * item.quantity;
    }

    const orderItems = await orderItemDB.insertMany(orderedList);
    const orderIds = orderItems.map((item: any) => item._id);

    saveOrder.user = userId;
    saveOrder.items = orderIds;
    saveOrder.count = selectedItems.length;
    saveOrder.totalPrice = totalPrice;
    saveOrder.orderNumber = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    if (req.body.shippingAddress) {
      saveOrder.shippingAddress = req.body.shippingAddress;
    }
    if (req.body.paymentMethod) {
      saveOrder.paymentMethod = req.body.paymentMethod;
    }
    if (req.body.notes) {
      saveOrder.notes = req.body.notes;
    }
    saveOrder.status = "PENDING";

    const order = await saveOrder.save();

    cart.items = cart.items.filter((item: any) => !item.selected);
    recalcCart(cart);

    cart.status = "ACTIVE";

    await cart.save();
    await setCache(`cart:${userId.toString()}`, cart);

    fMs(res, "Selected items checked out", { order, cart });
  } catch (err) {
    next(err);
  }
};

const updateCartItem = async (
  req: any,
  res: e.Response,
  next: e.NextFunction,
) => {
  try {
    const userId = req.user._id;
    const itemId = req.params.id;
    const { quantity, selected } = req.body;

    let cart = await CartDB.findOne({ userId: userId });
    if (!cart) return next(new Error("Cart not found"));

    if (cart.status === "ORDERED") {
      return next(new Error("Completed cart cannot be updated"));
    }

    const item = cart.items.id(itemId);
    if (!item) return next(new Error("Cart item not found"));

    if (typeof selected === "boolean") {
      item.selected = selected;
    }

    if (quantity !== undefined) {
      item.quantity = Number(quantity) <= 0 ? 1 : Number(quantity);
    }

    recalcCart(cart);

    await cart.save();
    await setCache(`cart:${userId.toString()}`, cart);

    fMs(res, "Cart item updated", cart);
  } catch (err) {
    next(err);
  }
};

const removeCartItem = async (
  req: any,
  res: e.Response,
  next: e.NextFunction,
) => {
  try {
    const userId = req.user._id;
    const itemId = req.params.id;

    let cart = await CartDB.findOne({ userId: userId });
    if (!cart) return next(new Error("Cart not found"));

    if (cart.status === "ORDERED") {
      return next(new Error("Completed cart cannot be modified"));
    }

    const item = cart.items.filter((i: any) => i._id.toString() === itemId.toString())[0];

    // console.log("remove item ", item);
    
    if (!item) return next(new Error("Cart item not found"));

    cart.items.pull(itemId);
    recalcCart(cart);
    await cart.save();
    await setCache(`cart:${userId.toString()}`, cart);

    fMs(res, "Cart item removed", cart);
  } catch (err) {
    next(err);
  }
};

const clearCart = async (req: any, res: e.Response, next: e.NextFunction) => {
  try {
    const userId = req.user._id;
    await CartDB.findOneAndDelete({ userId: userId });
    await setCache(`cart:${userId.toString()}`, null);
    fMs(res, "Cart cleared", null);
  } catch (err) {
    next(err);
  }
};

const getCartTotal = async (
  req: any,
  res: e.Response,
  next: e.NextFunction,
) => {
  try {
    const userId = req.user._id;
    let cart = await CartDB.findOne({ userId: userId });
    if (!cart) return fMs(res, "Cart total", { totalItems: 0, totalPrice: 0 });
    recalcCart(cart);
    fMs(res, "Cart total", {
      totalItems: cart.totalItems,
      totalPrice: cart.totalPrice,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  getCartTotal,
  checkoutSelectedItems,
};
