import PrelineScriptWrapper from "@/components/preline-script-wrapper";
import ReactQueryProvider from "@/components/providers/react-query-provider";
import ScrollToTopButton from "@/components/scroll-to-top-button";
import TheNavbar from "@/components/the-navbar";
import TheFooter from "@/components/the-footer";
import { getSiteSettings } from "@/payload/utils/site-settings-server";
import { getLocale } from "next-intl/server";
import { Nunito } from "next/font/google";
import { twMerge } from "tailwind-merge";
import "./globals.css";
import { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";

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
