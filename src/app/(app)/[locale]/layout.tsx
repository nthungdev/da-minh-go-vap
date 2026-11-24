import localFont from "next/font/local";
import ReactQueryProvider from "@/components/providers/react-query-provider";
import ScrollToTopButton from "@/components/scroll-to-top-button";
import TheFooter from "@/components/the-footer";
import TheNavbar from "@/components/the-navbar";
import { locales } from "@/i18n/config";
import { applyRouteLocale, type LocaleParams } from "@/i18n/server";
import { getSiteSettings } from "@/payload/utils/site-settings-server";
import { cn } from "@/utils/common";
import { getServerOrigin } from "@/utils/url";
import "../globals.css";
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";

// Keep production builds independent of Google Fonts response formats.
const nunito = localFont({
  src: "../../fonts/nunito/Nunito-Variable.ttf",
  weight: "200 1000",
  variable: "--font-nunito",
  display: "swap",
});

// Serif faces used by the news article and bilingual quote post templates
const notoSerif = localFont({
  src: "../../fonts/noto-serif/NotoSerif-Variable.ttf",
  weight: "100 900",
  variable: "--next-font-noto-serif",
  display: "swap",
  preload: false,
});

const lora = localFont({
  src: [
    {
      path: "../../fonts/lora/Lora-Variable.ttf",
      weight: "400 700",
      style: "normal",
    },
    {
      path: "../../fonts/lora/Lora-Italic-Variable.ttf",
      weight: "400 700",
      style: "italic",
    },
  ],
  variable: "--next-font-lora",
  display: "swap",
  preload: false,
});

// ISR: rebuild cached pages at most every 60 s (see published-content-cache).
// Route segment config must be a literal.
export const revalidate = 60;
export const dynamicParams = true;

export function generateStaticParams(): LocaleParams[] {
  return locales.map((locale) => ({ locale }));
}

type LayoutProps = Readonly<{
  children: React.ReactNode;
  params: Promise<LocaleParams>;
}>;

export async function generateMetadata({
  params,
}: Pick<LayoutProps, "params">): Promise<Metadata> {
  const [{ locale }, siteSettings, origin] = await Promise.all([
    params,
    getSiteSettings(),
    getServerOrigin(),
  ]);
  const title = siteSettings.seo?.title || "Hội dòng Đa Minh Gò Vấp";

  return {
    title,
    description: siteSettings?.seo?.description,
    metadataBase: new URL(origin),
    openGraph: {
      type: "website",
      title,
      description: siteSettings?.seo?.description || undefined,
      siteName: siteSettings.siteName || undefined,
      locale: locale,
      images: [
        {
          url: "/og.png",
        },
      ],
    },
  };
}

export default async function RootLayout({ children, params }: LayoutProps) {
  const locale = applyRouteLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: "common" });

  return (
    <html
      lang={locale}
      className={cn(
        nunito.className,
        nunito.variable,
        notoSerif.variable,
        lora.variable,
      )}
    >
      <body
        className={cn("relative flex min-h-screen w-full flex-col bg-white")}
      >
        <NextIntlClientProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg focus:ring-2 focus:ring-white focus:outline-none"
          >
            {t("skipToContent")}
          </a>
          <ScrollToTopButton />
          <TheNavbar className="sticky top-0 z-50 w-full" />
          <div className="flex-1">
            <ReactQueryProvider>{children}</ReactQueryProvider>
          </div>
          <TheFooter />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
