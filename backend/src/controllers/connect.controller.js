import stripe from "../config/stripe.js";
import User from "../models/users/user.model.js";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

/**
 * Create or get Stripe Connect Express account for the current user,
 * then create an Account Link for onboarding. Redirect user to the returned url.
 */
export const createAccountLink = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const userEmail = req.user.email;

    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    let accountId = user.stripeConnectAccountId;

    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        email: userEmail,
        capabilities: {
          card_payments: { requested: true },
        },
      });
      accountId = account.id;
      user.stripeConnectAccountId = accountId;
      await user.save();
    }

    const returnUrl = `${FRONTEND_URL}/connect/return`;
    const refreshUrl = `${FRONTEND_URL}/connect/return?refresh=1`;

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: "account_onboarding",
    });

    res.json({ url: accountLink.url });
  } catch (error) {
    console.error("Stripe Connect Error:", error);
    const message =
      error?.message ||
      error?.raw?.message ||
      "Failed to create Stripe Connect link";
    res.status(500).json({
      error: message,
    });
  }
};

/**
 * Optional: get connection status (e.g. charges_enabled) for the current user's Connect account.
 */
export const getConnectStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user?.stripeConnectAccountId) {
      return res.json({ connected: false, accountId: null });
    }

    const account = await stripe.accounts.retrieve(user.stripeConnectAccountId);
    const connected =
      account.details_submitted && (account.charges_enabled ?? false);

    res.json({
      connected,
      accountId: user.stripeConnectAccountId,
      chargesEnabled: account.charges_enabled ?? false,
    });
  } catch (error) {
    console.error("Connect status error:", error);
    res.status(500).json({ error: "Failed to get Connect status" });
  }
};
