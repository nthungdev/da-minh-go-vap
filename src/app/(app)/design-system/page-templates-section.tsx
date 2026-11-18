import AppPostCard from "@/components/app-post-card";
import AppSectionHeader from "@/components/app-section-header";
import AppTimelineCards from "@/components/app-timeline-cards";
import TheBibleVerse from "@/components/the-bible-verse";
import { Button } from "@/components/ui/button";
import { MOCK_POSTS, MOCK_TIMELINE_CARDS } from "./mock-data";

export default function PageTemplatesSection() {
  return (
    <section
      id="page-templates"
      data-penpot-page="04 Page Templates"
      className="space-y-10"
    >
      <div className="border-b border-gray-200 pb-4">
        <span className="text-primary-700 text-xs font-semibold tracking-wider uppercase">
          04 Page Templates
        </span>
        <h2 className="mt-1 text-2xl font-bold text-gray-900">
          Key Page Layouts (Mock Data)
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Responsive templates captured across Desktop (1440px), Tablet (768px),
          and Mobile (375px).
        </p>
      </div>

      {/* Frame 1: Home Page */}
      <div
        data-penpot-frame="Home Page"
        className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs"
      >
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
          <h3 className="text-sm font-semibold text-gray-800">
            Template: Home Page
          </h3>
        </div>
        <div className="space-y-8 p-6">
          <div className="bg-primary-800 rounded-lg px-8 py-12 text-center text-white">
            <h4 className="text-2xl font-bold">Hội dòng Đa Minh Gò Vấp</h4>
            <p className="mt-2 text-sm text-white/85">
              Chiêm niệm và trao truyền — Đồng hành cùng cộng đoàn dân Chúa
            </p>
          </div>
          <TheBibleVerse
            verses={[
              {
                verse:
                  "Chính anh em là ánh sáng cho trần gian. Một thành xây trên núi không tài nào che giấu được.",
                reference: "Mt 5,14",
              },
            ]}
          />
          <div className="space-y-4">
            <AppSectionHeader>
              <span className="text-base font-bold uppercase">
                Tin tức mới nhất
              </span>
            </AppSectionHeader>
            <div className="grid gap-4 md:grid-cols-2">
              {MOCK_POSTS.slice(0, 4).map((post) => (
                <div
                  key={post.id}
                  className="h-32 rounded-lg border border-gray-100 p-2"
                >
                  <AppPostCard post={post} showDate />
                </div>
              ))}
            </div>
          </div>
          <AppTimelineCards
            title="Dòng thời gian"
            cards={MOCK_TIMELINE_CARDS}
          />
        </div>
      </div>

      {/* Frame 2: Post Detail */}
      <div
        data-penpot-frame="Post Detail"
        className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs"
      >
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
          <h3 className="text-sm font-semibold text-gray-800">
            Template: Post Detail
          </h3>
        </div>
        <article className="mx-auto max-w-3xl space-y-6 p-6">
          <div className="space-y-2">
            <span className="bg-primary-50 text-primary-800 inline-block rounded-full px-3 py-1 text-xs font-semibold">
              Tin tức Hội dòng
            </span>
            <h4 className="font-noto-serif text-2xl font-bold text-gray-900">
              {MOCK_POSTS[0]!.title}
            </h4>
            <p className="text-xs text-gray-500">
              Ngày đăng: 15/10/2026 · Ban Truyền Thông
            </p>
          </div>
          <div className="font-noto-serif space-y-4 text-base leading-relaxed text-gray-700">
            <p>
              Sáng ngày 15/10/2026, trong bầu khí trang nghiêm và sốt sắng, cộng
              đoàn Tu viện Đa Minh Gò Vấp đã cử hành Thánh lễ Tạ ơn khánh thành
              Nhà Nguyện mới với sự hiện diện của quý Cha, quý Tu sĩ và đông đảo
              giáo dân.
            </p>
            <p>
              Công trình là hoa trái của tinh thần hiệp thông và cầu nguyện, góp
              phần phục vụ đời sống phụng vụ và sinh hoạt mục vụ tại địa phương.
            </p>
          </div>
        </article>
      </div>

      {/* Frame 3: Posts Archive */}
      <div
        data-penpot-frame="Posts Archive"
        className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs"
      >
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
          <h3 className="text-sm font-semibold text-gray-800">
            Template: Posts Archive
          </h3>
        </div>
        <div className="space-y-6 p-6">
          <AppSectionHeader>
            <span className="text-base font-bold uppercase">
              Lưu trữ bài viết
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
          <div className="flex items-center justify-center gap-2 pt-2">
            <Button variant="outline" size="sm">
              Trước
            </Button>
            <Button variant="default" size="sm">
              1
            </Button>
            <Button variant="outline" size="sm">
              2
            </Button>
            <Button variant="outline" size="sm">
              Sau
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
