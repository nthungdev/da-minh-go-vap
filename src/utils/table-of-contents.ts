export interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

export interface HeadingElementLike {
  tagName: string;
  textContent: string | null;
  id: string;
  classList?: {
    add: (...tokens: string[]) => void;
  };
}

export interface ExtractHeadingsOptions {
  /** Tailwind scroll-margin class applied to target headings to clear the sticky header. */
  scrollMarginClass?: string;
}

/**
 * Converts a heading string into a deterministic, Vietnamese-diacritic-safe URL anchor slug.
 *
 * @param text - Raw heading text extracted from the DOM.
 * @returns Normalized ASCII kebab-case slug, falling back to `"section"` when empty.
 */
export function slugifyHeading(text: string): string {
  const normalized = text
    .trim()
    .toLowerCase()
    .replace(/đ/g, "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .trim()
    .replace(/[\s-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "section";
}

/**
 * Extracts `h2` and `h3` items from heading elements, assigning deterministic unique `id`s
 * (disambiguating duplicates with `-2`, `-3`, etc.) and applying a scroll-margin class.
 *
 * @param elements - Ordered heading elements from the article body container.
 * @param options - Optional extraction configuration.
 * @returns Ordered table of contents items.
 */
export function extractHeadingsFromElements(
  elements: Iterable<HeadingElementLike>,
  options: ExtractHeadingsOptions = {},
): TocItem[] {
  const { scrollMarginClass = "scroll-mt-20" } = options;

  const validHeadings: Array<{
    element: HeadingElementLike;
    text: string;
    level: 2 | 3;
  }> = [];

  for (const element of elements) {
    const tag = element.tagName.toUpperCase();
    if (tag !== "H2" && tag !== "H3") continue;

    const text = element.textContent?.trim() ?? "";
    if (!text) continue;

    validHeadings.push({
      element,
      text,
      level: tag === "H2" ? 2 : 3,
    });
  }

  // Reserve pre-existing IDs first so generated slugs never collide with later headings.
  const reservedIds = new Set<string>();
  for (const { element } of validHeadings) {
    const existingId = element.id.trim();
    if (existingId) {
      reservedIds.add(existingId);
    }
  }

  const assignedIds = new Set<string>();
  const items: TocItem[] = [];

  for (const { element, text, level } of validHeadings) {
    const existingId = element.id.trim();
    let finalId: string;

    if (existingId && !assignedIds.has(existingId)) {
      finalId = existingId;
    } else {
      const baseSlug = existingId || slugifyHeading(text);
      let candidate = baseSlug;
      let suffix = 2;

      while (
        assignedIds.has(candidate) ||
        (candidate !== existingId && reservedIds.has(candidate))
      ) {
        candidate = `${baseSlug}-${suffix}`;
        suffix += 1;
      }

      finalId = candidate;
      element.id = finalId;
    }

    assignedIds.add(finalId);

    if (scrollMarginClass) {
      element.classList?.add(scrollMarginClass);
    }

    items.push({ id: finalId, text, level });
  }

  return items;
}

/**
 * Extracts `h2` and `h3` headings strictly from the given article body container element.
 *
 * @param container - The DOM element wrapping the rendered post body.
 * @param options - Optional extraction configuration.
 * @returns Ordered table of contents items.
 */
export function extractTableOfContents(
  container: ParentNode,
  options?: ExtractHeadingsOptions,
): TocItem[] {
  const headingElements = container.querySelectorAll("h2, h3");
  return extractHeadingsFromElements(headingElements, options);
}
