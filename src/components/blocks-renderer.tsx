import { Suspense } from "react";
import BlockRenderer from "@/components/block-renderer";
import PostGroupSkeleton from "@/components/post-group-skeleton";
import type { BlockType } from "@/definitions";
import { shouldStreamBlock } from "@/utils/streaming";

function BlockFallback({ block }: { block: BlockType }) {
  if (block.blockType !== "postGroupBlock") return null;
  return (
    <PostGroupSkeleton
      type={block.displayType}
      limit={block.limit || 4}
      title={block.title}
      hidePostTitles={block.hidePostTitles}
    />
  );
}

function getBlockKey(block: BlockType, index: number): string {
  return block.id ?? `${block.blockType}-${index}`;
}

const BlocksRenderer = ({ blocks }: { blocks: BlockType[] }) => {
  return (
    <div>
      {blocks.map((block, index) => {
        const key = getBlockKey(block, index);
        return shouldStreamBlock(block.blockType, index) ? (
          <Suspense key={key} fallback={<BlockFallback block={block} />}>
            <BlockRenderer block={block} />
          </Suspense>
        ) : (
          <BlockRenderer block={block} key={key} />
        );
      })}
    </div>
  );
};

export default BlocksRenderer;
