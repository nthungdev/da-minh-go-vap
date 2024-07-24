import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NavBar from "../components/the-nav-bar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Đa Minh Gò Vấp",
  description: "Hội dòng Đa Minh Gò Vấp",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`bg-gray-50 ${inter.className}`}>
        <NavBar />
        {children}
      </body>
    </html>
  );
}
