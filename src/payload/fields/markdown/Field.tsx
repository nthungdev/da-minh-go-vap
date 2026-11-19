"use client";

import { useRef } from "react";
import FootnoteHelper from "@/payload/fields/markdown/footnote-helper";
import KeywordTooltipHelper from "@/payload/fields/markdown/KeywordTooltipHelper";
import MarkdownEditor, {
  type MarkdownEditorHandle,
} from "@/payload/fields/markdown/MarkdownEditor";
import { FieldDescription, FieldLabel, useField } from "@payloadcms/ui";
import { CodeFieldClientComponent } from "payload";

const MarkdownField: CodeFieldClientComponent = ({ path, field }) => {
  const { value, setValue } = useField<string>({ path });
  const editorRef = useRef<MarkdownEditorHandle>(null);
  const id = `markdown-field-${path.replace(/\./g, "-")}`;
  const showKeywordHelper =
    field?.admin?.custom?.keywordTooltipHelper !== false;

  return (
    <div className="field-type markdown">
      <FieldLabel
        label={field?.label || field?.name}
        path={path}
        required={field?.required}
        localized={field?.localized}
        htmlFor={id}
      />
      {showKeywordHelper && <KeywordTooltipHelper editorRef={editorRef} />}
      <div style={{ marginBottom: "8px" }}>
        <FootnoteHelper editorRef={editorRef} />
      </div>
      <MarkdownEditor
        ref={editorRef}
        id={id}
        value={value || ""}
        setValue={setValue}
      />
      <FieldDescription description={field?.admin?.description} path={path} />
    </div>
  );
};

export default MarkdownField;
