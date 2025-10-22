import CopyButton from "@/components/copy-button";
import { HTMLAttributes } from "react";

interface ShareToolbarProps extends HTMLAttributes<HTMLDivElement> {
  copyText: string;
}

export default function ShareToolbar({ copyText }: ShareToolbarProps) {
  return (
    <div className="flex flex-row gap-4">
      <CopyButton
        text={copyText}
        className="hover:border-primary rounded-full border p-2 hover:brightness-150"
      />
    </div>
  );
}
