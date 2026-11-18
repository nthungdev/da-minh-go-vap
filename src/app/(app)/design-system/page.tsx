import { Metadata } from "next";
import CmsBlocksSection from "./cms-blocks-section";
import FoundationsSection from "./foundations-section";
import PageTemplatesSection from "./page-templates-section";
import UiComponentsSection from "./ui-components-section";

export const metadata: Metadata = {
  title: "Design System | Hội dòng Đa Minh Gò Vấp",
  description:
    "Live design system showcase and Penpot DOM extraction target for Hội dòng Đa Minh Gò Vấp.",
  robots: {
    index: false,
    follow: false,
  },
};

const NAV_ITEMS = [
  { href: "#foundations", label: "01 Foundations" },
  { href: "#ui-components", label: "02 UI Components" },
  { href: "#cms-blocks", label: "03 CMS Blocks" },
  { href: "#page-templates", label: "04 Page Templates" },
];

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur-xs">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              Đa Minh Gò Vấp — Design System
            </h1>
            <p className="text-xs text-gray-500">
              DB-free showcase &amp; Penpot extraction target
            </p>
          </div>
          <nav className="flex flex-wrap gap-2">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="hover:bg-primary-50 hover:text-primary-800 rounded-md px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-16 px-4 py-10 sm:px-6 lg:px-8">
        <FoundationsSection />
        <UiComponentsSection />
        <CmsBlocksSection />
        <PageTemplatesSection />
      </main>
    </div>
  );
}
