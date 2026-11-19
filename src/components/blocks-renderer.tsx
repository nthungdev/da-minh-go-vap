import { Suspense } from "react";
import BlockRenderer from "@/components/block-renderer";
import PostGroupSkeleton from "@/components/post-group-skeleton";
import { BlockType } from "@/definitions";
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

const BlocksRenderer = ({ blocks }: { blocks: BlockType[] }) => {
  return (
    <div>
      {blocks.map((block, index) =>
        shouldStreamBlock(block.blockType, index) ? (
          <Suspense key={index} fallback={<BlockFallback block={block} />}>
            <BlockRenderer block={block} />
          </Suspense>
        ) : (
          <BlockRenderer block={block} key={index} />
        ),
      )}
    </div>
  );
};

export default BlocksRenderer;
