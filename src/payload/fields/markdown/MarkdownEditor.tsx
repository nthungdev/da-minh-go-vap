"use client";

import MDEditor from "@uiw/react-md-editor";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import rehypeSanitize from "rehype-sanitize";

interface MarkdownEditorProps {
  id: string;
  value: string;
  setValue: (value: string) => void;
}

export interface MarkdownEditorHandle {
  /** Current markdown text value in the editor. */
  getValue: () => string;
  /** Current selection range and text in the editor textarea. */
  getSelection: () => { start: number; end: number; text: string };
  /** Replaces `[start, end)` with `text`, then focuses the editor with the caret after the insertion. */
  replaceRange: (start: number, end: number, text: string) => void;
}

const MarkdownEditor = forwardRef<MarkdownEditorHandle, MarkdownEditorProps>(
  function MarkdownEditor({ value, setValue, id }, ref) {
    const [internalValue, setInternalValue] = useState(value || "");
    const internalValueRef = useRef(internalValue);

    useEffect(() => {
      const next = value || "";
      internalValueRef.current = next;
      setInternalValue(next);
    }, [value]);

    const onChange = useCallback(
      (nextValue?: string) => {
        if (nextValue === undefined) return;
        internalValueRef.current = nextValue;
        setInternalValue(nextValue);
        setValue(nextValue);
      },
      [setValue],
    );

    useImperativeHandle(ref, () => {
      const getTextarea = () =>
        document.getElementById(id) as HTMLTextAreaElement | null;

      return {
        getValue() {
          return internalValueRef.current;
        },
        getSelection() {
          const current = internalValueRef.current;
          const textarea = getTextarea();
          const start = textarea?.selectionStart ?? current.length;
          const end = textarea?.selectionEnd ?? start;
          return { start, end, text: current.slice(start, end) };
        },
        replaceRange(start, end, text) {
          const current = internalValueRef.current;
          const nextValue = current.slice(0, start) + text + current.slice(end);
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
    }, [id, onChange]);

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
