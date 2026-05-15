const router = require("express").Router();
const deliveryController = require("../controllers/deliveryController");
const {
  validateBody,
  validateParams,
  validateToken,
  validateRole,
} = require("../utils/validator");
const { deliverySchema, idSchema } = require("../utils/schema");
const { saveFile, deleteImage } = require("../utils/saveFiles");

router.get("/", deliveryController.getAllDelivery);

router.post(
  "/",
  [
    validateToken,
    validateRole("admin"),
    saveFile,
    validateBody(deliverySchema.bodySchema),
  ],
  deliveryController.createDelivery,
);

router
  .route("/:id")
  .get(validateParams(idSchema, "id"), deliveryController.getDeliveryById)
  .patch(
    [
      validateToken,
      validateRole("admin"),
      saveFile,
      validateParams(idSchema, "id"),
      validateBody(deliverySchema.bodySchema),
    ],
    deliveryController.updateDelivery,
  )

  .delete(
    [validateToken, validateRole("admin"), validateParams(idSchema, "id")],
    deliveryController.deleteDelivery,
  );

module.exports = router;
