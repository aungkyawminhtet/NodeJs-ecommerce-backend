const router = require("express").Router();
const {
  createCheckoutSession,
  handleWebhook,
  getPaymentByOrder,
  getPaymentHistory,
} = require("../controllers/paymentController");
const {
  validateBody,
  validateParams,
  validateToken,
} = require("../utils/validator");
const { paymentSchema, idSchema } = require("../utils/schema");

// Public Stripe Webhook (No auth, needs raw body configured in index.ts)
router.post("/webhook", handleWebhook);

// Protected endpoints
router.post(
  "/create-checkout-session",
  [validateToken, validateBody(paymentSchema.checkoutSessionSchema)],
  createCheckoutSession,
);

router.get("/history", [validateToken], getPaymentHistory);

router.get(
  "/order/:id",
  [validateToken, validateParams(idSchema, "id")],
  getPaymentByOrder,
);

module.exports = router;
