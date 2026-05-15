const router = require("express").Router();
const {
  getAllTag,
  getTagById,
  createTag,
  updateTag,
  deleteTag,
} = require("../controllers/tagController");
const {
  validateBody,
  validateParams,
  validateToken,
  validateRole,
} = require("../utils/validator");
const { tagSchema, idSchema } = require("../utils/schema");
const { saveFile, deleteImage } = require("../utils/saveFiles");

router.get("/", getAllTag);

router.post(
  "/",
  [
    validateToken,
    validateRole("admin"),
    saveFile,
    validateBody(tagSchema.bodySchema),
  ],
  createTag,
);

router
  .route("/:id")
  .get(validateParams(idSchema,"id"), getTagById)
  .patch(
    [
      validateToken,
      validateRole("admin"),
      saveFile,
      validateParams(idSchema,"id"),
      validateBody(tagSchema.bodySchema),
    ],
    updateTag,
  )

  .delete(
    [validateToken, validateRole("admin"), validateParams(idSchema,"id")],
    deleteTag,
  );


module.exports = router;
