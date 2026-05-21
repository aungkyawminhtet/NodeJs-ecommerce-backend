const orderDB = require("../models/order");
const PaymentDB = require("../models/payment");
const { fMs } = require("../utils/helper");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY || "sk_test_dummy");
import type e = require("express");

const createCheckoutSession = async (req: any, res: e.Response, next: e.NextFunction) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return next(new Error("orderId is required"));
    }

    // Find order and populate its items
    const order = await orderDB.findById(orderId).populate("items");
    if (!order) {
      return next(new Error("Order not found"));
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return next(new Error("Unauthorized: This order does not belong to you"));
    }

    if (order.paymentStatus === "COMPLETED") {
      return next(new Error("Order has already been paid"));
    }

    // Map order items to Stripe line items
    const lineItems = order.items.map((item: any) => {
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
          },
          unit_amount: Math.round(item.price * 100), // Stripe expects amount in cents
        },
        quantity: item.count,
      };
    });

    // Create Stripe Checkout Session
    const successUrl = process.env.STRIPE_SUCCESS_URL || `http://localhost:${process.env.PORT || 3000}/api/v1/payments/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = process.env.STRIPE_CANCEL_URL || `http://localhost:${process.env.PORT || 3000}/api/v1/payments/cancel`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: order._id.toString(),
      customer_email: req.user.email,
      metadata: {
        userId: req.user._id.toString(),
        orderId: order._id.toString(),
      },
    });

    // Create or update Payment record
    let payment = await PaymentDB.findOne({ orderId: order._id });
    if (payment) {
      payment.stripeSessionId = session.id;
      payment.amount = order.totalPrice;
      payment.status = "PENDING";
      payment.updatedAt = new Date();
    } else {
      payment = new PaymentDB({
        orderId: order._id,
        userId: req.user._id,
        stripeSessionId: session.id,
        amount: order.totalPrice,
        currency: "usd",
        status: "PENDING",
      });
    }
    await payment.save();

    fMs(res, "Checkout session created successfully", {
      sessionId: session.id,
      sessionUrl: session.url,
    });
  } catch (err) {
    next(err);
  }
};

const handleWebhook = async (req: e.Request, res: e.Response, next: e.NextFunction) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // Stripe webhooks require raw body! We must configure express raw middleware in index.ts for this
    event = stripe.webhooks.constructEvent((req as any).rawBody || req.body, sig, endpointSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const orderId = session.client_reference_id || session.metadata.orderId;
      const paymentIntentId = session.payment_intent;

      console.log(`Payment successful for order: ${orderId}`);

      // Update payment record
      const payment = await PaymentDB.findOne({ stripeSessionId: session.id });
      if (payment) {
        payment.status = "COMPLETED";
        payment.stripePaymentIntentId = paymentIntentId;
        payment.paymentMethod = session.payment_method_types?.[0] || "card";
        payment.updatedAt = new Date();
        await payment.save();
      }

      // Update order status
      const order = await orderDB.findById(orderId);
      if (order) {
        order.paymentStatus = "COMPLETED";
        order.paymentIntentId = paymentIntentId;
        order.status = "CONFIRMED";
        order.updatedAt = new Date();
        await order.save();
      }
    } else if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object;
      const orderId = paymentIntent.metadata?.orderId;

      console.log(`Payment failed for order: ${orderId}`);

      const payment = await PaymentDB.findOne({ stripePaymentIntentId: paymentIntent.id });
      if (payment) {
        payment.status = "FAILED";
        payment.updatedAt = new Date();
        await payment.save();
      }

      if (orderId) {
        const order = await orderDB.findById(orderId);
        if (order) {
          order.paymentStatus = "FAILED";
          order.updatedAt = new Date();
          await order.save();
        }
      }
    }

    res.json({ received: true });
  } catch (err) {
    next(err);
  }
};

const getPaymentByOrder = async (req: any, res: e.Response, next: e.NextFunction) => {
  try {
    const { orderId } = req.params;
    const payment = await PaymentDB.findOne({ orderId }).populate("orderId");
    if (!payment) {
      return next(new Error("Payment record not found"));
    }
    if (payment.userId.toString() !== req.user._id.toString()) {
      return next(new Error("Unauthorized access to payment details"));
    }
    fMs(res, "Payment details retrieved", payment);
  } catch (err) {
    next(err);
  }
};

const getPaymentHistory = async (req: any, res: e.Response, next: e.NextFunction) => {
  try {
    const payments = await PaymentDB.find({ userId: req.user._id })
      .populate("orderId")
      .sort({ createdAt: -1 });
    fMs(res, "Payment history retrieved", payments);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createCheckoutSession,
  handleWebhook,
  getPaymentByOrder,
  getPaymentHistory,
};
