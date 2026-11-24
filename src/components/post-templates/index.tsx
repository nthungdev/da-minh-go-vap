import type { Post } from "@/payload-types";
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
import TributeProfileView from "./tribute-profile-view";
import VerticalVideoPrayerView from "./vertical-video-prayer-view";

export type PostTemplateBlock = NonNullable<Post["template"]>[number];

interface PostTemplateRendererProps {
  block: PostTemplateBlock;
  isTitleHidden?: boolean;
}

export default function PostTemplateRenderer({
  block,
  isTitleHidden,
}: PostTemplateRendererProps) {
  switch (block.blockType) {
    case "gospelReflectionSplit":
      return (
        <GospelReflectionSplitView
          block={block}
          isTitleHidden={isTitleHidden}
        />
      );
    case "gospelReflectionCard":
      return (
        <GospelReflectionCardView block={block} isTitleHidden={isTitleHidden} />
      );
    case "saintBiography":
      return <SaintBiographyView block={block} isTitleHidden={isTitleHidden} />;
    case "verticalVideoPrayer":
      return <VerticalVideoPrayerView block={block} />;
    case "newsArticleFeatured":
      return <NewsArticleFeaturedView block={block} />;
    case "eventGalleryReport":
      return (
        <EventGalleryReportView block={block} isTitleHidden={isTitleHidden} />
      );
    case "catechismQASeries":
      return (
        <CatechismQASeriesView block={block} isTitleHidden={isTitleHidden} />
      );
    case "kidsBibleStory":
      return <KidsBibleStoryView block={block} isTitleHidden={isTitleHidden} />;
    case "parableLifeLesson":
      return <ParableLifeLessonView block={block} />;
    case "bilingualQuoteCard":
      return <BilingualQuoteCardView block={block} />;
    case "dominicanSpirituality":
      return (
        <DominicanSpiritualityView
          block={block}
          isTitleHidden={isTitleHidden}
        />
      );
    case "tributeProfile":
      return <TributeProfileView block={block} />;
    default:
      return null;
  }
}
