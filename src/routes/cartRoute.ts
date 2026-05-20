const router = require("express").Router();
const {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  getCartTotal,
  checkoutSelectedItems,
} = require("../controllers/cartController");

const {
  validateBody,
  validateToken,
  validateParams,
} = require("../utils/validator");
const { cartSchema, idSchema } = require("../utils/schema");

router.post(
  "/add",
  [validateToken, validateBody(cartSchema.addSchema)],
  addToCart,
);

router.get("/", [validateToken], getCart);

router.patch(
  "/item/:id",
  [
    validateToken,
    validateParams(idSchema, "id"),
    validateBody(cartSchema.updateItemSchema),
  ],
  updateCartItem,
);

router.delete(
  "/item/:id",
  [validateToken, validateParams(idSchema, "id")],
  removeCartItem,
);

router.delete("/", [validateToken], clearCart);

router.get("/total", [validateToken], getCartTotal);

router.post("/checkout", [validateToken], checkoutSelectedItems);

module.exports = router;
