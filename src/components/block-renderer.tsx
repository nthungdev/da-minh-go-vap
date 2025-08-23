import { AppAccordionDefault } from "@/components/app-accordion";
import AppCardTabs from "@/components/app-card-tabs";
import AppMarkdown from "@/components/app-markdown";
import AppQuote from "@/components/app-quote";
import AppSpace from "@/components/app-space";
import AppTabbedPostGroup from "@/components/app-tabbed-post-group";
import AppTimelineCards from "@/components/app-timeline-cards";
import ImageSlideshow from "@/components/image-slideshow";
import PostGroup from "@/components/post-group";
import TheBibleVerse from "@/components/the-bible-verse";
import TheLatestPosts from "@/components/the-latest-posts";
import { BlockType } from "@/definitions";

function NotImplementedBlock() {
  return <div>Not Implemented</div>;
}

type BlockTypeMap = {
  [K in BlockType as K["blockType"]]: React.ComponentType<never>;
};

const componentsMap = {
  accordionContentBlock: AppAccordionDefault,
  bibleVerseBlock: TheBibleVerse,
  latestPostGridBlock: TheLatestPosts,
  postGroupBlock: PostGroup,
  spaceBlock: AppSpace,
  tabbedContentBlock: AppCardTabs,
  tabbedPostGroupBlock: AppTabbedPostGroup,
  textBlock: AppMarkdown,
  timelineBlock: AppTimelineCards,
  quoteBlock: AppQuote,
  imageSlideshowBlock: ImageSlideshow,
  // TODO
  dynamicImageBlock: NotImplementedBlock,
  imageBlock: NotImplementedBlock,
  linksBlock: NotImplementedBlock,
  mapBlock: NotImplementedBlock,
  videoGridBlock: NotImplementedBlock,
} satisfies BlockTypeMap;

type BlockToPropsMap = {
  [K in BlockType["blockType"]]: (
    block: Extract<BlockType, { blockType: K }>,
  ) => React.ComponentProps<(typeof componentsMap)[K]>;
};

const mapBlockToProps: BlockToPropsMap = {
  accordionContentBlock: (block) => ({
    items: block.items.map((item) => ({
      title: item.title,
      body: item.content,
      items: item.children?.map((subItem) => ({
        title: subItem.title,
        body: subItem.content,
        items: subItem.children?.map((subSubItem) => ({
          title: subSubItem.title,
          body: subSubItem.content,
        })),
      })),
    })),
  }),
  bibleVerseBlock: (block) => ({
    verses: [
      {
        verse: block.verse as string,
        reference: block.reference as string,
      },
    ],
  }),
  dynamicImageBlock: () => ({}),
  imageBlock: () => ({}),
  imageSlideshowBlock: (block) => ({
    slides: block.images?.filter((image) => typeof image !== "string") || [],
  }),
  latestPostGridBlock: () => ({}),
  linksBlock: () => ({}),
  mapBlock: () => ({}),
  postGroupBlock: (block) => ({
    title: block.title,
    limit: block.limit || 4,
    hasMore: block.viewMoreButton.enableViewMoreButton,
    hiddenTags: block.hiddenTags
      .filter((tag) => typeof tag !== "string")
      .map((tag) => tag.tag),
    type: block.displayType,
  }),
  quoteBlock: (block) => ({
    quote: block.content,
  }),
  spaceBlock: (block) => ({
    size: block.size,
  }),
  tabbedContentBlock: (block) => ({
    tabs: block.tabs.map((t) => ({
      title: t.title,
      body: t.content,
    })),
  }),
  tabbedPostGroupBlock: (block) => ({
    title: block.title || undefined,
    groups:
      block.tabs?.map((tab) => ({
        title: tab.title,
        hiddenTags: tab.hiddenTags
          .filter((t) => typeof t !== "string")
          .map((t) => t.tag),
      })) ?? [],
  }),
  textBlock: (block) => ({
    children: block.content,
  }),
  timelineBlock: (block) => ({
    title: block.title,
    cards: block.items.map((item) => ({
      title: item.title,
      thumbnail: item.thumbnail,
      url: typeof item.link !== "string" ? item.link?.path : undefined,
    })),
  }),
  videoGridBlock: () => ({}),
} as const;

const BlockRenderer = ({ block }: { block: BlockType }) => {
  const Component = componentsMap[block.blockType];
  if (!Component) return null;
  const propsMapper = mapBlockToProps[block.blockType];
  const props = propsMapper(block as never);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  return <Component {...props} />;
};

export default BlockRenderer;
