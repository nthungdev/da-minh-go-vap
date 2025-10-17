import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { twMerge } from "tailwind-merge";
import { NextIntlClientProvider } from "next-intl";
import TheFooter from "@/components/the-footer";
import TheMobileNavbar from "@/components/the-mobile-navbar";
import TheDesktopNavbar from "@/components/the-desktop-navbar";
import ReactQueryProvider from "@/components/providers/react-query-provider";
import PrelineScriptWrapper from "@/components/preline-script-wrapper";
import ScrollToTopButton from "@/components/scroll-to-top-button";
import { getMenu } from "@/utils/menu";
import { getLogo } from "@/utils/site-settings-server";
import { getLocale } from "next-intl/server";
import "./globals.css";
// import LoadAnalytics from "@/components/load-analytics";

const nunito = Nunito({
  subsets: ["vietnamese"],
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: "Đa Minh Gò Vấp",
  description: "Hội dòng Đa Minh Gò Vấp",
};

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
      {/* <LoadAnalytics /> */}
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
