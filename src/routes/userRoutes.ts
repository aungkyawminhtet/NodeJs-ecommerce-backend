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
  removeRole,
  removePermit,
} = require("../controllers/userControllers");

router.get("/", allUser);

router.post("/register", validateBody(userSchema.bodySchema), register);

router.post("/add/role", [
  validateToken,
  validateRole("owner"),
  validateBody(userSchema.addRoleSchema),
  addRole,
]);

router.post("/remove/role", [
  validateToken,
  validateRole("owner"),
  validateBody(userSchema.addRoleSchema),
  removeRole,
]);

router.post(
  "/add/permit",
  validateToken,
  validateRole("owner"),
  validateBody(userSchema.addPermitSchema),
  addPermit,
);

router.post("/remove/permit", [
  validateToken,
  validateRole("owner"),
  validateBody(userSchema.addPermitSchema),
  removePermit,
]);

router.post("/login", validateBody(loginSchema.bodySchema), login);

module.exports = router;
