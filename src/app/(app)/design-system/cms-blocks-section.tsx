import { AppAccordionDefault } from "@/components/app-accordion";
import AppCardTabs from "@/components/app-card-tabs";
import AppMarkdown from "@/components/app-markdown";
import AppQuote from "@/components/app-quote";
import AppSpace from "@/components/app-space";
import AppTimelineCards from "@/components/app-timeline-cards";
import ImageLinkList from "@/components/image-link-list";
import ImageSlideshow from "@/components/image-slideshow";
import PostGroup from "@/components/post-group";
import PostGroupTabs from "@/components/post-group-tabs";
import SpotifyPodcastList from "@/components/spotify-podcast-list";
import TheBibleVerse from "@/components/the-bible-verse";
import TheLatestPosts from "@/components/the-latest-posts";
import VideoGrid from "@/components/video-grid";
import {
  MOCK_LINKS,
  MOCK_MEDIA_SLIDES,
  MOCK_PODCAST_EPISODES,
  MOCK_POSTS,
  MOCK_POST_GROUPS,
  MOCK_TIMELINE_CARDS,
  MOCK_VIDEOS,
} from "./mock-data";

export default function CmsBlocksSection() {
  return (
    <section
      id="cms-blocks"
      data-penpot-page="03 CMS Blocks"
      className="space-y-10"
    >
      <div className="border-b border-gray-200 pb-4">
        <span className="text-primary-700 text-xs font-semibold tracking-wider uppercase">
          03 CMS Blocks
        </span>
        <h2 className="mt-1 text-2xl font-bold text-gray-900">
          Payload CMS Blocks (Mock Data)
        </h2>
      </div>

      {/* Frame 1: Bible Verse & Quote Block */}
      <div
        data-penpot-frame="Bible Verse & Quote Block"
        className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-xs"
      >
        <h3 className="text-lg font-semibold text-gray-900">
          Bible Verse &amp; Quote Block
        </h3>
        <TheBibleVerse
          verses={[
            {
              verse:
                "Chính anh em là ánh sáng cho trần gian. Một thành xây trên núi không tài nào che giấu được.",
              reference: "Mt 5,14",
            },
          ]}
        />
        <AppQuote quote="Chiêm niệm và trao truyền cho tha nhân những điều mình đã chiêm niệm. — Thánh Tôma Aquinô" />
      </div>

      {/* Frame 2: Timeline Block */}
      <div
        data-penpot-frame="Timeline Block"
        className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-xs"
      >
        <h3 className="text-lg font-semibold text-gray-900">Timeline Block</h3>
        <AppTimelineCards title="Dòng thời gian" cards={MOCK_TIMELINE_CARDS} />
      </div>

      {/* Frame 3: Latest Post Grid Block */}
      <div
        data-penpot-frame="Latest Post Grid Block"
        className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-xs"
      >
        <h3 className="text-lg font-semibold text-gray-900">
          Latest Post Grid Block
        </h3>
        <TheLatestPosts postCount={4} initialPosts={MOCK_POSTS} />
      </div>

      {/* Frame 4: Post Group Block (Grid & List) */}
      <div
        data-penpot-frame="Post Group Block"
        className="space-y-8 rounded-xl border border-gray-200 bg-white p-6 shadow-xs"
      >
        <h3 className="text-lg font-semibold text-gray-900">
          Post Group Block (Grid &amp; List)
        </h3>
        <PostGroup
          title="Bài viết nổi bật"
          hiddenTags={["tin-tuc"]}
          limit={4}
          type="grid"
          initialPosts={MOCK_POSTS}
          hasMore={false}
        />
        <PostGroup
          title="Thông báo gần đây"
          hiddenTags={["thong-bao"]}
          limit={3}
          type="list"
          initialPosts={MOCK_POSTS.slice(0, 3)}
        />
      </div>

      {/* Frame 5: Tabbed Post Group & Tabbed Content Block */}
      <div
        data-penpot-frame="Tabbed Blocks"
        className="space-y-8 rounded-xl border border-gray-200 bg-white p-6 shadow-xs"
      >
        <h3 className="text-lg font-semibold text-gray-900">
          Tabbed Post Group &amp; Tabbed Content Blocks
        </h3>
        <PostGroupTabs
          title="Chuyên mục"
          groups={MOCK_POST_GROUPS}
          initialPosts={MOCK_POSTS}
        />
        <AppCardTabs
          tabs={[
            {
              title: "Sứ vụ",
              body: (
                <AppMarkdown>
                  Rao giảng Lời Chúa qua đời sống chiêm niệm, học tập và mục vụ
                  giáo xứ.
                </AppMarkdown>
              ),
            },
            {
              title: "Lịch phụng vụ",
              body: (
                <AppMarkdown>
                  Thánh lễ hằng ngày lúc 05:00 và 17:30 tại Nhà nguyện Tu viện.
                </AppMarkdown>
              ),
            },
          ]}
        />
      </div>

      {/* Frame 6: Accordion Block */}
      <div
        data-penpot-frame="Accordion Block"
        className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-xs"
      >
        <h3 className="text-lg font-semibold text-gray-900">
          Accordion Content Block
        </h3>
        <AppAccordionDefault
          id="ds-cms-accordion"
          items={[
            {
              title: "Lịch sử hình thành Tu viện",
              body: (
                <AppMarkdown>
                  Tu viện Đa Minh Gò Vấp được thành lập từ năm 1968, là nơi đào
                  tạo và sinh hoạt mục vụ của anh em Đa Minh.
                </AppMarkdown>
              ),
            },
            {
              title: "Các hoạt động mục vụ chính",
              body: (
                <AppMarkdown>
                  - Cử hành Thánh lễ và các bí tích hằng ngày. - Đồng hành cùng
                  giới trẻ và các hội đoàn. - Công tác bác ái và truyền thông
                  Công giáo.
                </AppMarkdown>
              ),
            },
          ]}
        />
      </div>

      {/* Frame 7: Markdown Text & Space Block */}
      <div
        data-penpot-frame="Markdown Text & Space Block"
        className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-xs"
      >
        <h3 className="text-lg font-semibold text-gray-900">
          Markdown Text &amp; Space Block
        </h3>
        <AppMarkdown>
          {`### Linh đạo Đa Minh\n\nĐời sống Đa Minh được xây dựng trên bốn cột trụ: **Cầu nguyện**, **Học hành**, **Đời sống chung** và **Rao giảng**.`}
        </AppMarkdown>
        <div className="rounded-md border border-dashed border-gray-300 bg-gray-50 px-3 py-1 text-xs text-gray-500">
          SpaceBlock (size: 2rem)
          <AppSpace size={2} />
        </div>
      </div>

      {/* Frame 8: Image Slideshow & Links Block */}
      <div
        data-penpot-frame="Image Slideshow & Links Block"
        className="grid gap-6 rounded-xl border border-gray-200 bg-white p-6 shadow-xs lg:grid-cols-2"
      >
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Image Slideshow Block
          </h3>
          <div className="max-w-xs">
            <ImageSlideshow id="ds-cms-slideshow" slides={MOCK_MEDIA_SLIDES} />
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Links Block</h3>
          <ImageLinkList title="Liên kết hữu ích" links={MOCK_LINKS} />
        </div>
      </div>

      {/* Frame 9: Video Grid & Spotify Podcast List */}
      <div
        data-penpot-frame="Video Grid & Podcast Block"
        className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-xs"
      >
        <h3 className="text-lg font-semibold text-gray-900">
          Video Grid &amp; Spotify Podcast List Blocks
        </h3>
        <VideoGrid title="Video mục vụ" videos={MOCK_VIDEOS} className="my-0" />
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-700">
            Spotify Podcast List Block
          </h4>
          <SpotifyPodcastList episodes={MOCK_PODCAST_EPISODES} pageSize={5} />
        </div>
      </div>

      {/* Frame 10: Unimplemented CMS Block Placeholders */}
      <div
        data-penpot-frame="Unimplemented Block Placeholders"
        className="space-y-3 rounded-xl border border-dashed border-gray-300 bg-white p-6 shadow-xs"
      >
        <h3 className="text-lg font-semibold text-gray-900">
          Placeholder Blocks (NotImplementedBlock in BlockRenderer)
        </h3>
        <div className="grid gap-3 text-xs text-gray-600 sm:grid-cols-3">
          <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
            <div className="font-semibold text-gray-800">dynamicImageBlock</div>
            <div className="mt-1">Placeholder — Not Implemented</div>
          </div>
          <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
            <div className="font-semibold text-gray-800">imageBlock</div>
            <div className="mt-1">Placeholder — Not Implemented</div>
          </div>
          <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
            <div className="font-semibold text-gray-800">mapBlock</div>
            <div className="mt-1">Placeholder — Not Implemented</div>
          </div>
        </div>
      </div>
    </section>
  );
}
