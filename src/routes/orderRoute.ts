const router = require("express").Router();
const {
  getAllOrder,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
} = require("../controllers/orederController");
const {
  validateBody,
  validateParams,
  validateToken,
  validateRole,
} = require("../utils/validator");
const { orderSchema, idSchema } = require("../utils/schema");

router.get("/", getAllOrder);

router.post("/", [validateToken, validateRole("admin"), validateBody(orderSchema.bodySchema)], createOrder);

router
  .route("/:id")
  .get(validateParams(idSchema,"id"), getOrderById)
  .patch(
    [validateToken, validateRole("admin"), validateParams(idSchema,"id"), validateBody(orderSchema.bodySchema)],
    updateOrder,
  )
  .delete(
    [validateToken, validateRole("admin"), validateParams(idSchema,"id")],
    deleteOrder,
  );

module.exports = router;
