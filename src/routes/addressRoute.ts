const router = require("express").Router();
const {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} = require("../controllers/addressController");
const {
  validateBody,
  validateParams,
  validateToken,
} = require("../utils/validator");
const { addressSchema, idSchema } = require("../utils/schema");

router.use(validateToken); // Protect all address routes

router.get("/", getAddresses);

router.post("/", validateBody(addressSchema.bodySchema), addAddress);

router
  .route("/:id")
  .patch(
    [validateParams(idSchema, "id"), validateBody(addressSchema.updateSchema)],
    updateAddress,
  )
  .delete(validateParams(idSchema, "id"), deleteAddress);

router.patch(
  "/:id/default",
  validateParams(idSchema, "id"),
  setDefaultAddress,
);

module.exports = router;
