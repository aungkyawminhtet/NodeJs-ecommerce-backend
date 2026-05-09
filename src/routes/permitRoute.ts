const router = require("express").Router();
const {
  addPermit,
  allPermit,
  getPermitById,
  updatePermit,
  deletePermit,
} = require("../controllers/permitController");
const { permitSchema, idSchema } = require("../utils/schema");
const { validateBody, validateParams } = require("../utils/validator");

router.get("/", allPermit);

router.post("/", validateBody(permitSchema.bodySchema), addPermit);

router
  .route("/:id")
  .get(validateParams(idSchema, "id"), getPermitById)
  .patch(
    validateParams(idSchema, "id"),
    validateBody(permitSchema.bodySchema),
    updatePermit,
  )
  .delete(validateParams(idSchema, "id"), deletePermit);

module.exports = router;
