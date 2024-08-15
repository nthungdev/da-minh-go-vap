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

type PostParams = Post & {
  slug: string
}

type PageHome = {
  banners: {
    url: string
    alt: string
  }[]
  decorativeGraphic: {
    url: string
    alt: string
  }
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
  banner: {
    url: string
    alt: string
  }
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

type PageCongregationEstablishment = {
  title: string
  hiddenTags: string[]
}

type PageCongregationAuthorities = {
  title: string
  hiddenTags: string[]
}

type PageSpirituality = {
  subCategories: {
    title: string
    hiddenTags: string[]
  }[]
}

type PageSpiritualitySaints = {
  title: string
  hiddenTags: string[]
}

