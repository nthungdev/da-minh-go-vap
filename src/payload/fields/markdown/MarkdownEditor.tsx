"use client";

import { forwardRef, useImperativeHandle, useState } from "react";
import MDEditor from "@uiw/react-md-editor";
import rehypeSanitize from "rehype-sanitize";

interface MarkdownEditorProps {
  id: string;
  value: string;
  setValue: (value: string) => void;
}

export interface MarkdownEditorHandle {
  /** Current selection range and text in the editor textarea. */
  getSelection: () => { start: number; end: number; text: string };
  /** Replaces `[start, end)` with `text`, then focuses the editor with the caret after the insertion. */
  replaceRange: (start: number, end: number, text: string) => void;
}

const MarkdownEditor = forwardRef<MarkdownEditorHandle, MarkdownEditorProps>(
  function MarkdownEditor({ value, setValue, id }, ref) {
    const [internalValue, setInternalValue] = useState(value || "");

    function onChange(value?: string) {
      if (value === undefined) return;
      setInternalValue(value);
      setValue(value);
    }

    useImperativeHandle(ref, () => {
      const getTextarea = () =>
        document.getElementById(id) as HTMLTextAreaElement | null;

      return {
        getSelection() {
          const textarea = getTextarea();
          const start = textarea?.selectionStart ?? internalValue.length;
          const end = textarea?.selectionEnd ?? start;
          return { start, end, text: internalValue.slice(start, end) };
        },
        replaceRange(start, end, text) {
          const nextValue =
            internalValue.slice(0, start) + text + internalValue.slice(end);
          onChange(nextValue);

          const caret = start + text.length;
          // Wait for MDEditor to render the new value before moving the caret.
          requestAnimationFrame(() => {
            const textarea = getTextarea();
            if (!textarea) return;
            textarea.focus();
            textarea.setSelectionRange(caret, caret);
          });
        },
      };
    });

    return (
      <div className="container">
        <MDEditor
          textareaProps={{ id }}
          value={internalValue}
          onChange={onChange}
          preview="edit"
          previewOptions={{
            rehypePlugins: [[rehypeSanitize]],
          }}
        />
      </div>
    );
  },
);

export default MarkdownEditor;
