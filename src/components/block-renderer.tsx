import { AppAccordionDefault } from "@/components/app-accordion";
import AppCardTabs from "@/components/app-card-tabs";
import AppMarkdown from "@/components/app-markdown";
import AppQuote from "@/components/app-quote";
import AppSpace from "@/components/app-space";
import PostGroupTabs from "@/components/post-group-tabs";
import AppTimelineCards from "@/components/app-timeline-cards";
import ImageLinkList from "@/components/image-link-list";
import ImageSlideshow from "@/components/image-slideshow";
import PostGroup from "@/components/post-group";
import TheBibleVerse from "@/components/the-bible-verse";
import TheLatestPosts from "@/components/the-latest-posts";
import SpotifyPodcastList from "@/components/spotify-podcast-list";
import VideoGrid from "@/components/video-grid";
import { BlockType } from "@/definitions";
import { createRandomAlphaString } from "@/utils/common";
import { getLocale } from "next-intl/server";
import { Locale } from "@/i18n/config";
import { fetchAllPosts, fetchPostsByHiddenTags } from "@/actions/post";

function NotImplementedBlock() {
  return <div>Not Implemented</div>;
}

type BlockTypeMap = {
  [K in BlockType as K["blockType"]]: React.ComponentType<never>;
};

const componentsMap = {
  accordionContentBlock: AppAccordionDefault,
  bibleVerseBlock: TheBibleVerse,
  imageSlideshowBlock: ImageSlideshow,
  latestPostGridBlock: TheLatestPosts,
  linksBlock: ImageLinkList,
  postGroupBlock: PostGroup,
  spaceBlock: AppSpace,
  tabbedContentBlock: AppCardTabs,
  tabbedPostGroupBlock: PostGroupTabs,
  textBlock: AppMarkdown,
  timelineBlock: AppTimelineCards,
  quoteBlock: AppQuote,
  // TODO
  dynamicImageBlock: NotImplementedBlock,
  imageBlock: NotImplementedBlock,
  mapBlock: NotImplementedBlock,
  videoGridBlock: VideoGrid,
  spotifyPodcastList: SpotifyPodcastList,
} satisfies BlockTypeMap;

type BlockToPropsMap = {
  [K in BlockType["blockType"]]: (
    block: Extract<BlockType, { blockType: K }>,
  ) =>
    | React.ComponentProps<(typeof componentsMap)[K]>
    | Promise<React.ComponentProps<(typeof componentsMap)[K]>>;
};

const mapBlockToProps: BlockToPropsMap = {
  accordionContentBlock: (block) => ({
    id: createRandomAlphaString(4),
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
    id: createRandomAlphaString(4),
    slides: block.images?.filter((image) => typeof image !== "string") || [],
  }),
  latestPostGridBlock: async (block) => {
    const locale = (await getLocale()) as Locale;
    const postCount =
      block.postCount === "4" ? 4 : block.postCount === "5" ? 5 : undefined;
    const initialPosts = await fetchAllPosts({ limit: postCount, locale });
    return {
      postCount,
      initialPosts,
    };
  },
  linksBlock: (block) => ({
    title: block.title,
    links: block.links,
  }),
  mapBlock: () => ({}),
  postGroupBlock: async (block) => {
    const locale = (await getLocale()) as Locale;
    const hiddenTags = block.hiddenTags
      .filter((tag) => typeof tag !== "string")
      .map((tag) => tag.tag);
    const limit = block.limit || 4;
    const query = await fetchPostsByHiddenTags(hiddenTags, {
      limit,
      locale,
    });
    return {
      title: block.title,
      limit,
      hasMore: block.viewMoreButton.enableViewMoreButton,
      hidePostTitles: block.hidePostTitles,
      hiddenTags,
      type: block.displayType,
      posts: query.posts,
      initialPosts: query.posts,
    };
  },
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
  tabbedPostGroupBlock: async (block) => {
    const locale = (await getLocale()) as Locale;
    const groups =
      block.tabs?.map((tab) => ({
        title: tab.title,
        hiddenTags: tab.hiddenTags
          .filter((t) => typeof t !== "string")
          .map((t) => t.tag),
        limit: tab.limit,
        viewMoreButton: {
          enable: tab.viewMoreButton.enableViewMoreButton,
          relativeUrl: tab.viewMoreButton.relativeUrl,
        },
      })) ?? [];

    const allUniqueHiddenTags = Array.from(
      new Set(groups.flatMap((group) => group.hiddenTags)),
    );

    let initialPosts = undefined;
    if (allUniqueHiddenTags.length > 0) {
      const query = await fetchPostsByHiddenTags(allUniqueHiddenTags, {
        limit: 6,
        locale,
      });
      initialPosts = query.posts;
    }

    return {
      title: block.title || undefined,
      viewMoreButton: {
        enable: block.viewMoreButton.enableViewMoreButton,
        relativeUrl: block.viewMoreButton.relativeUrl,
      },
      groups,
      initialPosts,
    };
  },
  textBlock: (block) => ({
    children: block.content,
  }),
  timelineBlock: (block) => ({
    title: block.title,
    cards: block.items.map((item) => ({
      title: item.title,
      description: item.description || undefined,
      thumbnail: item.thumbnail,
      url: typeof item.link !== "string" ? item.link?.path : undefined,
    })),
  }),
  videoGridBlock: (block) => ({
    videos: block.videos,
  }),
  spotifyPodcastList: (block) => ({
    pageSize: block.pageSize || undefined,
  }),
};

const BlockRenderer = async ({ block }: { block: BlockType }) => {
  const Component = componentsMap[block.blockType];
  if (!Component) return null;
  const propsMapper = mapBlockToProps[block.blockType];
  const props = await propsMapper(block as never);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  return <Component {...props} />;
};

export default BlockRenderer;
