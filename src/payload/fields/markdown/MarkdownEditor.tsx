"use client";

import React, { useState } from "react";
import MDEditor from "@uiw/react-md-editor";
import rehypeSanitize from "rehype-sanitize";

interface MarkdownEditorProps {
  id: string;
  value: string;
  setValue: (value: string) => void;
}

export default function MarkdownEditor({
  value,
  setValue,
  id,
}: MarkdownEditorProps) {
  const [internalValue, setInternalValue] = useState(value || "");

  function onChange(value?: string) {
    if (value === undefined) return;
    setInternalValue(value);
    setValue(value);
  }

  return (
    <div className="container">
      <MDEditor
        textareaProps={{ id }}
        value={internalValue}
        onChange={onChange}
        previewOptions={{
          rehypePlugins: [[rehypeSanitize]],
        }}
      />
    </div>
  );
}
