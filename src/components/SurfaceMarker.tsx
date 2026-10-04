"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Marks the root scroll container (the <main> in layout.tsx) with a
 * `data-surface` attribute so the reserved `scrollbar-gutter` is always painted
 * by the scroll container itself.
 *
 * Why this exists: `<body>` is near-black (`bg-[#0a0a0a]`) so the dark pages
 * (/validate, /login, /) read correctly. Light pages paint their own surface,
 * but the last ~8px on the right — where `[scrollbar-gutter:stable]` reserves
 * space — belongs to <main>, not to the page. If nothing paints it, <body>'s
 * near-black shows through as a black stripe down the right edge.
 *
 * `data-surface="dark"` gives that gutter the dark track/handle, and
 * `data-surface="light"` keeps it zinc. Rendering this attribute from the route
 * means both are correct without either page needing to reach outside itself.
 */
export default function SurfaceMarker() {
  const pathname = usePathname();

  useEffect(() => {
    const dark =
      pathname === "/" ||
      pathname.startsWith("/validate") ||
      pathname.startsWith("/login") ||
      pathname.startsWith("/register");

    const main = document.querySelector("main[data-app-scroll]");
    if (main) main.setAttribute("data-surface", dark ? "dark" : "light");
  }, [pathname]);

  return null;
}
