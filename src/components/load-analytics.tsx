"use client";

import { analytics } from "@/utils/firebase";
import { useEffect } from "react";

export default function LoadAnalytics() {
  useEffect(() => {
    if (analytics) {
      console.log("Analytics loaded");
    }
  }, []);

  return null;
}
