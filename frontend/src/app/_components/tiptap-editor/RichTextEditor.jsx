"use client";

import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import InlineHeading from "./inlineHeadingMark";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
} from "lucide-react";

export default function RichTextEditor({ value, onChange, placeholder }) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      InlineHeading,
      Placeholder.configure({
          placeholder:
            placeholder || "Describe your item, its condition, and any special features...",
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm focus:outline-none min-h-[150px] max-h-[300px] overflow-y-auto px-4 py-3 [&_.inline-h1]:text-3xl [&_.inline-h1]:font-black [&_.inline-h1]:leading-tight [&_.inline-h1]:text-gray-900 [&_.inline-h2]:text-2xl [&_.inline-h2]:font-extrabold [&_.inline-h2]:leading-snug [&_.inline-h2]:text-gray-900 [&_.inline-h3]:text-xl [&_.inline-h3]:font-bold [&_.inline-h3]:text-gray-900",
      },
    },
  });

  // Sync value from parent into editor (e.g. when quick response is selected)
  useEffect(() => {
    if (!editor) return;
    const next = value ?? "";
    const current = editor.getHTML();
    if (next !== current) {
      editor.commands.setContent(next, false);
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white mt-2">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 bg-gray-50">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive("bold")
              ? "bg-gray-300 text-[#5B4FE9]"
              : "text-gray-700"
          }`}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive("italic")
              ? "bg-gray-300 text-[#5B4FE9]"
              : "text-gray-700"
          }`}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1 self-center" />

        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleInlineHeading({ level: 1 }).run()
          }
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive("inlineHeading", { level: 1 })
              ? "bg-gray-300 text-[#5B4FE9]"
              : "text-gray-700"
          }`}
          title="H1 style (inline)"
        >
          <Heading1 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleInlineHeading({ level: 2 }).run()
          }
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive("inlineHeading", { level: 2 })
              ? "bg-gray-300 text-[#5B4FE9]"
              : "text-gray-700"
          }`}
          title="H2 style (inline)"
        >
          <Heading2 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleInlineHeading({ level: 3 }).run()
          }
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive("inlineHeading", { level: 3 })
              ? "bg-gray-300 text-[#5B4FE9]"
              : "text-gray-700"
          }`}
          title="H3 style (inline)"
        >
          <Heading3 className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1 self-center" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive("bulletList")
              ? "bg-gray-300 text-[#5B4FE9]"
              : "text-gray-700"
          }`}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive("orderedList")
              ? "bg-gray-300 text-[#5B4FE9]"
              : "text-gray-700"
          }`}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1 self-center" />

        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
          title="Undo"
        >
          <Undo className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
          title="Redo"
        >
          <Redo className="w-4 h-4" />
        </button>
      </div>

      {/* Editor Content */}
      <div className="max-h-[300px] overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
