const router = require("express").Router();
const {
  getAllChildCat,
  getChildCatById,
  createChildCat,
  updateChildCat,
  deleteChildCat,
} = require("../controllers/childCatController");
const {
  validateBody,
  validateParams,
  validateToken,
  validateRole,
} = require("../utils/validator");
const { childCategorySchema, idSchema } = require("../utils/schema");
const { saveFile, deleteImage } = require("../utils/saveFiles");

router.get("/", getAllChildCat);

router.post(
  "/",
  validateToken,
  validateRole("admin"),
  saveFile,
  validateBody(childCategorySchema.bodySchema),
  createChildCat,
);

router
  .route("/:id")
  .get(validateParams(idSchema, "id"), getChildCatById)
  .patch(
    validateToken,
    validateRole("admin"),
    saveFile,
    validateParams(idSchema, "id"),
    validateBody(childCategorySchema.bodySchema),
    updateChildCat,
  )
  .delete(
    validateToken,
    validateRole("admin"),
    validateParams(idSchema, "id"),
    deleteChildCat,
  );

module.exports = router;