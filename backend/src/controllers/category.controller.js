import Category from "../models/category.model.js";
import { errorResponse, successResponse } from "../utils/response.js";

export const createCategory = async (req, res) => {
  try {
    const { name, type } = req.body;
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return errorResponse( res, 400, "Category already exist",  existingCategory);
    }
    const category = await Category.create({ name, type });
    return successResponse(res, 200, "New Category created", category);
  } catch (error) {
    console.log("Error in creating category", error.message);
    return errorResponse(res, 500, "Failed to create category", error.message);
  }
};
