type Home = {
  title: string
  cats: string
}

type AboutUsSection = {
  banner: string
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
      youtubeUrl: string
    }[]
  }
}

type MissionSection = AboutUsSection

type WhereaboutsSection = {
  banner: string
  title: string
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
