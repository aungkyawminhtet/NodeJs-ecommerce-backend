const router = require("express").Router();
const { userSchema, loginSchema } = require("../utils/schema");
const { validateBody } = require("../utils/validator");
const {
  register,
  allUser,
  login,
  addRole,
  addPermit
} = require("../controllers/userControllers");

router.get("/", allUser);

router.post("/register", validateBody(userSchema.bodySchema), register);
router.post("/add/role", validateBody(userSchema.addRoleSchema), addRole);
router.post("/add/permit", validateBody(userSchema.addPermitSchema), addPermit);

router.post("/login", validateBody(loginSchema.bodySchema), login);

module.exports = router;
