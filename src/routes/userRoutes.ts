const router = require('express').Router();
const {userSchema} = require("../utils/schema");
const {validateBody} = require("../utils/validator");
const {register, allUser} = require("../controllers/userControllers");

router.get("/", allUser);
router.post("/register", validateBody(userSchema.bodySchema), register);

module.exports = router;