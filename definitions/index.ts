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
  quotes: {
    enable: boolean
    title: string
    quotes: {
      quote: string
      reference: string
    }[]
  }
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