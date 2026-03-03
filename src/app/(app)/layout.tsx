import PrelineScriptWrapper from "@/components/preline-script-wrapper";
import ReactQueryProvider from "@/components/providers/react-query-provider";
import ScrollToTopButton from "@/components/scroll-to-top-button";
import TheDesktopNavbar from "@/components/the-desktop-navbar";
import TheFooter from "@/components/the-footer";
import TheMobileNavbar from "@/components/the-mobile-navbar";
import { getSiteSettings } from "@/payload/utils/site-settings-server";
import { getMenu } from "@/utils/menu";
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import { Nunito } from "next/font/google";
import { twMerge } from "tailwind-merge";
import "./globals.css";

const nunito = Nunito({
  subsets: ["vietnamese"],
  variable: "--font-nunito",
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const siteSettings = await getSiteSettings();
  const title = siteSettings.seo?.title || "Hội dòng Đa Minh Gò Vấp";

  return {
    title,
    description: siteSettings?.seo?.description,
    metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL!),
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
  const menu = await getMenu(locale);

  return (
    <html lang={locale} className={twMerge(nunito.className)}>
      <PrelineScriptWrapper />
      <body
        className={twMerge(
          "relative flex min-h-screen w-full flex-col bg-white",
        )}
      >
        <NextIntlClientProvider>
          <ScrollToTopButton />
          <TheDesktopNavbar className="sticky top-0 z-20 hidden xl:flex" />

          {/* z-60 because backdrop from Preline is z-59 */}
          <TheMobileNavbar
            menu={menu}
            className="sticky top-0 z-60 xl:hidden"
          />
          <div className="flex-1">
            <ReactQueryProvider>{children}</ReactQueryProvider>
          </div>
          <TheFooter />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
