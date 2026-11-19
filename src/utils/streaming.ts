/**
 * Blocks at an index below this render eagerly in every page section so
 * above-the-fold content is never replaced by a skeleton.
 */
export const EAGER_BLOCK_COUNT = 1;

const STREAMED_BLOCK_TYPES: ReadonlySet<string> = new Set(["postGroupBlock"]);

/**
 * Whether a block should render inside its own `<Suspense>` boundary so the
 * page shell can flush before the block's data query resolves.
 */
export function shouldStreamBlock(
  blockType: string,
  index: number,
  eagerCount: number = EAGER_BLOCK_COUNT,
): boolean {
  return index >= eagerCount && STREAMED_BLOCK_TYPES.has(blockType);
}

/**
 * Stable lookup key for the posts of a mega-menu category, derived from its
 * tag IDs so server and client agree without relying on menu item order.
 */
export function getCategoryPostsKey(tagIds: readonly string[]): string {
  return [...new Set(tagIds)].sort().join(",");
}
