type Home = {
  banners: {
    url: string
    altText: string
  }[]
  bibleVerses: {
    verse: string
    reference: string
  }[]
  latestNews: {
    enable: boolean
    limit: number
  }
  newsByCategories: {
    enable: boolean
    limit: number
    categories: {
      title: string
      hiddenTags: string[]
    }[]
  }
}

type AboutUsSection = {
  banner?: string
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
  banner?: string
  title: string
  body: string
  countries: {
    name: string
    body: string
  }[]
}

type CongregationAbout = {
  aboutUs: AboutUsSection
  mission: MissionSection
  whereabouts: WhereaboutsSection
}

type CongregationHistory = {
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
  }
}

type CongregationEstablishment = {
  posts: string[]
}

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