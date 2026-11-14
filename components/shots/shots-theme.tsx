"use client";

import { useEffect } from "react";

/** Keep the shared footer on the same dark tokens as this route. */
export function ShotsTheme() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("dark");
    return () => {
      root.classList.remove("dark");
    };
  }, []);

  return null;
}
