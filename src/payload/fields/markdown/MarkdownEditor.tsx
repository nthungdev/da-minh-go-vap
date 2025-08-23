import React, { useState } from "react";
import MDEditor from "@uiw/react-md-editor";
import rehypeSanitize from "rehype-sanitize";

interface MarkdownEditorProps {
  id: string;
  value: string;
  setValue: (value: string) => void;
}

export default function MarkdownEditor(props: MarkdownEditorProps) {
  const [value, setValue] = useState(props.value || "");

  function onChange(value?: string) {
    if (value === undefined) return;
    setValue(value);
    props.setValue(value);
  }

  return (
    <div className="container">
      <MDEditor
        value={value}
        onChange={onChange}
        previewOptions={{
          rehypePlugins: [[rehypeSanitize]],
        }}
      />
    </div>
  );
}
