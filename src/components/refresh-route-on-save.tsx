"use client";

import { RefreshRouteOnSave as PayloadLivePreview } from "@payloadcms/live-preview-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function RefreshRouteOnSave() {
  const router = useRouter();
  const [serverURL, setServerURL] = useState<string>("");

  useEffect(() => {
    setServerURL(window.location.origin);
  }, []);

  if (!serverURL) {
    return null;
  }

  return (
    <PayloadLivePreview
      refresh={() => router.refresh()}
      serverURL={serverURL}
    />
  );
}
