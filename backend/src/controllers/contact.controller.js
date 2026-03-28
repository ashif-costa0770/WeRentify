import ContactMessage from "../models/contactMessage.model.js";
import { sendContactEmail } from "../utils/mailer.js";
import { errorResponse, successResponse } from "../utils/response.js";

export const sendMessage = async (req, res) => {
  try {
    const { fullName, email, message } = req.body;

    // create a new message
    const newMessage = await ContactMessage.create({
      fullName,
      email,
      message,
    });

    // send email to the admin
    await sendContactEmail({
      to: process.env.EMAIL_USER,
      subject: `New Contact Message - ${fullName}`,
      html: `
        <h3>New Contact Message</h3>
        <p><b>Name:</b> ${fullName}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Message:</b></p>
        <p>${message}</p>
        <p><b>Message ID:</b> ${newMessage._id}</p>
      `,
    });

    // send email to the user
    await sendContactEmail({
      to: email,
      subject: "We received your message",
      html: `
        <p>Hi ${fullName},</p>
        <p>Thank you for contacting Werentify. Our team will get back to you soon.</p>
        <br/>
        <p>Regards,<br/>Werentify Team</p>
      `,
    });

    return successResponse(res, 200, "Message sent successfully", newMessage);
  } catch (error) {
    return errorResponse(res, 500, "Send message failed", error.message);
  }
};

export const getMessages = async (req, res) => {
    try {
        const messages = await ContactMessage.find().sort({ createdAt: -1 }).lean();
        if(messages.length === 0){
            return successResponse(res, 200, "No messages found", []);
        }
        return successResponse(res, 200, "Messages fetched successfully", {
            messages,
            totalMessages: messages.length,
        });
    } catch (error) {
        return errorResponse(res, 500, "Fetch messages failed", error.message);
    }
}

export const adminReply = async (req, res) => {
    try {
        const {messageId} = req.params;
        const {reply} = req.body;

        //find the message
        const message = await ContactMessage.findById(messageId);
        if(!message){
            return errorResponse(res, 404, "Message not found");
        }

        /* Check if message is already replied */
        if(message.adminReply){
            return errorResponse(res, 400, "Message already replied");
        }

        // Send reply email to the user
        await sendContactEmail({
            to: message.email,
            subject: 'Reply from Werentify Support',
            html: `
            <p>Hi ${message.fullName},</p>
            <p>${reply}</p>
            <br/>
            <p>Regards,<br/>Werentify Team</p>
          `,
        })

        // update db
        message.adminReply = reply;
        message.repliedAt = new Date();
        message.status = 'replied';

        await message.save();

        return successResponse(res, 200, "Admin reply sent successfully");
        
    } catch (error) {
        return errorResponse(res, 500, "Admin reply failed", error.message)
        
    }
}