import { getLogo } from "@/payload/utils/site-settings-server";
import { getMenu } from "@/utils/menu";
import { getLocale } from "next-intl/server";
import { twMerge } from "tailwind-merge";
import TheNavbarClient from "./the-navbar-client";
import { Locale } from "@/i18n/config";

export default async function TheNavbar(
  props: React.HTMLAttributes<HTMLElement>,
) {
  const locale = await getLocale();
  const [menu, logo] = await Promise.all([
    getMenu(locale as Locale),
    getLogo(),
  ]);

  return (
    <header
      className={twMerge(
        "bg-primary-700/90 sticky top-0 z-50 w-full text-gray-50 shadow-sm",
        props.className,
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <TheNavbarClient menu={menu} logo={logo} />
      </div>
    </header>
  );
}
