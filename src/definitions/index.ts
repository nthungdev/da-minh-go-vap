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
  TabbedContentBlock,
  TabbedPostGroupBlock,
  TextBlock,
  TimelineBlock,
  VideoGridBlock,
} from "@/payload-types";

export type SiteAttributes = {
  logo: Image;
};

export type NavbarAttributes = {
  pageBanners: {
    path: string;
    banners: Image[];
  }[];
  bottomDecorativeGraphic: DynamicImage;
};

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

type DynamicImage = {
  urlDesktop: string;
  urlMobile: string;
  alt: string;
};

export type PostParams = Post & {
  slug: string;
};

export type PageHome = {
  banners: Image[];
  decorativeGraphic: Image;
  bibleVerses: {
    enable: boolean;
    verses: {
      verse: string;
      reference: string;
    }[];
  };
  latestPosts: {
    enable: boolean;
    limit: number;
  };
  newsByCategories: {
    enable: boolean;
    // limit: number // always shows 6 posts
    categories: {
      title: string;
      viewMoreButton: {
        enable: boolean;
        relativeUrl: string;
      };
      subCategories: {
        title: string;
        hiddenTags: string[];
      }[];
    }[];
  };
};

export type AsideSection = {
  slideshow: {
    enable: boolean;
    slides: Image[];
  };
  postGroups: {
    enable: boolean;
    groups: {
      title: string;
      limit: number;
      hiddenTags: string[];
    }[];
  };
  curatedPosts: {
    enable: boolean;
    title: string;
    /** post slugs */
    posts: string[];
  };
  links: {
    enable: boolean;
    title: string;
    links: {
      url: string;
      image: Image;
    }[];
  };
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
  | ImageSlideShowBlock;
