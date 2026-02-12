import Category from "../models/category.model.js";
import { errorResponse, successResponse } from "../utils/response.js";
import { uploadBufferToCloudinary, deleteFromCloudinary } from "../config/cloudinary.js";



export const createCategory = async (req, res) => {
  try {
    const { name, type } = req.body;
    

    // 🔎 Check duplicate
    const existingCategory = await Category.findOne({ name: name.trim() });
    if (existingCategory) {
      return errorResponse(
        res,
        400,
        "Category already exists",
        existingCategory
      );
    }

    let iconData = null;

    // 📸 If icon uploaded
    if (req.file) {
      const uploaded = await uploadBufferToCloudinary(
        req.file.buffer,
        "category-icons",
        "image"
      );

      iconData = {
        public_id: uploaded.public_id,
        url: uploaded.url,
      };
    }

    // 💾 Create category
    const category = await Category.create({
      name: name.trim(),
      type,
      icon: iconData, // will be null if not uploaded
    });

    return successResponse(
      res,
      201,
      "New Category created successfully",
      category
    );
  } catch (error) {
    console.log("Error in creating category", error.message);
    return errorResponse(
      res,
      500,
      "Failed to create category",
      error.message
    );
  }
};

export const getAllCategory = async (req, res)=>{
  try {
    const { type } = req.query;
    const filter = {};
    if (type) {
      filter.type = type; // 'item' or 'service'
    }
    const categories = await Category.find(filter).sort({ name: 1 });
    if(!categories){
      return errorResponse(res, 404, "Categories not found");
    }
   return successResponse(res, 200, "All category fetched successfully", categories);
    
  } catch (error) {
    console.log("Error in fetching categories", error.message);
    return errorResponse(res, 500, "Failed to create category", error.message);
    
  }
}

export const getSingleCategory = async (req, res)=>{
  try {
    const category = await Category.findById(req.params.id);
    if(!category){
      return errorResponse(res, 404, "category not found");
    }
   return successResponse(res, 200, "Single category fetched successfully", category);
    
  } catch (error) {
    console.log("Error in fetching single category", error.message);
    return errorResponse(res, 500, "Failed to fetch single category", error.message);
    
  }
}


export const updateCategory = async (req, res) => {
  try {
    const { name, type } = req.body;

    const existingCategory = await Category.findById(req.params.id);
    if (!existingCategory) {
      return errorResponse(res, 404, "Category not exist", null);
    }

    let updateData = { name, type };

    // 📸 If new icon uploaded
    if (req.file) {
      // delete old icon
      if (existingCategory.icon?.public_id) {
        await deleteFromCloudinary(existingCategory.icon.public_id, "image");
      }

      const uploaded = await uploadBufferToCloudinary(
        req.file.buffer,
        "category-icons",
        "image"
      );

      updateData.icon = {
        public_id: uploaded.public_id,
        url: uploaded.url,
      };
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    return successResponse(
      res,
      200,
      "Category updated successfully",
      category
    );
  } catch (error) {
    console.log("Error in updating category", error.message);
    return errorResponse(res, 500, "Failed to update category", error.message);
  }
};

//! Delete category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
      return errorResponse(res, 404, "Category not exist", null);
    }

    // 🔐 Admin validation (optional)
    // if (req.user.role !== "admin") {
    //   return errorResponse(res, 403, "Only admin can delete this category", null);
    // }

    // 🗑 Delete icon from Cloudinary (if exists)
    if (category.icon?.public_id) {
      await deleteFromCloudinary(category.icon.public_id, "image");
    }

    // 🗑 Delete category from DB
    await Category.findByIdAndDelete(id);

    return successResponse(
      res,
      200,
      "Category deleted successfully",
      category
    );
  } catch (error) {
    console.log("Error in deleting category", error.message);
    return errorResponse(
      res,
      500,
      "Failed to delete category",
      error.message
    );
  }
};

