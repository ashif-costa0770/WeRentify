import { ZodError } from "zod";
import { errorResponse } from "../utils/response.js";

const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.safeParse(req.body);
    next();
  } catch (err) {
    if (err instanceof ZodError) {
        return errorResponse(res, 400, "Validation failed", err.issues[0]?.message);
    }
    // pass unknown errors to global error handler
    next(err);
  }
};

export default validate;