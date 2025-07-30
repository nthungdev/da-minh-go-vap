"use client";

import AppBanners from "@/components/app-banners";
import { Media } from "@/payload-types";
import { usePathname } from "next/navigation";
import { twMerge } from "tailwind-merge";

interface AppPageProps {
  className?: string;
  children: React.ReactNode;
  banners?: Media[];
}

export default function AppPage({
  children,
  className,
  banners,
  ...props
}: AppPageProps) {
  const pathname = usePathname();

  return (
    <main className="w-full" {...props}>
      {!!banners?.length && <AppBanners banners={banners} />}
      <div
        className={twMerge(
          "mx-auto w-full max-w-(--breakpoint-xl) px-4 py-8",
          pathname !== "/" && "pt-16",
          className,
        )}
      >
        {children}
      </div>
    </main>
  );
}
