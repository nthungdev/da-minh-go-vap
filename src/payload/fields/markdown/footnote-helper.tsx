"use client";

import type { RefObject } from "react";
import { insertFootnoteMarkup } from "@/payload/fields/markdown/footnote-markup";
import type { MarkdownEditorHandle } from "@/payload/fields/markdown/MarkdownEditor";
import styles from "./KeywordTooltipHelper.module.css";

interface FootnoteHelperProps {
  editorRef: RefObject<MarkdownEditorHandle | null>;
}

/** Toolbar button that inserts a sequential `[^n]` marker at the cursor and appends `[^n]: ` below. */
export default function FootnoteHelper({ editorRef }: FootnoteHelperProps) {
  function onInsertFootnote() {
    const editor = editorRef.current;
    if (!editor) return;

    const currentValue = editor.getValue();
    const selection = editor.getSelection();
    const { replacementStart, replacementText } = insertFootnoteMarkup(
      currentValue,
      selection.end,
    );
    editor.replaceRange(replacementStart, currentValue.length, replacementText);
  }

  return (
    <button
      type="button"
      className={styles.secondaryButton}
      onClick={onInsertFootnote}
    >
      Chèn chú thích
    </button>
  );
}
