import { AppAccordionDefault } from "@/components/app-accordion";
import AppMarkdown from "@/components/app-markdown";
import AppPostCard from "@/components/app-post-card";
import AppQuote from "@/components/app-quote";
import AppSectionHeader from "@/components/app-section-header";
import AppTimelineCards from "@/components/app-timeline-cards";
import TheBibleVerse from "@/components/the-bible-verse";
import { MOCK_POSTS, MOCK_TIMELINE_CARDS } from "./mock-data";

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

      {/* Frame 3: Post Grid Block */}
      <div
        data-penpot-frame="Post Grid Block"
        className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-xs"
      >
        <h3 className="text-lg font-semibold text-gray-900">Post Grid Block</h3>
        <AppSectionHeader>
          <span className="text-base font-bold tracking-wide uppercase">
            Bài viết nổi bật
          </span>
        </AppSectionHeader>
        <div className="grid gap-4 md:grid-cols-2">
          {MOCK_POSTS.map((post) => (
            <div
              key={post.id}
              className="h-32 rounded-lg border border-gray-100 p-2"
            >
              <AppPostCard post={post} showDate />
            </div>
          ))}
        </div>
      </div>

      {/* Frame 4: Accordion Block */}
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

      {/* Frame 5: Markdown Text Block */}
      <div
        data-penpot-frame="Markdown Text Block"
        className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-xs"
      >
        <h3 className="text-lg font-semibold text-gray-900">
          Markdown Text Block
        </h3>
        <AppMarkdown>
          {`### Linh đạo Đa Minh\n\nĐời sống Đa Minh được xây dựng trên bốn cột trụ: **Cầu nguyện**, **Học hành**, **Đời sống chung** và **Rao giảng**.`}
        </AppMarkdown>
      </div>
    </section>
  );
}
