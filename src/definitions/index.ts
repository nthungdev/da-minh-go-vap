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
} from '@/payload-types'

export type SiteAttributes = {
  logo: Image
}

export type NavbarAttributes = {
  pageBanners: {
    path: string
    banners: Image[]
  }[]
  bottomDecorativeGraphic: DynamicImage
}

export type AppAccordionItem = {
  title: string
  body?: string
  items?: {
    title: string
    body?: string
    items?: AppAccordionItem[]
  }[]
}

export type AppPost = Omit<Post, 'publishedAt' | 'createdAt' | 'updatedAt'> & {
  publishedAt: Date
  updatedAt: Date
  createdAt: Date
}

type PostByCategorySection = {
  type: 'postByCategorySection'
  title: string
  limit: number
  categories: {
    title: string
    hiddenTags: string[]
  }[]
}

type Video = {
  title: string
  // thumbnail: string
  url: string
  type: 'facebook' | 'youtube'
}

export type Image = {
  alt: string
  url: string
}

type DynamicImage = {
  urlDesktop: string
  urlMobile: string
  alt: string
}

export type PostParams = Post & {
  slug: string
}

// Reuse page types
type PostsPage = {
  title: string
  hiddenTags: string[]
}

type GroupedPostsPage = {
  title: string
  postGroups: {
    title: string
    limit?: number
    hiddenTags: string[]
  }[]
}
// END Reuse page types

export type PageHome = {
  banners: Image[]
  decorativeGraphic: Image
  bibleVerses: {
    enable: boolean
    verses: {
      verse: string
      reference: string
    }[]
  }
  latestPosts: {
    enable: boolean
    limit: number
  }
  newsByCategories: {
    enable: boolean
    // limit: number // always shows 6 posts
    categories: {
      title: string
      viewMoreButton: {
        enable: boolean
        relativeUrl: string
      }
      subCategories: {
        title: string
        hiddenTags: string[]
      }[]
    }[]
  }
}

type AboutUsSection = {
  banner: {
    url: string
    alt: string
  }
  title: string
  body: string
  tabs: {
    title: string
    body: string
  }[]
  videos: {
    title: string
    videos: Video[]
  }
}

type MissionSection = AboutUsSection

type WhereaboutsSection = {
  banner: Image
  title: string
  body: string
  countries: {
    name: string
    body: string
  }[]
}

type PageCongregation = {
  title: string
  subCategories: {
    title: string
    hiddenTags: string[]
  }[]
}

type PageCongregationAbout = {
  aboutUs: AboutUsSection
  mission: MissionSection
  whereabouts: WhereaboutsSection
}

type PageCongregationHistory = {
  developmentHistory: {
    title: string
    body: string
    timeline: {
      title: string
      body: string
    }[]
    accordion: AppAccordionItem[]
    videos: {
      title: string
      videos: Video[]
    }
  }
  communityHistory: {
    title: string
    postGroups: {
      title: string
      limit: number
      hiddenTags: string[]
    }[]
  }
}

export type AsideSection = {
  slideshow: {
    enable: boolean
    slides: Image[]
  }
  postGroups: {
    enable: boolean
    groups: {
      title: string
      limit: number
      hiddenTags: string[]
    }[]
  }
  curatedPosts: {
    enable: boolean
    title: string
    /** post slugs */
    posts: string[]
  }
  links: {
    enable: boolean
    title: string
    links: {
      url: string
      image: Image
    }[]
  }
}

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
