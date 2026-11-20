"use client";

import { useRouter } from "next/navigation";
import { type ComponentType, useEffect, useState } from "react";

interface LivePreviewProps {
  refresh: () => void;
  serverURL: string;
}

export default function RefreshRouteOnSave() {
  const router = useRouter();
  const [serverURL, setServerURL] = useState<string>("");
  const [LivePreview, setLivePreview] =
    useState<ComponentType<LivePreviewProps> | null>(null);

  useEffect(() => {
    if (window.self === window.top) {
      return;
    }
    setServerURL(window.location.origin);
    import("@payloadcms/live-preview-react").then((mod) => {
      setLivePreview(() => mod.RefreshRouteOnSave);
    });
  }, []);

  if (!(serverURL && LivePreview)) {
    return null;
  }

  return <LivePreview refresh={() => router.refresh()} serverURL={serverURL} />;
}
