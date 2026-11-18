import PrelineScriptWrapper from "@/components/preline-script-wrapper";
import ReactQueryProvider from "@/components/providers/react-query-provider";
import ScrollToTopButton from "@/components/scroll-to-top-button";
import TheNavbar from "@/components/the-navbar";
import TheFooter from "@/components/the-footer";
import { getSiteSettings } from "@/payload/utils/site-settings-server";
import { getServerOrigin } from "@/utils/url";
import { getLocale } from "next-intl/server";
import localFont from "next/font/local";
import { twMerge } from "tailwind-merge";
import "./globals.css";
import { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";

// Keep production builds independent of Google Fonts response formats.
const nunito = localFont({
  src: "../fonts/nunito/Nunito-Variable.ttf",
  weight: "200 1000",
  variable: "--font-nunito",
  display: "swap",
});

// Serif faces used by the news article and bilingual quote post templates
const notoSerif = localFont({
  src: "../fonts/noto-serif/NotoSerif-Variable.ttf",
  weight: "100 900",
  variable: "--next-font-noto-serif",
  display: "swap",
  preload: false,
});

const lora = localFont({
  src: [
    {
      path: "../fonts/lora/Lora-Variable.ttf",
      weight: "400 700",
      style: "normal",
    },
    {
      path: "../fonts/lora/Lora-Italic-Variable.ttf",
      weight: "400 700",
      style: "italic",
    },
  ],
  variable: "--next-font-lora",
  display: "swap",
  preload: false,
});

export async function generateMetadata(): Promise<Metadata> {
  const [locale, siteSettings, origin] = await Promise.all([
    getLocale(),
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      className={twMerge(nunito.className, notoSerif.variable, lora.variable)}
    >
      <PrelineScriptWrapper />
      <body
        className={twMerge(
          "relative flex min-h-screen w-full flex-col bg-white",
        )}
      >
        <NextIntlClientProvider>
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
