import stripe from "../config/stripe.js";
import User from "../models/users/user.model.js";

export const createPaymentIntent = async (req, res) => {
  try {
    const { amount } = req.body;

    // Basic validation
    if (!amount || amount <= 0) {
      return res.status(400).json({
        error: "Invalid amount",
      });
    }

    // Amount must be smallest currency unit (paise)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "inr",
      automatic_payment_methods: { enabled: true },
      metadata: {
        userId: req.user._id.toString(), // Add user ID
      },
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Stripe Error:", error);

    res.status(500).json({
      error: "Failed to create payment intent",
    });
  }
};

const PRICE_MAP = {
  plus: "price_1T4fPMIb1jNGF1IDlsiT81Kr",
  pro: "price_1T4fVqIb1jNGF1IDcVO80pmw",
};

export const createCheckoutSession = async (req, res) => {
  try {
    const { planId } = req.body;

    if (!PRICE_MAP[planId]) {
      return res.status(400).json({ error: "Invalid plan" });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",

      payment_method_types: ["card"],

      line_items: [
        {
          price: PRICE_MAP[planId],
          quantity: 1,
        },
      ],

      success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,

      metadata: {
        userId: req.user._id.toString(),
        planId,
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Stripe Checkout Error:", error);
    res.status(500).json({ error: "Failed to create session" });
  }
};

//! User it in production
//! Stripe Webhook
// export const stripeWebhook = async (req, res) => {
//   const sig = req.headers["stripe-signature"];

//   let event;

//   try {
//     event = stripe.webhooks.constructEvent(
//       req.body,
//       sig,
//       process.env.STRIPE_WEBHOOK_SECRET,
//     );
//   } catch (err) {
//     console.log("Webhook signature verification failed.");
//     return res.status(400).send(`Webhook Error: ${err.message}`);
//   }

//   // ✅ Most important event for you
//   if (event.type === "checkout.session.completed") {
//     const session = event.data.object;

//     const userId = session.metadata.userId;
//     const planId = session.metadata.planId;

//     console.log("✅ Payment Successful:", userId, planId);

//     await User.findByIdAndUpdate(userId, {
//       plan: planId,
//     });
//   }

//   res.json({ received: true });
// };

//! session Verify API
export const verifySession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return res.status(400).json({
        error: "Payment not completed",
      });
    }

    const { userId, planId } = session.metadata;

    await User.findByIdAndUpdate(userId, {
      plan: planId,
    });

    res.json({ success: true, plan: planId });
  } catch (error) {
    console.error("Stripe Verification Error:", error);

    res.status(500).json({
      error: "Session verification failed",
    });
  }
};
