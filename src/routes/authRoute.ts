const router = require("express").Router();
const {
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
} = require("../controllers/authController");
const { validateBody } = require("../utils/validator");
const { authSchema } = require("../utils/schema");

// Public authentication routes
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);

router.post("/forgot-password", validateBody(authSchema.forgotPassword), forgotPassword);
router.post("/reset-password", validateBody(authSchema.resetPassword), resetPassword);

// Support both GET (for email verification links) and POST
router.get("/verify-email", verifyEmail);
router.post("/verify-email", validateBody(authSchema.verifyEmail), verifyEmail);

module.exports = router;
