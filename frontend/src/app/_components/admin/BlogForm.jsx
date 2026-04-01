"use client";

import { useState } from "react";

export default function BlogForm({ initialData = {}, onSubmit }) {
  const [form, setForm] = useState({
    title: initialData.title || "",
    content: initialData.content || "",
    status: initialData.status || "draft",
  });

  return (
    <form onSubmit={(e) => onSubmit(e, form)}>
      {/* fields */}
    </form>
  );
}