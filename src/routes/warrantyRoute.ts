const router = require("express").Router();
const {
  getAllWarranty,
  getWarrantyById,
  createWarranty,
  updateWarranty,
  deleteWarranty,
} = require("../controllers/warrantyController");
const {
  validateBody,
  validateParams,
  validateToken,
  validateRole,
} = require("../utils/validator");
const { warrantySchema, idSchema } = require("../utils/schema");
const { saveFile } = require("../utils/saveFiles");

router.get("/", getAllWarranty);

router.post( 
  "/",
  [
    validateToken,
    validateRole("admin"),
    saveFile,
    validateBody(warrantySchema.bodySchema),
  ],
  createWarranty,
);

router
  .route("/:id")
  .get(validateParams(idSchema,"id"), getWarrantyById)
  .patch(
    [
      validateToken,
      validateRole("admin"),
      saveFile,
      validateParams(idSchema,"id"),
      validateBody(warrantySchema.bodySchema),
    ],
    updateWarranty,
  )

  .delete(
    [validateToken, validateRole("admin"), validateParams(idSchema,"id")],
    deleteWarranty,
  );    

module.exports = router;
