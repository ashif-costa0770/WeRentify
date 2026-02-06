// Stripe configuration - Will be implemented later
// import Stripe from 'stripe';
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * This file is prepared for future Stripe integration
 * Currently skipped as per requirements
 */

const stripeConfig = {
  // Placeholder for future implementation
  secretKey: process.env.STRIPE_SECRET_KEY,
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
};

// Future functions to implement:
// - createConnectedAccount()
// - createPaymentIntent()
// - handleWebhooks()
// - processRefund()

export default stripeConfig;