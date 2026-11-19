import { getLocale } from "next-intl/server";
import type { Locale } from "@/i18n/config";
import { getLogo } from "@/payload/utils/site-settings-server";
import { cn } from "@/utils/common";
import { getMenu } from "@/utils/menu";
import { getMenuCategoryPosts } from "@/utils/menu-category-posts";
import TheNavbarClient from "./the-navbar-client";

export default async function TheNavbar(
  props: React.HTMLAttributes<HTMLElement>,
) {
  const locale = await getLocale();
  // Not awaited: mega-menu posts stream to the client after the navbar shell.
  const categoryPostsPromise = getMenuCategoryPosts(locale as Locale);
  const [menu, logo] = await Promise.all([
    getMenu(locale as Locale),
    getLogo(),
  ]);

  return (
    <header
      className={cn(
        "bg-primary-800/95 sticky top-0 z-50 w-full text-gray-50 shadow-sm",
        props.className,
      )}
    >
      <div className="mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:justify-center lg:px-8">
        <TheNavbarClient
          menu={menu}
          logo={logo}
          categoryPostsPromise={categoryPostsPromise}
        />
      </div>
    </header>
  );
}
