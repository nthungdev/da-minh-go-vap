import type {
  AccordionContentBlock,
  BibleVerseBlock,
  DynamicImageBlock,
  ImageBlock,
  ImageSlideShowBlock,
  LatestPostGridBlock,
  LinksBlock,
  MapBlock,
  Post,
  PostGroupBlock,
  QuoteBlock,
  SpaceBlock,
  SpotifyPodcastList,
  TabbedContentBlock,
  TabbedPostGroupBlock,
  TextBlock,
  TimelineBlock,
  VideoGridBlock,
} from "@/payload-types";
export type AppAccordionItem = {
  title: string;
  body?: string;
  items?: {
    title: string;
    body?: string;
    items?: AppAccordionItem[];
  }[];
};

export type AppPost = Omit<Post, "publishedAt" | "createdAt" | "updatedAt"> & {
  publishedAt: Date;
  updatedAt: Date;
  createdAt: Date;
};

export type Image = {
  alt: string;
  url: string;
};

export type PostParams = Post & {
  slug: string;
};

export type BlockType =
  | AccordionContentBlock
  | BibleVerseBlock
  | DynamicImageBlock
  | ImageBlock
  | LatestPostGridBlock
  | LinksBlock
  | MapBlock
  | PostGroupBlock
  | TabbedContentBlock
  | TabbedPostGroupBlock
  | TextBlock
  | TimelineBlock
  | VideoGridBlock
  | SpaceBlock
  | QuoteBlock
  | ImageSlideShowBlock
  | SpotifyPodcastList;
