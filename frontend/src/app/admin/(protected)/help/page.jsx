"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  createHelpCategory,
  createHelpFaq,
  deleteHelpCategory,
  deleteHelpFaq,
  getFaqsByCategorySlug,
  getHelpCategories,
  updateHelpCategory,
  updateHelpFaq,
} from "@/services/help.service";

const toSlug = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

export default function AdminHelpPage() {
  const categoryFormRef = useRef(null);
  const faqFormRef = useRef(null);
  const categoryNameInputRef = useRef(null);
  const faqQuestionInputRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [faqsLoading, setFaqsLoading] = useState(false);
  const [error, setError] = useState("");

  const [categoryName, setCategoryName] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [categoryIcon, setCategoryIcon] = useState("CircleHelp");
  const [categoryOrder, setCategoryOrder] = useState(0);
  const [submittingCategory, setSubmittingCategory] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState("");

  const [selectedCategorySlug, setSelectedCategorySlug] = useState("");
  const [categoryFaqs, setCategoryFaqs] = useState([]);
  const [faqQuestion, setFaqQuestion] = useState("");
  const [faqAnswer, setFaqAnswer] = useState("");
  const [faqOrder, setFaqOrder] = useState(0);
  const [faqTags, setFaqTags] = useState("");
  const [submittingFaq, setSubmittingFaq] = useState(false);
  const [editingFaqId, setEditingFaqId] = useState("");
  const [deletingId, setDeletingId] = useState("");

  const selectedCategory = useMemo(
    () => categories.find((item) => item.slug === selectedCategorySlug) || null,
    [categories, selectedCategorySlug],
  );

  useEffect(() => {
    setCategorySlug(toSlug(categoryName));
  }, [categoryName]);

  const fetchCategories = async (preferSelectedSlug) => {
    setCategoriesLoading(true);
    setError("");
    try {
      const res = await getHelpCategories({ admin: true });
      const list = Array.isArray(res?.data?.data) ? res.data.data : [];
      setCategories(list);

      const nextSelectedSlug =
        preferSelectedSlug ||
        (list.some((item) => item.slug === selectedCategorySlug)
          ? selectedCategorySlug
          : list[0]?.slug || "");
      setSelectedCategorySlug(nextSelectedSlug);
    } catch (fetchError) {
      setCategories([]);
      setSelectedCategorySlug("");
      setError(fetchError?.response?.data?.message || "Failed to fetch categories");
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchFaqsForCategory = async (slug) => {
    if (!slug) {
      setCategoryFaqs([]);
      return;
    }
    setFaqsLoading(true);
    setError("");
    try {
      const res = await getFaqsByCategorySlug(slug, { admin: true });
      const list = Array.isArray(res?.data?.data?.faqs) ? res.data.data.faqs : [];
      setCategoryFaqs(list);
    } catch (fetchError) {
      setCategoryFaqs([]);
      setError(fetchError?.response?.data?.message || "Failed to fetch FAQs");
    } finally {
      setFaqsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchFaqsForCategory(selectedCategorySlug);
  }, [selectedCategorySlug]);

  const handleCreateCategory = async (event) => {
    event.preventDefault();
    setSubmittingCategory(true);
    setError("");

    try {
      const payload = {
        name: categoryName.trim(),
        slug: categorySlug.trim(),
        description: categoryDescription.trim(),
        icon: categoryIcon.trim() || "CircleHelp",
        order: Number(categoryOrder || 0),
        isActive: true,
      };

      if (editingCategoryId) {
        await updateHelpCategory(editingCategoryId, payload);
      } else {
        await createHelpCategory(payload);
      }

      toast.success(
        editingCategoryId
          ? "Help category updated successfully."
          : "Help category created successfully.",
      );
      setCategoryName("");
      setCategorySlug("");
      setCategoryDescription("");
      setCategoryIcon("CircleHelp");
      setCategoryOrder(0);
      setEditingCategoryId("");
      await fetchCategories(categorySlug.trim());
    } catch (submitError) {
      const message = submitError?.response?.data?.message || "Failed to create category";
      setError(message);
      toast.error(message);
    } finally {
      setSubmittingCategory(false);
    }
  };

  const handleCreateFaq = async (event) => {
    event.preventDefault();
    if (!selectedCategory?._id) {
      toast.error("Please select a category first.");
      return;
    }

    setSubmittingFaq(true);
    setError("");
    try {
      const payload = {
        category: selectedCategory._id,
        question: faqQuestion.trim(),
        answer: faqAnswer.trim(),
        order: Number(faqOrder || 0),
        tags: faqTags
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        isActive: true,
      };

      if (editingFaqId) {
        await updateHelpFaq(editingFaqId, payload);
      } else {
        await createHelpFaq(payload);
      }

      toast.success(editingFaqId ? "FAQ updated successfully." : "FAQ created successfully.");
      setFaqQuestion("");
      setFaqAnswer("");
      setFaqOrder(0);
      setFaqTags("");
      setEditingFaqId("");
      await fetchFaqsForCategory(selectedCategorySlug);
    } catch (submitError) {
      const message = submitError?.response?.data?.message || "Failed to create FAQ";
      setError(message);
      toast.error(message);
    } finally {
      setSubmittingFaq(false);
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategoryId(category?._id || "");
    setCategoryName(category?.name || "");
    setCategorySlug(category?.slug || "");
    setCategoryDescription(category?.description || "");
    setCategoryIcon(category?.icon || "CircleHelp");
    setCategoryOrder(Number(category?.order || 0));
    categoryFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => {
      categoryNameInputRef.current?.focus();
    }, 250);
  };

  const resetCategoryForm = () => {
    setEditingCategoryId("");
    setCategoryName("");
    setCategorySlug("");
    setCategoryDescription("");
    setCategoryIcon("CircleHelp");
    setCategoryOrder(0);
  };

  const handleEditFaq = (faq) => {
    setEditingFaqId(faq?._id || "");
    setFaqQuestion(faq?.question || "");
    setFaqAnswer(faq?.answer || "");
    setFaqOrder(Number(faq?.order || 0));
    setFaqTags(Array.isArray(faq?.tags) ? faq.tags.join(", ") : "");
    faqFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => {
      faqQuestionInputRef.current?.focus();
    }, 250);
  };

  const resetFaqForm = () => {
    setEditingFaqId("");
    setFaqQuestion("");
    setFaqAnswer("");
    setFaqOrder(0);
    setFaqTags("");
  };

  const handleToggleCategoryActive = async (category) => {
    const categoryId = category?._id;
    if (!categoryId) return;

    const nextActive = !Boolean(category?.isActive);
    setDeletingId(categoryId);
    setError("");
    try {
      if (nextActive) {
        await updateHelpCategory(categoryId, { isActive: true });
      } else {
        await deleteHelpCategory(categoryId);
      }
      toast.success(
        nextActive
          ? "Category activated successfully."
          : "Category deactivated successfully.",
      );
      await fetchCategories(selectedCategorySlug);
    } catch (actionError) {
      const message =
        actionError?.response?.data?.message || "Failed to update category status";
      setError(message);
      toast.error(message);
    } finally {
      setDeletingId("");
    }
  };

  const handleToggleFaqActive = async (faq) => {
    const faqId = faq?._id;
    if (!faqId) return;

    const nextActive = !Boolean(faq?.isActive);
    setDeletingId(faqId);
    setError("");
    try {
      if (nextActive) {
        await updateHelpFaq(faqId, { isActive: true });
      } else {
        await deleteHelpFaq(faqId);
      }
      toast.success(
        nextActive ? "FAQ activated successfully." : "FAQ deactivated successfully.",
      );
      await fetchFaqsForCategory(selectedCategorySlug);
    } catch (actionError) {
      const message =
        actionError?.response?.data?.message || "Failed to update FAQ status";
      setError(message);
      toast.error(message);
    } finally {
      setDeletingId("");
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Help Center Management</h1>
        <p className="mt-1 text-sm text-slate-500">
          Add and manage Help categories and FAQs for the public Help Center.
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <article ref={categoryFormRef} className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">
            {editingCategoryId ? "Edit Help Category" : "Add Help Category"}
          </h2>
          <form onSubmit={handleCreateCategory} className="mt-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Name</label>
              <input
                ref={categoryNameInputRef}
                value={categoryName}
                onChange={(event) => setCategoryName(event.target.value)}
                required
                placeholder="Account & Profile Management"
                className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Slug</label>
              <input
                value={categorySlug}
                onChange={(event) => setCategorySlug(toSlug(event.target.value))}
                required
                placeholder="account-profile-management"
                className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Description</label>
              <textarea
                value={categoryDescription}
                onChange={(event) => setCategoryDescription(event.target.value)}
                placeholder="Describe this category..."
                className="min-h-20 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Icon name</label>
                <input
                  value={categoryIcon}
                  onChange={(event) => setCategoryIcon(event.target.value)}
                  placeholder="CircleHelp"
                  className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Order</label>
                <input
                  type="number"
                  min="0"
                  value={categoryOrder}
                  onChange={(event) => setCategoryOrder(event.target.value)}
                  className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={submittingCategory}
                className="cursor-pointer rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
              >
                {submittingCategory
                  ? editingCategoryId
                    ? "Updating..."
                    : "Creating..."
                  : editingCategoryId
                    ? "Update Category"
                    : "Create Category"}
              </button>
              {editingCategoryId ? (
                <button
                  type="button"
                  onClick={resetCategoryForm}
                  className="cursor-pointer rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel Edit
                </button>
              ) : null}
            </div>
          </form>
        </article>

        <article ref={faqFormRef} className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">
            {editingFaqId ? "Edit FAQ" : "Add FAQ"}
          </h2>
          <form onSubmit={handleCreateFaq} className="mt-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Category</label>
              <select
                value={selectedCategorySlug}
                onChange={(event) => setSelectedCategorySlug(event.target.value)}
                className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Question</label>
              <input
                ref={faqQuestionInputRef}
                value={faqQuestion}
                onChange={(event) => setFaqQuestion(event.target.value)}
                required
                placeholder="How do I update my profile?"
                className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Answer</label>
              <textarea
                value={faqAnswer}
                onChange={(event) => setFaqAnswer(event.target.value)}
                required
                placeholder="Go to your profile settings..."
                className="min-h-28 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Order</label>
                <input
                  type="number"
                  min="0"
                  value={faqOrder}
                  onChange={(event) => setFaqOrder(event.target.value)}
                  className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Tags (comma-separated)</label>
                <input
                  value={faqTags}
                  onChange={(event) => setFaqTags(event.target.value)}
                  placeholder="profile, account, settings"
                  className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={submittingFaq}
                className="cursor-pointer rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {submittingFaq
                  ? editingFaqId
                    ? "Updating..."
                    : "Creating..."
                  : editingFaqId
                    ? "Update FAQ"
                    : "Create FAQ"}
              </button>
              {editingFaqId ? (
                <button
                  type="button"
                  onClick={resetFaqForm}
                  className="cursor-pointer rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel Edit
                </button>
              ) : null}
            </div>
          </form>
        </article>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <article className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">Categories</h2>
          {categoriesLoading ? (
            <p className="mt-3 text-sm text-slate-500">Loading categories...</p>
          ) : categories.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">No categories found.</p>
          ) : (
            <div className="mt-4 space-y-2">
              {categories.map((category) => (
                <div
                  key={category._id}
                  className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{category.name}</p>
                    <p className="text-xs text-slate-500">/{category.slug}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditCategory(category)}
                      className="cursor-pointer rounded-md border border-indigo-200 px-2 py-1 text-xs font-medium text-indigo-700 transition hover:bg-indigo-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleCategoryActive(category)}
                      disabled={deletingId === category._id}
                      className={`cursor-pointer rounded-md px-2 py-1 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                        category?.isActive
                          ? "border border-red-200 text-red-600 hover:bg-red-50"
                          : "border border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                      }`}
                    >
                      {deletingId === category._id
                        ? "..."
                        : category?.isActive
                          ? "Deactivate"
                          : "Activate"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">
            FAQs {selectedCategory ? `- ${selectedCategory.name}` : ""}
          </h2>
          {faqsLoading ? (
            <p className="mt-3 text-sm text-slate-500">Loading FAQs...</p>
          ) : categoryFaqs.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">No FAQs found for selected category.</p>
          ) : (
            <div className="mt-4 space-y-2">
              {categoryFaqs.map((faq) => (
                <div
                  key={faq._id}
                  className="rounded-lg border border-slate-200 px-3 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-800">{faq.question}</p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditFaq(faq)}
                        className="cursor-pointer rounded-md border border-indigo-200 px-2 py-1 text-xs font-medium text-indigo-700 transition hover:bg-indigo-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleFaqActive(faq)}
                        disabled={deletingId === faq._id}
                        className={`cursor-pointer rounded-md px-2 py-1 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                          faq?.isActive
                            ? "border border-red-200 text-red-600 hover:bg-red-50"
                            : "border border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        }`}
                      >
                        {deletingId === faq._id
                          ? "..."
                          : faq?.isActive
                            ? "Deactivate"
                            : "Activate"}
                      </button>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-slate-600 line-clamp-3">{faq.answer}</p>
                </div>
              ))}
            </div>
          )}
        </article>
      </div>
    </section>
  );
}
