import { errorResponse } from "../utils/response.js";
export const parseToJson = (req, res, next) => {
    try {
        if (req.body.contact && typeof req.body.contact === "string") {
            req.body.contact = JSON.parse(req.body.contact);
        }
        if (req.body.social && typeof req.body.social === "string") {
            req.body.social = JSON.parse(req.body.social);
        }
        next();
    } catch (error) {
        return errorResponse(res, 400, "Invalid JSON format in contact or social", error.message);
    }
};