import PrelineScriptWrapper from "@/components/preline-script-wrapper";
import ReactQueryProvider from "@/components/providers/react-query-provider";
import ScrollToTopButton from "@/components/scroll-to-top-button";
import { NextIntlClientProvider } from "next-intl";
import localFont from "next/font/local";
import { twMerge } from "tailwind-merge";
import "../globals.css";

const nunito = localFont({
  src: "../../fonts/nunito/Nunito-Variable.ttf",
  weight: "200 1000",
  variable: "--font-nunito",
  display: "swap",
});

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

export default function DesignSystemLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
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
          <div className="flex-1">
            <ReactQueryProvider>{children}</ReactQueryProvider>
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
