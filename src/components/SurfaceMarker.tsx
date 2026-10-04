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
 *
 * AUTH ROUTES follow the OS light-dark preference: /login and /register are a
 * split layout whose right-hand form panel adapts to `prefers-color-scheme`.
 * The reserved gutter sits at the far right — over that form panel — so
 * hard-coding "dark" here would leave a black stripe down the edge of a white
 * page for every user whose system is in light mode.
 */
export default function SurfaceMarker() {
  const pathname = usePathname();

  useEffect(() => {
    // Surfaces that are dark no matter what the OS preference is.
    const alwaysDark = pathname === "/" || pathname.startsWith("/validate");
    const isAuth = pathname.startsWith("/login") || pathname.startsWith("/register");

    const main = document.querySelector("main[data-app-scroll]");
    if (!main) return;

    const apply = () => {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const dark = alwaysDark || (isAuth && prefersDark);
      main.setAttribute("data-surface", dark ? "dark" : "light");
    };

    apply();

    // Only the auth routes can change surface without a navigation, so only
    // they need to listen for the OS flipping mid-session.
    if (!isAuth) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [pathname]);

  return null;
}
