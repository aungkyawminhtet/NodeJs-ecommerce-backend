const router = require("express").Router();
const {
  allRole,
  createRole,
  updateRole,
  deleteRole,
  getRoleById,
  roleAddPermit,
  removePermitFromRole,
} = require("../controllers/roleController");
const { roleSchema } = require("../utils/schema");
const { validateBody,validateToken } = require("../utils/validator");

router.get("/", allRole);
router.get("/:id", getRoleById);

router.post("/", validateToken, validateBody(roleSchema.bodySchema), createRole);

router.post("/add/permit", validateBody(roleSchema.addPermitSchema), roleAddPermit);
router.post("/remove/permit", validateBody(roleSchema.addPermitSchema), removePermitFromRole);

router
  .route("/:id")
  .patch(validateBody(roleSchema.bodySchema), updateRole)
  .delete(validateBody(roleSchema.bodySchema), deleteRole);

module.exports = router;
