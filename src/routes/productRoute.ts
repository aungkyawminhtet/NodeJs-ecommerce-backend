const router = require("express").Router();
const {
  getAllProduct,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  paginateProduct,
  customfilterProduct
} = require("../controllers/productController");
const {
  validateBody,
  validateParams,
  validateToken,
  validateRole,
} = require("../utils/validator");
const { productSchema, idSchema } = require("../utils/schema");
const { saveFile, saveMultiFiles } = require("../utils/saveFiles");

router.get("/", getAllProduct);

router.get("/paginate/:page", paginateProduct);

router.get("/filter/:type/:page/:id", customfilterProduct);

router.post("/", [validateToken, validateRole("admin"), saveMultiFiles, validateBody(productSchema.bodySchema)], createProduct);

router
  .route("/:id")
  .get(validateParams(idSchema,"id"), getProductById)
  .patch(
    [
      validateToken,
      validateRole("admin"),
      saveFile,
      validateParams(idSchema,"id"),
      validateBody(productSchema.bodySchema),
    ],
    updateProduct,
  )

  .delete(
    [validateToken, validateRole("admin"), validateParams(idSchema,"id")],
    deleteProduct,
  );

module.exports = router;