type Post = {
  title: string
  date: Date,
  videos: {
    title: string
    thumbnail: string
    youtubeUrl: string
  }[]
  hiddenTags: string[]
  thumbnail: string,
  body: string
}

type TextTab = {
  type: 'textTab'
  title: string
  body: string
}

type DynamicImageTab = {
  type: 'dynamicImageTab'
  title: string
  image: {
    urlDesktop: string
    urlMobile: string
    alt: string
  }
}

type PostSection = {
  type: 'postSection'
  title: string
  limit: number
  hiddenTags: string[]
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

type Image = {
  url: string
  alt: string
}

type PostParams = Post & {
  slug: string
}

// Reuse page types
type PostsPage = {
  title: string
  hiddenTags: string[]
}

type CategoriesPage = {
  title: string
  categories: {
    title: string
    hiddenTags: string[]
  }[]
}
// END Reuse page types

type PageHome = {
  banners: Image[]
  decorativeGraphic: Image
  bibleVerses: {
    enable: boolean
    verses: {
      verse: string
      reference: string
    }[]
  }
  latestNews: {
    enable: boolean
    limit: number
  }
  newsByCategories: {
    enable: boolean
    limit: number
    categories: {
      title: string
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
    videos: {
      title: string
      thumbnail: string
      youtubeUrl: string
    }[]
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
    videos: {
      title: string
      videos: {
        title: string
        thumbnail: string
        youtubeUrl: string
      }[]
    }
  }
  communityHistory: {
    title: string
    subCategories: {
      title: string
      hiddenTags: string[]
    }[]
  }
}

type PageCongregationEstablishment = PostsPage

type PageCongregationAuthorities = PostsPage

type PageSpirituality = CategoriesPage

type PageSpiritualityCharism = {
  title: string
  banners: {
    url: string
    alt: string
  }[]
  quote: string
  categories: {
    title: string
    thumbnail: {
      url: string
      alt: string
    }
    hiddenTags: string[]
  }[]
}

type PageSpiritualitySaintDominic = {
  title: string
  banners: Image[]
  hiddenTags: string[]
}

type PageSpiritualitySaints = PostsPage

type PageMissions = {
  title: string
  sections: (PostSection | PostByCategorySection)[]
}
type PageMissionsEvangelization = PostsPage
type PageMissionsPastoralCare = PostsPage
type PageMissionsSocialActivities = CategoriesPage
type PageMissionsEducation = CategoriesPage

type PagePrayer = {
  title: string
  sections: PostSection[]
}
type PagePrayerMorning = PostsPage
type PagePrayerEvening = PostsPage
type PagePrayerMeditation = PostsPage

type PageVocationIntroduction = {
  title: string
  tabSections: (DynamicImageTab | TextTab)[]
  sections: {
    title: string
    thumbnail: {
      url: string
      alt: string
    }
    hiddenTags: string[]
  }[]
}
type PageVocationMystery = PostsPage

type PageNews = {
  title: string
  sections: PostSection[]
}
type PageNewsCongregation = PostsPage
type PageNewsDominicanFamily = PostsPage
type PageNewsChurch = PostsPage
type PageNewsVietnamChurch = PostsPage

type PageTopics = {
  title: string
  sections: PostSection[]
}

type SettingsFooter = {
  name: string
  address: string
  phone: string
  email: string,
  marketingEmail: string
  externalLinks: {
    name: string
    url: string
  }[]
}

type PageContact = {
  title: string
  graphic: Image
  contacts: {
    type: string
    label: string
    value: string
  }[]
  map: {
    address: string
  }
}

type AsideSection = {
  postGroups: {
    enable: boolean
    groups: {
      title: string
      limit: number
      subGroups: {
        title: string
        limit: number
        hiddenTags: string[]
      }[]
    }[]
  }
  curatedPosts: {
    enable: boolean
    title: string
    /** post slugs */
    posts: string[]
  }
  socialLinks: {
    enable: boolean
    title: string
    links: {
      type: string
      name: string
      url: string
    }[]
  }
}
