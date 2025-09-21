"use client";

import MarkdownEditor from "@/payload/fields/markdown/MarkdownEditor";
import { FieldLabel, useField } from "@payloadcms/ui";
import { CodeFieldClientComponent } from "payload";
import React from "react";

const MarkdownField: CodeFieldClientComponent = ({ path, field }) => {
  const { value, setValue } = useField<string>({ path });
  const id = `markdown-field-${path.replace(/\./g, "-")}`;

  return (
    <div className="field-type markdown">
      <FieldLabel
        label={field?.label || field?.name}
        path={path}
        required={field?.required}
        localized={field?.localized}
        htmlFor={id}
      />
      <MarkdownEditor id={id} value={value || ""} setValue={setValue} />
    </div>
  );
};

export default MarkdownField;
