const router = require("express").Router();
const {
  getAllSubCat,
  getSubCatById,
  createSubCat,
  updateSubCat,
  deleteSubCat,
} = require("../controllers/subCatController");
const {
  validateBody,
  validateParams,
  validateToken,
  validateRole,
} = require("../utils/validator");
const { subCategorySchema, idSchema } = require("../utils/schema");
const { saveFile, deleteImage } = require("../utils/saveFiles");

router.get("/", getAllSubCat);

router.post(
  "/",
  validateToken,
  validateRole("admin"),
  saveFile,
  validateBody(subCategorySchema.bodySchema),
  createSubCat,
);

router
  .route("/:id")
  .get(validateParams(idSchema, "id"), getSubCatById)
  .patch(
    validateToken,
    validateRole("admin"),
    saveFile,
    validateParams(idSchema, "id"),
    validateBody(subCategorySchema.bodySchema),
    updateSubCat,
  )
  .delete(
    validateToken,
    validateRole("admin"),
    validateParams(idSchema, "id"),
    deleteSubCat,
  );

module.exports = router;
