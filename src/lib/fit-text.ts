"use client";

/**
 * Proportional font auto-fit engine.
 *
 * Rather than guessing with character counts, this measures real rendered text
 * with the Canvas 2D API (which honours the same font stack, weight, style and
 * letter-spacing the DOM uses), then binary-searches for the largest font size
 * that fits inside the element's declared box.
 *
 * This is what keeps long names ("Maria Clara Delos Santos") and long event
 * titles from wrapping and colliding with neighbouring elements.
 */

export interface FitInput {
  text: string;
  fontFamily: string;
  fontWeight?: string | number;
  fontStyle?: string;
  letterSpacing?: number;
  /** Maximum number of lines the text is allowed to occupy. Default 1. */
  maxLines?: number;
  /** Line height multiplier used to derive per-line box height. Default 1.2. */
  lineHeight?: number;
}

export interface FitBox {
  width: number;
  /** Optional fixed height; when set, vertical fit is also enforced. */
  height?: number;
}

const MIN_FONT_SIZE = 24;

// Cache measurement canvases per document to avoid re-allocating.
let measureCtx: CanvasRenderingContext2D | null = null;

function getCtx(): CanvasRenderingContext2D | null {
  if (typeof document === "undefined") return null;
  if (measureCtx) return measureCtx;
  const canvas = document.createElement("canvas");
  measureCtx = canvas.getContext("2d");
  return measureCtx;
}

/**
 * Resolve a CSS font-family value that may contain `var(--font-x, fallback)`.
 * Canvas cannot resolve CSS variables, so we read the computed value from a
 * scratch element when needed.
 */
let fontResolveEl: HTMLSpanElement | null = null;
const resolvedFamilyCache = new Map<string, string>();

export function resolveFontFamily(family: string): string {
  if (typeof document === "undefined") return "sans-serif";
  if (!family) return "sans-serif";
  if (!family.includes("var(")) return family;
  const cached = resolvedFamilyCache.get(family);
  if (cached) return cached;

  if (!fontResolveEl) {
    fontResolveEl = document.createElement("span");
    fontResolveEl.style.position = "absolute";
    fontResolveEl.style.visibility = "hidden";
    fontResolveEl.style.pointerEvents = "none";
    fontResolveEl.style.left = "-9999px";
    document.body.appendChild(fontResolveEl);
  }
  fontResolveEl.style.fontFamily = family;
  const resolved = getComputedStyle(fontResolveEl).fontFamily || "sans-serif";
  resolvedFamilyCache.set(family, resolved);
  return resolved;
}

/** Measure the pixel width of a single line at a given font size. */
function measureWidth(
  text: string,
  fontSize: number,
  font: { family: string; weight?: string | number; style?: string },
  letterSpacing: number
): number {
  const ctx = getCtx();
  if (!ctx) {
    // SSR / no-canvas fallback: rough estimate.
    return text.length * fontSize * 0.55 + Math.max(0, text.length - 1) * letterSpacing;
  }
  const weight = font.weight ?? "normal";
  const style = font.style ?? "normal";
  ctx.font = `${style} ${weight} ${fontSize}px ${font.family}`;
  const base = ctx.measureText(text).width;
  // Canvas measureText ignores letter-spacing, so add it manually.
  const extra = Math.max(0, text.length - 1) * letterSpacing;
  return base + extra;
}

/**
 * Find the largest font size at which `text` fits within `box`, never exceeding
 * `maxFontSize` and never dropping below a readable minimum.
 */
export function fitFontSize(
  input: FitInput,
  box: FitBox,
  maxFontSize: number
): number {
  const {
    text,
    fontFamily,
    fontWeight,
    fontStyle,
    letterSpacing = 0,
    maxLines = 1,
    lineHeight = 1.2,
  } = input;

  if (!text || box.width <= 0 || maxFontSize <= 0) return maxFontSize;

  const family = resolveFontFamily(fontFamily);
  const font = { family, weight: fontWeight, style: fontStyle };

  // Break on explicit newlines, then greedily wrap words to estimate line count.
  const paragraphs = text.split(/\n/);
  const wordsPerLine = (fs: number): number[] => {
    const lines: number[] = [];
    for (const para of paragraphs) {
      const words = para.split(/\s+/).filter(Boolean);
      if (words.length === 0) {
        lines.push(0);
        continue;
      }
      let current = "";
      let count = 0;
      for (const w of words) {
        const candidate = current ? `${current} ${w}` : w;
        if (measureWidth(candidate, fs, font, letterSpacing) <= box.width || !current) {
          current = candidate;
        } else {
          lines.push(measureWidth(current, fs, font, letterSpacing));
          current = w;
        }
        count++;
      }
      if (current) lines.push(measureWidth(current, fs, font, letterSpacing));
    }
    return lines;
  };

  const fits = (fs: number): boolean => {
    const lines = wordsPerLine(fs);
    if (lines.length > maxLines) return false;
    const widest = Math.max(...lines, 0);
    if (widest > box.width + 0.5) return false;
    if (box.height && lines.length * fs * lineHeight > box.height + 0.5) return false;
    return true;
  };

  if (fits(maxFontSize)) return maxFontSize;

  // Binary search for the largest fitting size.
  let lo = MIN_FONT_SIZE;
  let hi = maxFontSize;
  let best = MIN_FONT_SIZE;
  while (hi - lo > 1) {
    const mid = Math.floor((lo + hi) / 2);
    if (fits(mid)) {
      best = mid;
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return best;
}
