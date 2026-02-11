import { ZodError } from "zod";
import { errorResponse } from "../utils/response.js";

const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return errorResponse(
        res,
        400,
        "Validation failed",
        parsed.error?.issues?.[0]?.message,
      );
    }

    req.body = parsed.data;
    return next();
  } catch (err) {
    if (err instanceof ZodError) {
      return errorResponse(
        res,
        400,
        "Validation failed",
        err.issues?.[0]?.message,
      );
    }
    // pass unknown errors to global error handler
    return next(err);
  }
};

export default validate;