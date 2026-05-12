const router = require("express").Router();
const { userSchema, loginSchema } = require("../utils/schema");
const {
  validateBody,
  validateToken,
  validateRole,
} = require("../utils/validator");
const {
  register,
  allUser,
  login,
  addRole,
  addPermit,
} = require("../controllers/userControllers");

router.get("/", allUser);

router.post("/register", validateBody(userSchema.bodySchema), register);

router.post("/add/role", [
  validateToken,
  validateRole("owner"),
  validateBody(userSchema.addRoleSchema),
  addRole,
]);

router.post(
  "/add/permit",
  validateToken,
  validateRole("admin"),
  validateBody(userSchema.addPermitSchema),
  addPermit,
);

router.post("/login", validateBody(loginSchema.bodySchema), login);

module.exports = router;
