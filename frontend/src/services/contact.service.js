import api from "@/lib/api";

/* SEND MESSAGE */
export const sendMessage = (data) => api.post("/contact", data);

/* GET MESSAGES */
export const getMessages = () => api.get("/contact");

/* ADMIN REPLY */
export const adminReply = (messageId, data) => api.post(`/contact/${messageId}/reply`, data);