import mongoose from "mongoose";
import HelpCategory from "../../models/help/helpCategory.model.js";
import FaqItem from "../../models/help/faqItem.model.js";
import { errorResponse, successResponse } from "../../utils/response.js";

const mapCategoryFilter = (isAdminView) => (isAdminView ? {} : { isActive: true });
const mapFaqFilter = (isAdminView) => (isAdminView ? {} : { isActive: true });

export const getHelpCategories = async (req, res) => {
  try {
    const isAdminView = String(req.query.admin || "").toLowerCase() === "true";
    const filter = mapCategoryFilter(isAdminView);

    const categories = await HelpCategory.find(filter)
      .sort({ order: 1, name: 1 })
      .lean();

    return successResponse(
      res,
      200,
      "Help categories fetched successfully",
      categories,
    );
  } catch (error) {
    return errorResponse(res, 500, "Failed to fetch help categories", error.message);
  }
};

export const getFaqsByCategorySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const isAdminView = String(req.query.admin || "").toLowerCase() === "true";

    const categoryFilter = { slug, ...mapCategoryFilter(isAdminView) };
    const category = await HelpCategory.findOne(categoryFilter).lean();

    if (!category) {
      return errorResponse(res, 404, "Help category not found");
    }

    const faqs = await FaqItem.find({
      category: category._id,
      ...mapFaqFilter(isAdminView),
    })
      .sort({ order: 1, createdAt: 1 })
      .lean();

    return successResponse(res, 200, "FAQs fetched successfully", {
      category,
      faqs,
    });
  } catch (error) {
    return errorResponse(res, 500, "Failed to fetch FAQs", error.message);
  }
};

export const searchFaqs = async (req, res) => {
  try {
    const query = String(req.query.q || "").trim();
    if (!query) {
      return successResponse(res, 200, "FAQ search results fetched successfully", []);
    }

    const categoryIds = await HelpCategory.find({ isActive: true })
      .select("_id")
      .lean();
    const categoryIdList = categoryIds.map((item) => item._id);

    const faqs = await FaqItem.find({
      isActive: true,
      category: { $in: categoryIdList },
      $or: [
        { question: { $regex: query, $options: "i" } },
        { answer: { $regex: query, $options: "i" } },
        { tags: { $elemMatch: { $regex: query, $options: "i" } } },
      ],
    })
      .populate("category", "name slug icon")
      .sort({ order: 1, createdAt: -1 })
      .limit(30)
      .lean();

    return successResponse(res, 200, "FAQ search results fetched successfully", faqs);
  } catch (error) {
    return errorResponse(res, 500, "Failed to search FAQs", error.message);
  }
};

export const createHelpCategory = async (req, res) => {
  try {
    const payload = req.body;
    const existing = await HelpCategory.findOne({ slug: payload.slug }).lean();
    if (existing) {
      return errorResponse(res, 400, "Category with this slug already exists");
    }

    const category = await HelpCategory.create(payload);
    return successResponse(res, 201, "Help category created successfully", category);
  } catch (error) {
    return errorResponse(res, 500, "Failed to create help category", error.message);
  }
};

export const updateHelpCategory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 400, "Invalid category id");
    }

    if (req.body.slug) {
      const duplicate = await HelpCategory.findOne({
        slug: req.body.slug,
        _id: { $ne: id },
      }).lean();
      if (duplicate) {
        return errorResponse(res, 400, "Category with this slug already exists");
      }
    }

    const category = await HelpCategory.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      return errorResponse(res, 404, "Help category not found");
    }

    return successResponse(res, 200, "Help category updated successfully", category);
  } catch (error) {
    return errorResponse(res, 500, "Failed to update help category", error.message);
  }
};

export const deleteHelpCategory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 400, "Invalid category id");
    }

    const category = await HelpCategory.findById(id);
    if (!category) {
      return errorResponse(res, 404, "Help category not found");
    }

    category.isActive = false;
    await category.save();

    await FaqItem.updateMany({ category: id }, { $set: { isActive: false } });

    return successResponse(res, 200, "Help category deactivated successfully", category);
  } catch (error) {
    return errorResponse(res, 500, "Failed to delete help category", error.message);
  }
};

export const createFaqItem = async (req, res) => {
  try {
    const payload = req.body;
    const category = await HelpCategory.findById(payload.category).lean();
    if (!category) {
      return errorResponse(res, 404, "Help category not found");
    }

    const faq = await FaqItem.create(payload);
    return successResponse(res, 201, "FAQ created successfully", faq);
  } catch (error) {
    return errorResponse(res, 500, "Failed to create FAQ", error.message);
  }
};

export const updateFaqItem = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 400, "Invalid FAQ id");
    }

    if (req.body.category) {
      const category = await HelpCategory.findById(req.body.category).lean();
      if (!category) {
        return errorResponse(res, 404, "Help category not found");
      }
    }

    const faq = await FaqItem.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!faq) {
      return errorResponse(res, 404, "FAQ not found");
    }

    return successResponse(res, 200, "FAQ updated successfully", faq);
  } catch (error) {
    return errorResponse(res, 500, "Failed to update FAQ", error.message);
  }
};

export const deleteFaqItem = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 400, "Invalid FAQ id");
    }

    const faq = await FaqItem.findById(id);
    if (!faq) {
      return errorResponse(res, 404, "FAQ not found");
    }

    faq.isActive = false;
    await faq.save();

    return successResponse(res, 200, "FAQ deactivated successfully", faq);
  } catch (error) {
    return errorResponse(res, 500, "Failed to delete FAQ", error.message);
  }
};
