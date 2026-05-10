const router = require('express').Router();
const {userSchema, loginSchema} = require("../utils/schema");
const {validateBody} = require("../utils/validator");
const {register, allUser, login} = require("../controllers/userControllers");

router.get("/", allUser);

router.post("/register", validateBody(userSchema.bodySchema), register);

router.post("/login", validateBody(loginSchema.bodySchema), login);

module.exports = router;