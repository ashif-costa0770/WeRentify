import cron from "node-cron";
import Booking from "../models/booking.model.js";
import { sendBookingReminderEmail } from "../utils/mailer.js";
import { formatDate, formatDateTime } from "../utils/formatDateTime.js";

function getServiceStartDateTime(bookingDate, timeSlot) {
  if (!bookingDate || !timeSlot) return null;

  const [hours, minutes] = timeSlot.split(":").map(Number);

  const start = new Date(bookingDate);
  start.setHours(hours, minutes, 0, 0);

  return start;
}

cron.schedule("0 9 * * *", async () => {
  console.log("Running booking reminder job every day at 9:00 AM")
  
  const now = new Date();
  const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  // Fetch possible bookings (don't filter service bookings by bookingDate)
  const bookings = await Booking.find({
    reminderSent: { $ne: true },
    status: { $in: ["pending", "confirmed"] },
  })
    .populate("customer", "email firstname lastname")
    .populate("provider", "email firstname lastname")
    .populate("resource")
    .lean();

  let remindersSent = 0;

  for (const booking of bookings) {
    const customer = booking.customer;
    const provider = booking.provider;
    const resource = booking.resource || {};

    if (!customer?.email || !provider?.email) continue;

    let bookingStart = null;

    // SERVICE BOOKING
    if (booking.bookingDate && booking.timeSlot) {
      bookingStart = getServiceStartDateTime(
        booking.bookingDate,
        booking.timeSlot,
      );
    }

    // LISTING BOOKING
    if (booking.startDate) {
      bookingStart = new Date(booking.startDate);
    }

    if (!bookingStart) continue;

    // check if booking within next 24 hours
    if (bookingStart < now || bookingStart > next24Hours) continue;

    // later, after bookingStart is computed:
    const formattedDate =
      booking.bookingDate && booking.timeSlot
        ? formatDateTime(bookingStart) // service: date + time
        : formatDate(bookingStart);

    const resourceName =
      resource.itemName || resource.businessName || "your booking";

    try {
        await sendBookingReminderEmail({
            to: customer.email,
            subject: "Reminder: Your upcoming booking for " + resourceName,
            html: `
              <div style="font-family: 'Segoe UI', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                <h2 style="color: #333; margin-top: 0;">Booking Reminder</h2>
                <p style="font-size: 16px; color: #555; line-height: 1.5;">
                  Hi ${customer.firstname || "there"},
                </p>
                <p style="font-size: 16px; color: #555; line-height: 1.5;">
                  This is a friendly reminder for your upcoming appointment:
                </p>
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #007bff;">
                  <p style="margin: 0; font-weight: bold; color: #333;">${resourceName}</p>
                  <p style="margin: 5px 0 0; color: #666;">${formattedDate}</p>
                </div>
                <p style="font-size: 14px; color: #888;">
                  We look forward to seeing you!
                </p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="font-size: 12px; color: #aaa; text-align: center;">
                  If you need to make changes, please visit our website or contact support.
                </p>
              </div>
            `,
          });

          await sendBookingReminderEmail({
            to: provider.email,
            subject: `Upcoming: ${resourceName} on ${formattedDate}`,
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 500px; margin: 20px auto; padding: 24px; border: 1px solid #f0f0f0; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); color: #1a1a1a;">
                <h3 style="margin-top: 0; color: #111; font-size: 18px; font-weight: 600;">New Booking Reminder</h3>
                
                <p style="font-size: 15px; color: #444; margin-bottom: 20px;">
                  Hello ${provider.firstname || "Partner"}, you have a scheduled booking coming up soon.
                </p>
          
                <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
                  <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; margin-bottom: 4px;">${booking.bookingType === "listing" ? "Listing" : "Service"}</div>
                  <div style="font-size: 16px; font-weight: 600; color: #111; margin-bottom: 12px;">${resourceName}</div>
                  
                  <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; margin-bottom: 4px;">Scheduled Date</div>
                  <div style="font-size: 16px; font-weight: 600; color: #111;">${formattedDate}</div>
                </div>
          
                <p style="font-size: 13px; color: #9ca3af; margin: 0; text-align: center;">
                  Please log in to your dashboard to view full details or manage this booking.
                </p>
              </div>
            `,
          });

      await Booking.updateOne(
        { _id: booking._id },
        { $set: { reminderSent: true } },
      );

      remindersSent++;
    } catch (err) {
      console.error("Booking reminder email failed:", booking._id, err);
    }
  }

  console.log(`Reminders sent: ${remindersSent}`);
});
