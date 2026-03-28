import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ['unread', 'read', 'replied'],
      default: 'unread',
    },

    adminReply: {
      type: String,
      default: null,
    },

    repliedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

contactSchema.index({ createdAt: -1 }); 
const ContactMessage = mongoose.model('ContactMessage', contactSchema);
export default ContactMessage;
