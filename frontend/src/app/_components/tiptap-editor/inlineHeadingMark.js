import { Mark, mergeAttributes } from "@tiptap/core";

const LEVELS = [1, 2, 3];

/**
 * Inline heading levels (H1–H3) as spans — stays on the same line as surrounding text.
 */
export const InlineHeading = Mark.create({
  name: "inlineHeading",

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      level: {
        default: 2,
      },
    };
  },

  parseHTML() {
    return [
      { tag: "span.inline-h1", getAttrs: () => ({ level: 1 }) },
      { tag: "span.inline-h2", getAttrs: () => ({ level: 2 }) },
      { tag: "span.inline-h3", getAttrs: () => ({ level: 3 }) },
    ];
  },

  renderHTML({ HTMLAttributes, mark }) {
    const level = LEVELS.includes(mark.attrs.level) ? mark.attrs.level : 2;
    return [
      "span",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: `inline-h${level}`,
      }),
      0,
    ];
  },

  addCommands() {
    return {
      toggleInlineHeading:
        (attributes) =>
        ({ chain, editor }) => {
          if (!LEVELS.includes(attributes.level)) return false;
          if (editor.isActive(this.name, attributes)) {
            return chain().focus().unsetMark(this.name).run();
          }
          return chain()
            .focus()
            .unsetMark(this.name)
            .setMark(this.name, attributes)
            .run();
        },
    };
  },
});

export default InlineHeading;
