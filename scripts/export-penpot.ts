/**
 * Exports the live `/design-system` showcase and `design/tokens.json` into a
 * reproducible `.penpot` archive at `design/da-minh-go-vap.penpot`.
 *
 * Usage:
 *   pnpm penpot:export [baseUrl]
 *   node scripts/export-penpot.ts [baseUrl]
 */
import { execFileSync, spawn, type ChildProcess } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import net from "node:net";
import path from "node:path";
import zlib from "node:zlib";
import { chromium } from "playwright-core";

const OUTPUT_PATH = path.resolve("design/da-minh-go-vap.penpot");
const TOKENS_PATH = path.resolve("design/tokens.json");

const VIEWPORTS = [
  { name: "Desktop", width: 1440, height: 900 },
  { name: "Tablet", width: 768, height: 1024 },
  { name: "Mobile", width: 375, height: 812 },
] as const;

const PAGE_NAMES = [
  "01 Foundations",
  "02 UI Components",
  "03 CMS Blocks",
  "04 Page Templates",
] as const;

const RESPONSIVE_PAGES = new Set<string>([
  "03 CMS Blocks",
  "04 Page Templates",
]);

interface PenpotColorEntry {
  id: string;
  name: string;
  path: string;
  color: string;
  opacity: number;
}

interface PenpotTypographyEntry {
  id: string;
  name: string;
  path: string;
  fontId: string;
  fontFamily: string;
  fontVariantId: string;
  fontSize: string;
  fontWeight: string;
  fontStyle: string;
  lineHeight: string;
  letterSpacing: string;
  textTransform: string;
}

interface PenpotComponentEntry {
  id: string;
  name: string;
  path: string;
  mainInstanceId: string;
  mainInstancePage: string;
}

interface PenpotMediaEntry {
  id: string;
  name: string;
  width: number;
  height: number;
  mtype: string;
  extension: string;
}

interface PenpotShape {
  id: string;
  type: "frame" | "rect" | "text" | "svg-raw" | "image" | "path";
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  parentId: string;
  frameId: string;
  shapes?: string[];
  fills?: Array<{ fillColor: string; fillOpacity: number }>;
  strokes?: Array<{
    strokeColor: string;
    strokeOpacity: number;
    strokeWidth: number;
    strokeStyle: string;
  }>;
  r1?: number;
  r2?: number;
  r3?: number;
  r4?: number;
  shadow?: Array<{
    style: string;
    offsetX: number;
    offsetY: number;
    blur: number;
    spread: number;
    color: { color: string; opacity: number };
  }>;
  content?: unknown;
  svgString?: string;
  metadata?: {
    id: string;
    width: number;
    height: number;
    mtype: string;
  };
}

interface ExtractedNode {
  kind: "frame" | "rect" | "text" | "svg" | "image";
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  backgroundColor?: string;
  backgroundOpacity?: number;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  boxShadow?: string;
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  lineHeight?: number;
  color?: string;
  textAlign?: string;
  svgString?: string;
  imageSrc?: string;
  imageWidth?: number;
  imageHeight?: number;
  children: ExtractedNode[];
}

interface ExtractedFrame {
  pageName: string;
  frameName: string;
  width: number;
  height: number;
  root: ExtractedNode;
}

/** Deterministic or random UUID helper. */
function uuid(): string {
  return crypto.randomUUID();
}

/** Convert CSS rgb/rgba/hex/oklch string to #rrggbb + opacity. */
function parseCssColor(
  raw?: string,
): { color: string; opacity: number } | null {
  if (!raw || raw === "transparent" || raw === "none") return null;
  const trimmed = raw.trim();

  if (trimmed.startsWith("#")) {
    const hex = trimmed.slice(1);
    if (hex.length === 3) {
      const r = (hex[0] ?? "0") + (hex[0] ?? "0");
      const g = (hex[1] ?? "0") + (hex[1] ?? "0");
      const b = (hex[2] ?? "0") + (hex[2] ?? "0");
      return { color: `#${r}${g}${b}`.toLowerCase(), opacity: 1 };
    }
    if (hex.length === 6) {
      return { color: `#${hex}`.toLowerCase(), opacity: 1 };
    }
    if (hex.length === 8) {
      const alpha = parseInt(hex.slice(6, 8), 16) / 255;
      return {
        color: `#${hex.slice(0, 6)}`.toLowerCase(),
        opacity: Number(alpha.toFixed(3)),
      };
    }
  }

  const rgbaMatch = trimmed.match(
    /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/,
  );
  if (rgbaMatch) {
    const r = Math.min(255, Math.max(0, Math.round(Number(rgbaMatch[1]))));
    const g = Math.min(255, Math.max(0, Math.round(Number(rgbaMatch[2]))));
    const b = Math.min(255, Math.max(0, Math.round(Number(rgbaMatch[3]))));
    const a = rgbaMatch[4] !== undefined ? Number(rgbaMatch[4]) : 1;
    if (a === 0) return null;
    const hex = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
    return { color: hex, opacity: Number(a.toFixed(3)) };
  }

  // Fallback for oklch() or named colors in tokens.json
  if (trimmed.startsWith("oklch(")) {
    const match = trimmed.match(/oklch\(\s*([\d.]+)/);
    const l = match ? Number(match[1]) : 0.5;
    const v = Math.min(255, Math.max(0, Math.round(l * 255)));
    const hex = `#${v.toString(16).padStart(2, "0")}${v.toString(16).padStart(2, "0")}${v.toString(16).padStart(2, "0")}`;
    return { color: hex, opacity: 1 };
  }

  return null;
}

/** Find an available ephemeral TCP port on localhost. */
async function getFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.unref();
    srv.on("error", reject);
    srv.listen(0, "127.0.0.1", () => {
      const addr = srv.address();
      if (!addr || typeof addr === "string") {
        srv.close(() => reject(new Error("Failed to acquire ephemeral port")));
        return;
      }
      const { port } = addr;
      srv.close(() => resolve(port));
    });
  });
}

/** Poll URL until HTTP 200 or timeout. */
async function waitForHttp200(url: string, timeoutMs = 120_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url);
      if (res.status === 200) return;
    } catch {
      // Server not ready yet
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`Timed out waiting for ${url} to return HTTP 200`);
}

/** Ensure design/tokens.json exists and parse it. */
async function loadTokens(): Promise<Record<string, unknown>> {
  try {
    await fs.access(TOKENS_PATH);
  } catch {
    execFileSync("node", ["scripts/export-tokens.ts"], { stdio: "inherit" });
  }
  const raw = await fs.readFile(TOKENS_PATH, "utf8");
  return JSON.parse(raw) as Record<string, unknown>;
}

/** Build Penpot Color and Typography libraries from W3C tokens.json. */
function buildTokenLibraries(tokens: Record<string, unknown>): {
  colors: Record<string, PenpotColorEntry>;
  typographies: Record<string, PenpotTypographyEntry>;
} {
  const colors: Record<string, PenpotColorEntry> = {};
  const typographies: Record<string, PenpotTypographyEntry> = {};

  function walkColors(node: unknown, trail: string[]): void {
    if (!node || typeof node !== "object") return;
    const obj = node as Record<string, unknown>;
    if (obj.$type === "color" && typeof obj.$value === "string") {
      const parsed = parseCssColor(obj.$value);
      if (parsed) {
        const id = uuid();
        const name = trail[trail.length - 1] ?? "color";
        const groupPath = trail.slice(0, -1).join(" / ");
        colors[id] = {
          id,
          name,
          path: groupPath,
          color: parsed.color,
          opacity: parsed.opacity,
        };
      }
      return;
    }
    for (const [key, val] of Object.entries(obj)) {
      if (key.startsWith("$")) continue;
      walkColors(val, [...trail, key]);
    }
  }

  walkColors(tokens.color, ["color"]);
  walkColors(tokens.semantic, ["semantic"]);

  const typography = (tokens.typography ?? {}) as Record<string, unknown>;
  const fontSizes = (typography.fontSize ?? {}) as Record<
    string,
    { $value?: string }
  >;
  const fontFamilies = (typography.fontFamily ?? {}) as Record<
    string,
    { $value?: string[] | string }
  >;

  const primaryFamilyRaw = fontFamilies.sans?.$value;
  const primaryFamily =
    (Array.isArray(primaryFamilyRaw)
      ? primaryFamilyRaw[0]
      : typeof primaryFamilyRaw === "string"
        ? primaryFamilyRaw
        : undefined) ?? "Nunito";

  for (const [scaleName, token] of Object.entries(fontSizes)) {
    if (scaleName.startsWith("$") || !token?.$value) continue;
    const id = uuid();
    const px = token.$value.endsWith("rem")
      ? String(Math.round(parseFloat(token.$value) * 16))
      : token.$value.replace("px", "");
    typographies[id] = {
      id,
      name: scaleName,
      path: "typography",
      fontId: "gfont-nunito",
      fontFamily: primaryFamily,
      fontVariantId: "regular",
      fontSize: px,
      fontWeight: "400",
      fontStyle: "normal",
      lineHeight: "1.4",
      letterSpacing: "0",
      textTransform: "none",
    };
  }

  return { colors, typographies };
}

/**
 * Compute CRC32 for a Buffer (standard IEEE 802.3 polynomial).
 */
function crc32(buf: Buffer): number {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i] ?? 0;
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

/**
 * Package an in-memory map of file paths -> Buffers into a valid ZIP archive.
 */
function createZipArchive(
  entries: Array<{ name: string; data: Buffer }>,
): Buffer {
  const localParts: Buffer[] = [];
  const centralParts: Buffer[] = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBuf = Buffer.from(entry.name, "utf8");
    const compressed = zlib.deflateRawSync(entry.data);
    const crc = crc32(entry.data);

    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0); // Local file header signature
    localHeader.writeUInt16LE(20, 4); // Version needed to extract
    localHeader.writeUInt16LE(0x0800, 6); // UTF-8 flag
    localHeader.writeUInt16LE(8, 8); // Compression method: deflate
    localHeader.writeUInt16LE(0, 10); // Mod time
    localHeader.writeUInt16LE(0, 12); // Mod date
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(compressed.length, 18);
    localHeader.writeUInt32LE(entry.data.length, 22);
    localHeader.writeUInt16LE(nameBuf.length, 26);
    localHeader.writeUInt16LE(0, 28); // Extra field length

    localParts.push(localHeader, nameBuf, compressed);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0); // Central directory signature
    centralHeader.writeUInt16LE(20, 4); // Version made by
    centralHeader.writeUInt16LE(20, 6); // Version needed
    centralHeader.writeUInt16LE(0x0800, 8); // UTF-8 flag
    centralHeader.writeUInt16LE(8, 10); // Compression method: deflate
    centralHeader.writeUInt16LE(0, 12);
    centralHeader.writeUInt16LE(0, 14);
    centralHeader.writeUInt32LE(crc, 16);
    centralHeader.writeUInt32LE(compressed.length, 20);
    centralHeader.writeUInt32LE(entry.data.length, 24);
    centralHeader.writeUInt16LE(nameBuf.length, 28);
    centralHeader.writeUInt16LE(0, 30); // Extra field length
    centralHeader.writeUInt16LE(0, 32); // Comment length
    centralHeader.writeUInt16LE(0, 34); // Disk number
    centralHeader.writeUInt16LE(0, 36); // Internal attrs
    centralHeader.writeUInt32LE(0, 38); // External attrs
    centralHeader.writeUInt32LE(offset, 42); // Local header offset

    centralParts.push(centralHeader, nameBuf);
    offset += localHeader.length + nameBuf.length + compressed.length;
  }

  const centralDir = Buffer.concat(centralParts);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0); // End of central directory signature
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(entries.length, 8);
  eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(centralDir.length, 12);
  eocd.writeUInt32LE(offset, 16);
  eocd.writeUInt16LE(0, 20);

  return Buffer.concat([...localParts, centralDir, eocd]);
}

/**
 * Extract DOM tree under each [data-penpot-page] / [data-penpot-frame] in the browser.
 */
async function extractFramesForViewport(
  page: import("playwright-core").Page,
): Promise<ExtractedFrame[]> {
  return page.evaluate(() => {
    const frames: ExtractedFrame[] = [];
    const pageEls =
      document.querySelectorAll<HTMLElement>("[data-penpot-page]");

    function extractNode(
      el: Element,
      originX: number,
      originY: number,
    ): ExtractedNode | null {
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return null;

      const x = Math.round(rect.left - originX);
      const y = Math.round(rect.top - originY);
      const width = Math.round(rect.width);
      const height = Math.round(rect.height);

      const tag = el.tagName.toLowerCase();

      if (tag === "svg") {
        return {
          kind: "svg",
          name: el.getAttribute("aria-label") || "Icon",
          x,
          y,
          width,
          height,
          svgString: el.outerHTML,
          children: [],
        };
      }

      if (tag === "img") {
        const img = el as HTMLImageElement;
        return {
          kind: "image",
          name: img.alt || "Image",
          x,
          y,
          width,
          height,
          imageSrc: img.currentSrc || img.src,
          imageWidth: img.naturalWidth || width,
          imageHeight: img.naturalHeight || height,
          children: [],
        };
      }

      const style = getComputedStyle(el);
      const bg = style.backgroundColor;
      const borderW = parseFloat(style.borderTopWidth) || 0;
      const borderR = parseFloat(style.borderTopLeftRadius) || 0;
      const hasBg = bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent";
      const hasBorder = borderW > 0;
      const hasShadow = style.boxShadow && style.boxShadow !== "none";

      const children: ExtractedNode[] = [];

      // Extract direct text nodes
      for (const child of Array.from(el.childNodes)) {
        if (child.nodeType === Node.TEXT_NODE) {
          const text = child.textContent?.trim();
          if (text) {
            const range = document.createRange();
            range.selectNodeContents(child);
            const tRect = range.getBoundingClientRect();
            if (tRect.width > 0 && tRect.height > 0) {
              children.push({
                kind: "text",
                name: text.slice(0, 32),
                x: Math.round(tRect.left - originX),
                y: Math.round(tRect.top - originY),
                width: Math.round(tRect.width),
                height: Math.round(tRect.height),
                text,
                fontFamily: style.fontFamily,
                fontSize: parseFloat(style.fontSize) || 16,
                fontWeight: style.fontWeight,
                lineHeight: parseFloat(style.lineHeight) || 24,
                color: style.color,
                textAlign: style.textAlign,
                children: [],
              });
            }
          }
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          const childNode = extractNode(child as Element, originX, originY);
          if (childNode) children.push(childNode);
        }
      }

      const isContainer =
        style.display.includes("flex") ||
        style.display.includes("grid") ||
        children.length > 1;

      if (!hasBg && !hasBorder && !hasShadow && children.length === 1) {
        return children[0] ?? null;
      }

      const kind: ExtractedNode["kind"] = isContainer ? "frame" : "rect";

      return {
        kind,
        name:
          (el as HTMLElement).dataset?.penpotFrame ||
          el.getAttribute("aria-label") ||
          tag,
        x,
        y,
        width,
        height,
        backgroundColor: hasBg ? bg : undefined,
        borderColor: hasBorder ? style.borderTopColor : undefined,
        borderWidth: hasBorder ? borderW : undefined,
        borderRadius: borderR > 0 ? borderR : undefined,
        boxShadow: hasShadow ? style.boxShadow : undefined,
        children,
      };
    }

    for (const pageEl of Array.from(pageEls)) {
      const pageName = pageEl.dataset.penpotPage ?? "Untitled";
      const frameEls = pageEl.querySelectorAll<HTMLElement>(
        "[data-penpot-frame]",
      );
      for (const frameEl of Array.from(frameEls)) {
        const frameName = frameEl.dataset.penpotFrame ?? "Frame";
        const rect = frameEl.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) continue;

        const root = extractNode(frameEl, rect.left, rect.top);
        if (!root) continue;
        root.kind = "frame";
        root.name = frameName;
        root.x = 0;
        root.y = 0;

        frames.push({
          pageName,
          frameName,
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          root,
        });
      }
    }

    return frames;
  });
}

/**
 * Convert an ExtractedNode tree into flat Penpot page objects.
 */
async function populatePenpotObjects(
  node: ExtractedNode,
  parentId: string,
  frameId: string,
  offsetX: number,
  offsetY: number,
  objects: Record<string, PenpotShape>,
  mediaMap: Record<string, PenpotMediaEntry>,
  mediaBuffers: Map<string, Buffer>,
  baseUrl: string,
): Promise<string> {
  const id = uuid();
  const childIds: string[] = [];

  const isTopFrame = parentId === "00000000-0000-0000-0000-000000000000";
  const currentFrameId = isTopFrame ? id : frameId;

  const x = isTopFrame ? offsetX : offsetX + node.x;
  const y = isTopFrame ? offsetY : offsetY + node.y;

  const fills: PenpotShape["fills"] = [];
  const bgParsed = parseCssColor(node.backgroundColor);
  if (bgParsed) {
    fills.push({ fillColor: bgParsed.color, fillOpacity: bgParsed.opacity });
  } else if (isTopFrame) {
    fills.push({ fillColor: "#ffffff", fillOpacity: 1 });
  }

  const strokes: PenpotShape["strokes"] = [];
  if (node.borderWidth && node.borderColor) {
    const strokeParsed = parseCssColor(node.borderColor);
    if (strokeParsed) {
      strokes.push({
        strokeColor: strokeParsed.color,
        strokeOpacity: strokeParsed.opacity,
        strokeWidth: node.borderWidth,
        strokeStyle: "solid",
      });
    }
  }

  if (node.kind === "text") {
    const textColor = parseCssColor(node.color) ?? {
      color: "#111827",
      opacity: 1,
    };
    objects[id] = {
      id,
      type: "text",
      name: node.name,
      x,
      y,
      width: Math.max(1, node.width),
      height: Math.max(1, node.height),
      parentId,
      frameId: currentFrameId,
      content: {
        type: "root",
        children: [
          {
            type: "paragraph-set",
            children: [
              {
                type: "paragraph",
                textAlign: node.textAlign || "left",
                children: [
                  {
                    text: node.text ?? "",
                    fontFamily: node.fontFamily || "Nunito",
                    fontSize: String(node.fontSize ?? 16),
                    fontWeight: node.fontWeight || "400",
                    lineHeight: String(
                      node.fontSize
                        ? Number(
                            ((node.lineHeight ?? 24) / node.fontSize).toFixed(
                              2,
                            ),
                          )
                        : 1.5,
                    ),
                    fills: [
                      {
                        fillColor: textColor.color,
                        fillOpacity: textColor.opacity,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    };
    return id;
  }

  if (node.kind === "svg" && node.svgString) {
    objects[id] = {
      id,
      type: "svg-raw",
      name: node.name,
      x,
      y,
      width: Math.max(1, node.width),
      height: Math.max(1, node.height),
      parentId,
      frameId: currentFrameId,
      svgString: node.svgString,
    };
    return id;
  }

  if (node.kind === "image" && node.imageSrc) {
    let mediaId: string | null = null;
    let mtype = "image/png";
    let ext = "png";
    try {
      const resolvedUrl = node.imageSrc.startsWith("http")
        ? node.imageSrc
        : new URL(node.imageSrc, baseUrl).toString();
      const res = await fetch(resolvedUrl);
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        const ct = res.headers.get("content-type") || "image/png";
        mtype = (ct.split(";")[0] ?? "image/png").trim();
        ext = mtype.includes("jpeg")
          ? "jpg"
          : mtype.includes("webp")
            ? "webp"
            : mtype.includes("svg")
              ? "svg"
              : "png";
        mediaId = uuid();
        mediaMap[mediaId] = {
          id: mediaId,
          name: node.name,
          width: node.imageWidth || node.width,
          height: node.imageHeight || node.height,
          mtype,
          extension: ext,
        };
        mediaBuffers.set(`${mediaId}.${ext}`, buf);
      }
    } catch {
      // Fallback to rect if image fetch fails
    }

    if (mediaId) {
      objects[id] = {
        id,
        type: "image",
        name: node.name,
        x,
        y,
        width: Math.max(1, node.width),
        height: Math.max(1, node.height),
        parentId,
        frameId: currentFrameId,
        metadata: {
          id: mediaId,
          width: node.imageWidth || node.width,
          height: node.imageHeight || node.height,
          mtype,
        },
      };
      return id;
    }
  }

  for (const child of node.children) {
    const childId = await populatePenpotObjects(
      child,
      id,
      currentFrameId,
      isTopFrame ? x : offsetX,
      isTopFrame ? y : offsetY,
      objects,
      mediaMap,
      mediaBuffers,
      baseUrl,
    );
    childIds.push(childId);
  }

  const shape: PenpotShape = {
    id,
    type: node.kind === "frame" ? "frame" : "rect",
    name: node.name,
    x,
    y,
    width: Math.max(1, node.width),
    height: Math.max(1, node.height),
    parentId,
    frameId: currentFrameId,
    ...(node.kind === "frame" ? { shapes: childIds } : {}),
    ...(fills.length > 0 ? { fills } : {}),
    ...(strokes.length > 0 ? { strokes } : {}),
  };

  if (node.borderRadius) {
    shape.r1 = node.borderRadius;
    shape.r2 = node.borderRadius;
    shape.r3 = node.borderRadius;
    shape.r4 = node.borderRadius;
  }

  objects[id] = shape;
  return id;
}

async function main(): Promise<void> {
  const cliBaseUrl = process.argv[2]?.replace(/\/$/, "");
  let devProcess: ChildProcess | null = null;
  let baseUrl = cliBaseUrl;

  if (!baseUrl) {
    const port = await getFreePort();
    baseUrl = `http://localhost:${port}`;
    console.log(`Starting Next.js dev server on ${baseUrl}...`);
    devProcess = spawn("pnpm", ["dev", "--port", String(port)], {
      stdio: "ignore",
      detached: true,
      env: {
        ...process.env,
        SKIP_ENV_VALIDATION: "true",
        AUTH_USER: process.env.AUTH_USER || "design-system",
        AUTH_PASSWORD: process.env.AUTH_PASSWORD || "design-system",
        PAYLOAD_SECRET:
          process.env.PAYLOAD_SECRET || "design-system-export-secret",
        DATABASE_URI:
          process.env.DATABASE_URI || "mongodb://127.0.0.1:27017/design-system",
        PAYLOAD_ADMIN_EMAIL:
          process.env.PAYLOAD_ADMIN_EMAIL || "admin@example.com",
        PAYLOAD_ADMIN_PASSWORD:
          process.env.PAYLOAD_ADMIN_PASSWORD || "design-system-admin",
      },
    });
  }

  let browser: import("playwright-core").Browser | null = null;
  try {
    if (!cliBaseUrl) {
      await waitForHttp200(`${baseUrl}/design-system`);
    }

    const tokens = await loadTokens();
    const { colors, typographies } = buildTokenLibraries(tokens);

    browser = await chromium.launch(
      process.env.CHROME_PATH
        ? { executablePath: process.env.CHROME_PATH }
        : { channel: "chrome" },
    );
    const viewportExtractions = new Map<string, ExtractedFrame[]>();
    const page = await browser.newPage();
    page.setDefaultTimeout(120_000);

    for (const vp of VIEWPORTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(`${baseUrl}/design-system`, { waitUntil: "load" });
      await page
        .waitForLoadState("networkidle", { timeout: 15_000 })
        .catch(() => {});
      await page.locator("[data-penpot-page]").first().waitFor();

      const frames = await extractFramesForViewport(page);
      viewportExtractions.set(vp.name, frames);
      console.log(
        `Extracted ${frames.length} frames at ${vp.name} (${vp.width}px)`,
      );
    }

    const fileId = uuid();
    const pageIds: string[] = [];
    const pagesIndex: Record<string, { id: string; name: string }> = {};
    const pagePayloads = new Map<
      string,
      { id: string; name: string; objects: Record<string, PenpotShape> }
    >();
    const components: Record<string, PenpotComponentEntry> = {};
    const mediaMap: Record<string, PenpotMediaEntry> = {};
    const mediaBuffers = new Map<string, Buffer>();

    for (const pageName of PAGE_NAMES) {
      const pageId = uuid();
      pageIds.push(pageId);
      pagesIndex[pageId] = { id: pageId, name: pageName };

      const rootId = "00000000-0000-0000-0000-000000000000";
      const rootShapes: string[] = [];
      const objects: Record<string, PenpotShape> = {
        [rootId]: {
          id: rootId,
          type: "frame",
          name: "Root Frame",
          x: 0,
          y: 0,
          width: 0.01,
          height: 0.01,
          parentId: rootId,
          frameId: rootId,
          shapes: rootShapes,
        },
      };

      const viewportsToUse = RESPONSIVE_PAGES.has(pageName)
        ? VIEWPORTS
        : [VIEWPORTS[0]];

      let cursorX = 0;
      for (const vp of viewportsToUse) {
        const frames = (viewportExtractions.get(vp.name) ?? []).filter(
          (f) => f.pageName === pageName,
        );
        let cursorY = 0;
        let maxColWidth = 0;

        for (const frame of frames) {
          const artboardName = RESPONSIVE_PAGES.has(pageName)
            ? `${frame.frameName} (${vp.width}px)`
            : frame.frameName;
          frame.root.name = artboardName;

          const topId = await populatePenpotObjects(
            frame.root,
            rootId,
            rootId,
            cursorX,
            cursorY,
            objects,
            mediaMap,
            mediaBuffers,
            baseUrl,
          );
          rootShapes.push(topId);

          if (pageName === "02 UI Components") {
            const compId = uuid();
            components[compId] = {
              id: compId,
              name: frame.frameName,
              path: "UI Components",
              mainInstanceId: topId,
              mainInstancePage: pageId,
            };
          }

          cursorY += frame.height + 80;
          maxColWidth = Math.max(maxColWidth, frame.width);
        }

        cursorX += maxColWidth + 120;
      }

      pagePayloads.set(pageId, { id: pageId, name: pageName, objects });
    }

    const manifest = {
      type: "penpot/export-file",
      version: 1,
      generatedBy: "scripts/export-penpot.ts",
      files: [
        {
          id: fileId,
          name: "Đa Minh Gò Vấp Design System",
          features: ["fdata/shape-data-type", "components/v2", "layout/grid"],
          pages: pageIds,
          hasMedia: mediaBuffers.size > 0,
        },
      ],
    };

    const fileJson = {
      id: fileId,
      name: "Đa Minh Gò Vấp Design System",
      pages: pageIds,
      pagesIndex,
      colors,
      typographies,
      components,
      media: mediaMap,
    };

    const zipEntries: Array<{ name: string; data: Buffer }> = [
      {
        name: "manifest.json",
        data: Buffer.from(JSON.stringify(manifest, null, 2), "utf8"),
      },
      {
        name: `files/${fileId}.json`,
        data: Buffer.from(JSON.stringify(fileJson, null, 2), "utf8"),
      },
    ];

    for (const [pageId, payload] of pagePayloads) {
      zipEntries.push({
        name: `files/${fileId}/pages/${pageId}.json`,
        data: Buffer.from(JSON.stringify(payload, null, 2), "utf8"),
      });
    }

    for (const [filename, buf] of mediaBuffers) {
      zipEntries.push({
        name: `files/${fileId}/media/${filename}`,
        data: buf,
      });
    }

    await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
    await fs.writeFile(OUTPUT_PATH, createZipArchive(zipEntries));
    console.log(
      `Generated ${OUTPUT_PATH} (${pageIds.length} pages, ${Object.keys(colors).length} colors, ${Object.keys(typographies).length} typographies, ${Object.keys(components).length} components, ${mediaBuffers.size} media assets)`,
    );
  } finally {
    await browser?.close();
    if (devProcess?.pid) {
      try {
        process.kill(-devProcess.pid, "SIGTERM");
      } catch {
        devProcess.kill("SIGTERM");
      }
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
