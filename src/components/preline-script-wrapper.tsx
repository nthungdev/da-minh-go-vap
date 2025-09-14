"use client";

import dynamic from "next/dynamic";

const PrelineScript = dynamic(() => import("./preline-script"), {
  ssr: false,
});

export default function PrelineScriptWrapper() {
  return <PrelineScript />;
}
