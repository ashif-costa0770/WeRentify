// import "dotenv/config";
// import mongoose from "mongoose";
// import connectDB from "../config/db.js";
// import HelpCategory from "../models/help/helpCategory.model.js";
// import FaqItem from "../models/help/faqItem.model.js";

// const categorySeeds = [
//   {
//     name: "Account & Profile Management",
//     slug: "account-profile-management",
//     description: "Manage account setup, profile edits, and security basics.",
//     icon: "UserCircle2",
//     order: 1,
//     isActive: true,
//   },
//   {
//     name: "Location & Search",
//     slug: "location-search",
//     description: "Understand search, location filters, and discovery behavior.",
//     icon: "LocateFixed",
//     order: 2,
//     isActive: true,
//   },
//   {
//     name: "Payments & Pricing",
//     slug: "payments-pricing",
//     description: "Learn billing flow, pricing details, and payout timing.",
//     icon: "CreditCard",
//     order: 3,
//     isActive: true,
//   },
//   {
//     name: "Reviews & Ratings",
//     slug: "reviews-ratings",
//     description: "Review rules, visibility, and rating best practices.",
//     icon: "Star",
//     order: 4,
//     isActive: true,
//   },
//   {
//     name: "Technical Issues",
//     slug: "technical-issues",
//     description: "Troubleshoot sign-in, loading, upload, and performance issues.",
//     icon: "ShieldAlert",
//     order: 5,
//     isActive: true,
//   },
//   {
//     name: "Policies & Legal",
//     slug: "policies-legal",
//     description: "Read terms, policy standards, and legal guidance.",
//     icon: "FileText",
//     order: 6,
//     isActive: true,
//   },
//   {
//     name: "Support & Contact",
//     slug: "support-contact",
//     description: "Find contact channels and expected support response times.",
//     icon: "LifeBuoy",
//     order: 7,
//     isActive: true,
//   },
//   {
//     name: "Stripe Payment",
//     slug: "stripe-payment",
//     description: "Stripe setup, payment methods, and payment troubleshooting.",
//     icon: "MessageSquareText",
//     order: 8,
//     isActive: true,
//   },
// ];

// const faqSeedsByCategorySlug = {
//   "account-profile-management": [
//     {
//       question: "How do I update my profile details?",
//       answer:
//         "Go to your profile settings and edit your name, contact details, and avatar. Save changes to apply updates immediately.",
//       order: 1,
//       tags: ["profile", "account", "settings"],
//     },
//     {
//       question: "I forgot my password. What should I do?",
//       answer:
//         "Use the Forgot Password option on the sign-in page. You will receive a reset link by email if your account exists.",
//       order: 2,
//       tags: ["password", "security", "login"],
//     },
//   ],
//   "location-search": [
//     {
//       question: "Why are search results not showing nearby items?",
//       answer:
//         "Check location permissions and ensure your location input is accurate. Broader distance filters can also increase result count.",
//       order: 1,
//       tags: ["location", "search", "distance"],
//     },
//     {
//       question: "How do I filter listings by category?",
//       answer:
//         "Use the category chips and filter drawer on the listings page. You can combine category with price and distance filters.",
//       order: 2,
//       tags: ["filters", "category", "search"],
//     },
//   ],
//   "payments-pricing": [
//     {
//       question: "When am I charged for a booking?",
//       answer:
//         "You are charged when the booking is confirmed according to the listing or service pricing terms shown at checkout.",
//       order: 1,
//       tags: ["payments", "booking", "charges"],
//     },
//     {
//       question: "Can I see a full price breakdown before payment?",
//       answer:
//         "Yes. Before final confirmation, checkout shows subtotal, platform fees, taxes (if applicable), and total amount.",
//       order: 2,
//       tags: ["pricing", "checkout", "fees"],
//     },
//   ],
//   "reviews-ratings": [
//     {
//       question: "Who can leave a review?",
//       answer:
//         "Only users with completed bookings for that item or service can submit a review, helping keep ratings authentic.",
//       order: 1,
//       tags: ["reviews", "eligibility", "ratings"],
//     },
//     {
//       question: "Can I edit or delete my review?",
//       answer:
//         "Yes, you can edit or delete your own review from the review section where your feedback is displayed.",
//       order: 2,
//       tags: ["reviews", "edit", "delete"],
//     },
//   ],
//   "technical-issues": [
//     {
//       question: "The app is loading slowly. How can I fix it?",
//       answer:
//         "Try refreshing the page, clearing browser cache, or switching networks. If issue persists, contact support with screenshots.",
//       order: 1,
//       tags: ["performance", "loading", "troubleshooting"],
//     },
//     {
//       question: "Image upload fails during listing creation.",
//       answer:
//         "Ensure file type and size are supported, then retry. Network interruptions can also cause upload failures.",
//       order: 2,
//       tags: ["upload", "listing", "errors"],
//     },
//   ],
//   "policies-legal": [
//     {
//       question: "Where can I read platform terms and policies?",
//       answer:
//         "Terms, privacy policy, and community guidelines are available in the footer and settings/legal sections.",
//       order: 1,
//       tags: ["policy", "terms", "legal"],
//     },
//     {
//       question: "How is my data handled?",
//       answer:
//         "Data use and retention follow the privacy policy. Personal data is processed only for platform operations and compliance.",
//       order: 2,
//       tags: ["privacy", "data", "legal"],
//     },
//   ],
//   "support-contact": [
//     {
//       question: "How do I contact support?",
//       answer:
//         "Use the Help Center contact option and submit your issue with details. Response times vary by request priority.",
//       order: 1,
//       tags: ["support", "contact", "help"],
//     },
//     {
//       question: "What details should I include in a support request?",
//       answer:
//         "Include booking ID (if any), error message, time of issue, and screenshots to help faster resolution.",
//       order: 2,
//       tags: ["support", "issue", "debug"],
//     },
//   ],
//   "stripe-payment": [
//     {
//       question: "Which payment methods are processed via Stripe?",
//       answer:
//         "Supported card and wallet methods depend on your region and Stripe availability configured for the platform.",
//       order: 1,
//       tags: ["stripe", "payment-methods", "cards"],
//     },
//     {
//       question: "Why did my Stripe payment fail?",
//       answer:
//         "Payment may fail due to bank decline, incorrect details, expired card, or authentication failure. Retry or use another method.",
//       order: 2,
//       tags: ["stripe", "failed-payment", "troubleshooting"],
//     },
//   ],
// };

// async function seedHelpFaqs() {
//   try {
//     await connectDB();

//     for (const category of categorySeeds) {
//       await HelpCategory.findOneAndUpdate(
//         { slug: category.slug },
//         { $set: category },
//         { upsert: true, new: true, runValidators: true },
//       );
//     }

//     const categories = await HelpCategory.find({}).select("_id slug").lean();
//     const categoryIdBySlug = new Map(categories.map((item) => [item.slug, item._id]));

//     for (const [slug, faqs] of Object.entries(faqSeedsByCategorySlug)) {
//       const categoryId = categoryIdBySlug.get(slug);
//       if (!categoryId) continue;

//       for (const faq of faqs) {
//         await FaqItem.findOneAndUpdate(
//           { category: categoryId, question: faq.question },
//           { $set: { ...faq, category: categoryId, isActive: true } },
//           { upsert: true, new: true, runValidators: true },
//         );
//       }
//     }

//     console.log("Help categories and FAQs seeded successfully.");
//   } catch (error) {
//     console.error("Failed to seed help FAQs:", error);
//     process.exitCode = 1;
//   } finally {
//     await mongoose.connection.close();
//   }
// }

// seedHelpFaqs();
