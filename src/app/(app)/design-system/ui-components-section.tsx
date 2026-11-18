import { AppAccordionDefault } from "@/components/app-accordion";
import AppCardTabs from "@/components/app-card-tabs";
import AppPostCard from "@/components/app-post-card";
import AppPostListItem from "@/components/app-post-list-item";
import AppQuote from "@/components/app-quote";
import AppSectionHeader from "@/components/app-section-header";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { MOCK_POSTS } from "./mock-data";

export default function UiComponentsSection() {
  return (
    <section
      id="ui-components"
      data-penpot-page="02 UI Components"
      className="space-y-10"
    >
      <div className="border-b border-gray-200 pb-4">
        <span className="text-primary-700 text-xs font-semibold tracking-wider uppercase">
          02 UI Components
        </span>
        <h2 className="mt-1 text-2xl font-bold text-gray-900">
          Core UI Primitives &amp; Site Components
        </h2>
      </div>

      {/* Frame 1: Buttons & Badges */}
      <div
        data-penpot-frame="Buttons & Badges"
        className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-xs"
      >
        <h3 className="text-lg font-semibold text-gray-900">
          Buttons &amp; Badges
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="default">Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="bg-primary-50 text-primary-800 rounded-full px-3 py-1 text-xs font-semibold">
            Tin tức
          </span>
          <span className="bg-chill-1 text-chill-900 rounded-full px-3 py-1 text-xs font-semibold">
            Suy niệm
          </span>
          <span className="bg-light-apricot-100 text-light-apricot-800 rounded-full px-3 py-1 text-xs font-semibold">
            Thông báo
          </span>
          <span className="bg-keppel-100 text-keppel-800 rounded-full px-3 py-1 text-xs font-semibold">
            Mục vụ
          </span>
        </div>
      </div>

      {/* Frame 2: Inputs & Select */}
      <div
        data-penpot-frame="Inputs & Select"
        className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-xs"
      >
        <h3 className="text-lg font-semibold text-gray-900">
          Inputs &amp; Select
        </h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1.5">
            <label
              htmlFor="ds-text-input"
              className="block text-sm font-medium text-gray-700"
            >
              Tiêu đề bài viết
            </label>
            <input
              id="ds-text-input"
              type="text"
              placeholder="Nhập từ khóa..."
              className="focus:border-primary-500 focus:ring-primary-500 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-1 focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="ds-search-input"
              className="block text-sm font-medium text-gray-700"
            >
              Tìm kiếm
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-gray-400" />
              <input
                id="ds-search-input"
                type="search"
                placeholder="Tìm bài viết, tài liệu..."
                className="focus:border-primary-500 focus:ring-primary-500 w-full rounded-md border border-gray-300 py-2 pr-3 pl-9 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-1 focus:outline-none"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="ds-select"
              className="block text-sm font-medium text-gray-700"
            >
              Chuyên mục
            </label>
            <select
              id="ds-select"
              defaultValue="news"
              className="focus:border-primary-500 focus:ring-primary-500 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:ring-1 focus:outline-none"
            >
              <option value="news">Tin tức Hội dòng</option>
              <option value="gospel">Suy niệm Tin Mừng</option>
              <option value="vocation">Ơn gọi Đa Minh</option>
            </select>
          </div>
        </div>
      </div>

      {/* Frame 3: Accordion & Tabs */}
      <div
        data-penpot-frame="Accordion & Tabs"
        className="grid gap-6 rounded-xl border border-gray-200 bg-white p-6 shadow-xs lg:grid-cols-2"
      >
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Accordion</h3>
          <AppAccordionDefault
            id="ds-accordion"
            items={[
              {
                title: "Sứ vụ của Hội dòng Đa Minh Gò Vấp là gì?",
                body: (
                  <p className="text-sm text-gray-700">
                    Chiêm niệm và trao truyền hoa trái của chiêm niệm qua rao
                    giảng Lời Chúa, giáo dục và bác ái xã hội.
                  </p>
                ),
              },
              {
                title: "Làm thế nào để tìm hiểu Ơn gọi?",
                body: (
                  <p className="text-sm text-gray-700">
                    Các bạn trẻ có thể liên hệ Ban Ơn gọi tại Tu viện Gò Vấp vào
                    các ngày Chúa Nhật đầu tháng.
                  </p>
                ),
              },
            ]}
          />
        </div>
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Card Tabs</h3>
          <AppCardTabs
            tabs={[
              {
                title: "Giới thiệu",
                body: (
                  <p className="text-sm text-gray-700">
                    Cộng đoàn Đa Minh Gò Vấp được thành lập năm 1968, gắn bó với
                    đời sống phụng vụ và mục vụ giáo xứ.
                  </p>
                ),
              },
              {
                title: "Giờ lễ",
                body: (
                  <p className="text-sm text-gray-700">
                    Ngày thường: 05:00 &amp; 17:30. Chúa Nhật: 05:00, 07:00,
                    09:00, 17:30.
                  </p>
                ),
              },
            ]}
          />
        </div>
      </div>

      {/* Frame 4: Cards & List Items */}
      <div
        data-penpot-frame="Cards & List Items"
        className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-xs"
      >
        <h3 className="text-lg font-semibold text-gray-900">
          Cards, List Items, Section Header &amp; Quote
        </h3>
        <AppSectionHeader>
          <span className="text-base font-bold tracking-wide uppercase">
            Tin tức mới nhất
          </span>
        </AppSectionHeader>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-32 rounded-lg border border-gray-100 p-2">
            <AppPostCard post={MOCK_POSTS[0]!} showDate />
          </div>
          <div className="h-28 rounded-lg border border-gray-100 p-2">
            <AppPostListItem post={MOCK_POSTS[1]!} />
          </div>
        </div>
        <AppQuote quote="Hãy nói với Chúa hoặc nói về Chúa. — Thánh Đa Minh" />
      </div>

      {/* Frame 5: Modals & Forms */}
      <div
        data-penpot-frame="Modals & Forms"
        className="grid gap-6 rounded-xl border border-gray-200 bg-white p-6 shadow-xs lg:grid-cols-2"
      >
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Form Layout (Static Preview)
          </h3>
          <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="space-y-1">
              <label
                htmlFor="ds-form-email"
                className="block text-sm font-medium text-gray-700"
              >
                Email liên hệ
              </label>
              <input
                id="ds-form-email"
                type="email"
                placeholder="banmucvu@daminhgovap.org"
                className="focus:border-primary-500 focus:ring-primary-500 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:ring-1 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label
                htmlFor="ds-form-message"
                className="block text-sm font-medium text-gray-700"
              >
                Nội dung
              </label>
              <textarea
                id="ds-form-message"
                rows={3}
                placeholder="Nhập lời nhắn hoặc ý cầu nguyện..."
                className="focus:border-primary-500 focus:ring-primary-500 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:ring-1 focus:outline-none"
              />
            </div>
            <div className="flex justify-end">
              <Button variant="default" size="sm">
                Gửi thông tin
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Modal / Dialog (Static Preview)
          </h3>
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-lg">
            <div className="flex items-start justify-between border-b border-gray-100 pb-3">
              <div>
                <h4 className="text-base font-bold text-gray-900">
                  Xác nhận đăng ký Tĩnh tâm
                </h4>
                <p className="mt-0.5 text-xs text-gray-500">
                  Tu viện Đa Minh Gò Vấp · Mùa Vọng 2026
                </p>
              </div>
              <span className="rounded-md px-2 py-1 text-xs font-semibold text-gray-500">
                ✕
              </span>
            </div>
            <p className="mt-3 text-sm text-gray-700">
              Thông tin đăng ký của bạn sẽ được gửi đến Ban Mục vụ Giới trẻ để
              sắp xếp lịch tham dự.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" size="sm">
                Hủy
              </Button>
              <Button variant="default" size="sm">
                Xác nhận
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Frame 6: Header & Footer */}
      <div
        data-penpot-frame="Header & Footer"
        className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-xs"
      >
        <h3 className="text-lg font-semibold text-gray-900">
          Header &amp; Footer (Static Preview)
        </h3>
        <div className="bg-primary-800 flex h-16 items-center justify-between rounded-lg px-6 text-gray-50 shadow-sm">
          <span className="font-bold tracking-wide">ĐA MINH GÒ VẤP</span>
          <nav className="hidden gap-6 text-sm font-medium md:flex">
            <span>Trang chủ</span>
            <span>Giới thiệu</span>
            <span>Tin tức</span>
            <span>Suy niệm</span>
            <span>Liên hệ</span>
          </nav>
        </div>
        <div className="bg-primary rounded-lg p-6 text-sm text-white">
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <div className="font-bold">Tu viện Đa Minh Gò Vấp</div>
              <p className="mt-1 text-white/80">
                190 Lê Đức Thọ, P.16, Q. Gò Vấp, TP.HCM
              </p>
            </div>
            <div>
              <div className="font-bold">Liên kết</div>
              <ul className="mt-1 space-y-1 text-white/80">
                <li>Tỉnh dòng Đa Minh Việt Nam</li>
                <li>Học viện Đa Minh</li>
              </ul>
            </div>
            <div>
              <div className="font-bold">Liên hệ</div>
              <p className="mt-1 text-white/80">vanphong@daminhgovap.org</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
