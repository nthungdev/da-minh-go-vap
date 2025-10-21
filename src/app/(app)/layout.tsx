import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { twMerge } from "tailwind-merge";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import TheFooter from "@/components/the-footer";
import TheMobileNavbar from "@/components/the-mobile-navbar";
import TheDesktopNavbar from "@/components/the-desktop-navbar";
import ReactQueryProvider from "@/components/providers/react-query-provider";
import PrelineScriptWrapper from "@/components/preline-script-wrapper";
import ScrollToTopButton from "@/components/scroll-to-top-button";
import { getMenu } from "@/utils/menu";
import { getLogo, getSiteSettings } from "@/payload/utils/site-settings-server";
import "./globals.css";

const nunito = Nunito({
  subsets: ["vietnamese"],
  variable: "--font-nunito",
});

export async function generateMetadata(): Promise<Metadata> {
  const siteSettings = await getSiteSettings();
  const title = siteSettings.seo?.title || "Hội dòng Đa Minh Gò Vấp";

  return {
    title,
    description: title,
    metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL!),
    openGraph: {
      type: "website",
      images: [
        {
          url: "/og.png",
        },
      ],
      title,
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
  const logo = await getLogo();

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
          <TheDesktopNavbar
            logo={logo}
            menu={menu}
            className="sticky top-0 z-20 hidden xl:flex"
          />

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
