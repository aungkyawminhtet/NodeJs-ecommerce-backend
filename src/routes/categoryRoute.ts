const router = require("express").Router();
const category = require("../controllers/categoryController");
const {
  validateBody,
  validateParams,
  validateToken,
  validateRole,
  validatePermit,
} = require("../utils/validator");
const { categorySchema, idSchema } = require("../utils/schema");
const { saveFile, saveMultiFiles, deleteImage } = require("../utils/saveFiles");

router.get("/", category.allCategory);

router.post(
  "/",
  [
    validateToken,
    validateRole("admin"),
    saveFile,
    validateBody(categorySchema.bodySchema),
  ],
  category.addCategory,
);

router
  .route("/:id")
  .get([validateParams(idSchema, "id")], category.getCategoryById)
  .put(
    [
      validateToken,
      validateRole("admin"),
      saveFile,
      validateParams(idSchema, "id"),
      validateBody(categorySchema.bodySchema),
    ],
    category.updateCategory,
  )
  .delete(
    [validateToken, validateRole("admin"),
    validateParams(idSchema, "id")],
    category.deleteCategory,
  );

module.exports = router;
