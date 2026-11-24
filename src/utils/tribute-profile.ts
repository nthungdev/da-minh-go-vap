import type { TributeProfileBlock } from "@/payload-types";
import { toSafeHttpUrl } from "@/utils/safe-url";

/** Removes trailing colons and surrounding whitespace before the renderer adds its separator. */
export function normalizeFactLabel(label: string): string {
  return label.trimStart().replace(/[\s:：]+$/, "");
}

/** Returns nonblank sources with safe links and fallback IDs for rows without Payload IDs. */
export function resolveTributeSources(
  sources: TributeProfileBlock["sources"],
): Array<{ id: string; label: string; href: string | null }> {
  return (sources ?? []).flatMap((source, index) => {
    const label = source.label?.trim();
    if (!label) return [];

    return [
      {
        id: source.id ?? `source-${index}`,
        label,
        href: toSafeHttpUrl(source.url),
      },
    ];
  });
}

/** Uses the trimmed custom heading when present, or the supplied fallback. */
export function resolveBiographyHeading(
  customHeading: string | null | undefined,
  fallback: string,
): string {
  return customHeading?.trim() || fallback;
}
