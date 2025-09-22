import { normalizeText } from "normalize-text";
import config from "@payload-config";
import { getPayload } from "payload";
import { NavBar } from "@/payload-types";
import { Locale } from "@/i18n/config";

export interface MenuItem {
  href: string;
  absoluteHref: string;
  name: string;
  normalizedName: string;
  children?: MenuItem[];
}

function getMenuItemLink(menuItem: NavBar["menu"][number]) {
  if (menuItem.linkType === "internal") {
    if (typeof menuItem.internalLink !== "string") {
      return menuItem.internalLink?.path;
    } else {
      return undefined;
    }
  } else {
    return menuItem.externalLink;
  }
}

export async function getMenu(locale?: Locale) {
  const payload = await getPayload({ config });
  const navBar = await payload.findGlobal({ slug: "navBar", locale });
  const menu: MenuItem[] = navBar.menu.map((menuItem) => ({
    href: getMenuItemLink(menuItem) || "",
    absoluteHref: getMenuItemLink(menuItem) || "",
    name: menuItem.label,
    normalizedName: normalizeMenuName(menuItem.label),
    children: menuItem.subMenu?.map((subMenuItem) => ({
      href: getMenuItemLink(subMenuItem) || "",
      absoluteHref: getMenuItemLink(subMenuItem) || "",
      name: subMenuItem.label,
      normalizedName: normalizeMenuName(subMenuItem.label),
      children: subMenuItem.subMenu?.map((subSubMenuItem) => ({
        href: getMenuItemLink(subSubMenuItem) || "",
        absoluteHref: getMenuItemLink(subSubMenuItem) || "",
        name: subSubMenuItem.label,
        normalizedName: normalizeMenuName(subSubMenuItem.label),
      })),
    })),
  }));
  return menu;
}

function normalizeMenuName(name: string) {
  return normalizeText(name).replaceAll(" ", "-");
}
