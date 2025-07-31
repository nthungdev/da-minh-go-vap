import type { Metadata } from "next";
import { Montserrat, Nunito } from "next/font/google";
import { twMerge } from "tailwind-merge";
import { ThemeInit } from "../../../.flowbite-react/init";
import ThePrelineScript from "@/components/the-preline-script";
import TheFooter from "@/components/the-footer";
import TheMobileNavbar from "@/components/the-mobile-navbar";
import TheDesktopNavbar from "@/components/the-desktop-navbar";
import ReactQueryProvider from "@/components/providers/react-query-provider";
import { getMenu } from "@/utils/menu";
import { getLogo } from "@/utils/siteSettings";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["vietnamese"],
  variable: "--font-montserrat",
});

const nunito = Nunito({
  subsets: ["vietnamese"],
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: "Đa Minh Gò Vấp",
  description: "Hội dòng Đa Minh Gò Vấp",
};

const language = "vi";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const menu = await getMenu();
  const logo = await getLogo();

  return (
    <html
      lang={language}
      className={twMerge(nunito.className, montserrat.className)}
    >
      <ThePrelineScript />
      <ThemeInit />

      <body
        className={twMerge(
          "relative flex min-h-screen w-full flex-col bg-white",
        )}
      >
        <TheDesktopNavbar
          logo={logo}
          menu={menu}
          className="sticky top-0 z-20 hidden xl:flex"
        />
        {/* z-60 because backdrop from Preline is z-59 */}
        <TheMobileNavbar menu={menu} className="sticky top-0 z-60 xl:hidden" />

        <ReactQueryProvider>
          <div className="flex-1">{children}</div>
        </ReactQueryProvider>

        <TheFooter />
      </body>
    </html>
  );
}
