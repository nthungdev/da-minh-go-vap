import { Post } from "@/payload-types";
import BilingualQuoteCardView from "./bilingual-quote-card-view";
import CatechismQASeriesView from "./catechism-qa-series-view";
import DominicanSpiritualityView from "./dominican-spirituality-view";
import EventGalleryReportView from "./event-gallery-report-view";
import GospelReflectionCardView from "./gospel-reflection-card-view";
import GospelReflectionSplitView from "./gospel-reflection-split-view";
import KidsBibleStoryView from "./kids-bible-story-view";
import NewsArticleFeaturedView from "./news-article-featured-view";
import ParableLifeLessonView from "./parable-life-lesson-view";
import SaintBiographyView from "./saint-biography-view";
import VerticalVideoPrayerView from "./vertical-video-prayer-view";

export type PostTemplateBlock = NonNullable<Post["template"]>[number];

interface PostTemplateRendererProps {
  block: PostTemplateBlock;
}

export default function PostTemplateRenderer({
  block,
}: PostTemplateRendererProps) {
  switch (block.blockType) {
    case "gospelReflectionSplit":
      return <GospelReflectionSplitView block={block} />;
    case "gospelReflectionCard":
      return <GospelReflectionCardView block={block} />;
    case "saintBiography":
      return <SaintBiographyView block={block} />;
    case "verticalVideoPrayer":
      return <VerticalVideoPrayerView block={block} />;
    case "newsArticleFeatured":
      return <NewsArticleFeaturedView block={block} />;
    case "eventGalleryReport":
      return <EventGalleryReportView block={block} />;
    case "catechismQASeries":
      return <CatechismQASeriesView block={block} />;
    case "kidsBibleStory":
      return <KidsBibleStoryView block={block} />;
    case "parableLifeLesson":
      return <ParableLifeLessonView block={block} />;
    case "bilingualQuoteCard":
      return <BilingualQuoteCardView block={block} />;
    case "dominicanSpirituality":
      return <DominicanSpiritualityView block={block} />;
    default:
      return null;
  }
}
