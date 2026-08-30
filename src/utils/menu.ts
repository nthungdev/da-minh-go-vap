import { normalizeText } from "normalize-text";
import config from "@payload-config";
import { getPayload } from "payload";
import { HiddenTag, Media, NavBar, Page } from "@/payload-types";
import { defaultLocale, Locale } from "@/i18n/config";
import { cache } from "react";

export type MenuLayoutType = NonNullable<NavBar["menu"][number]["layout"]>;

export interface SubMenuItem {
  href: string;
  absoluteHref: string;
  name: string;
  normalizedName: string;
  icon?: string | null;
  description?: string | null;
  children?: SubMenuItem[];
}

export interface PillarItem {
  headerBanner: {
    title: string;
    subtitle?: string | null;
    image: Media | null;
    href: string;
    absoluteHref: string;
  };
  links: {
    name: string;
    href: string;
    absoluteHref: string;
    icon?: string | null;
  }[];
}

export interface BottomBarItem {
  label?: string | null;
  links: {
    name: string;
    href: string;
    absoluteHref: string;
    icon?: string | null;
  }[];
}

export interface CategoryPostItem {
  title: string;
  slug: string;
  href: string;
  thumbnail: Media | null;
  publishedAt?: string | null;
}

export interface CategoryTabItem {
  name: string;
  href: string;
  absoluteHref: string;
  tagIds: string[];
  icon?: string | null;
  posts?: CategoryPostItem[];
}

export interface MenuItem {
  href: string;
  absoluteHref: string;
  name?: string | null;
  normalizedName: string;
  icon?: string | null;
  layout?: MenuLayoutType;
  description?: string | null;
  children?: SubMenuItem[];
  pillars?: PillarItem[];
  bottomBar?: BottomBarItem;
  categories?: CategoryTabItem[];
}

function getLinkHref(
  item?: {
    linkType?: "none" | "internal" | "external";
    internalLink?: (string | null) | Page;
    externalLink?: string | null;
  } | null,
) {
  if (!item || item.linkType === "none") return "";
  if (item.linkType === "internal") {
    if (typeof item.internalLink === "object" && item.internalLink !== null) {
      return item.internalLink.path || "";
    }
    return "";
  }
  return item.externalLink || "";
}

export const getMenu = cache(async (locale?: Locale): Promise<MenuItem[]> => {
  const payload = await getPayload({ config });
  const navBar = await payload.findGlobal({ slug: "navBar", locale });

  const validMenuItems = (navBar.menu || []).filter((menuItem, index) => {
    const hasLabel = Boolean(menuItem.label && menuItem.label.trim());
    const hasIcon = Boolean(menuItem.icon);
    if (!hasLabel && !hasIcon) {
      console.warn(
        `[getMenu] Skipping menu item at index ${index} because it has neither a label nor an icon.`,
        menuItem,
      );
      return false;
    }
    return true;
  });

  const menu: MenuItem[] = await Promise.all(
    validMenuItems.map(async (menuItem, index) => {
      const layout: MenuLayoutType = menuItem.layout || "grid";

      // 1. Grid SubMenu
      const children: SubMenuItem[] | undefined = menuItem.subMenu?.map(
        (subMenuItem) => ({
          href: getLinkHref(subMenuItem),
          absoluteHref: getLinkHref(subMenuItem),
          name: subMenuItem.label,
          icon: typeof subMenuItem.icon === "string" ? subMenuItem.icon : null,
          description: subMenuItem.description,
          normalizedName: normalizeMenuName(subMenuItem.label),
          children: subMenuItem.subMenu?.map((subSubMenuItem) => ({
            href: getLinkHref(subSubMenuItem),
            absoluteHref: getLinkHref(subSubMenuItem),
            name: subSubMenuItem.label,
            icon:
              typeof subSubMenuItem.icon === "string"
                ? subSubMenuItem.icon
                : null,
            normalizedName: normalizeMenuName(subSubMenuItem.label),
          })),
        }),
      );

      // 2. Pillars
      const pillars: PillarItem[] | undefined = menuItem.pillars?.map(
        (pillar) => ({
          headerBanner: {
            title: pillar.headerBanner.title,
            subtitle: pillar.headerBanner.subtitle,
            image:
              typeof pillar.headerBanner.image === "object"
                ? (pillar.headerBanner.image as Media)
                : null,
            href: getLinkHref(pillar.headerBanner),
            absoluteHref: getLinkHref(pillar.headerBanner),
          },
          links:
            pillar.links?.map((link) => ({
              name: link.label,
              href: getLinkHref(link),
              absoluteHref: getLinkHref(link),
              icon: typeof link.icon === "string" ? link.icon : null,
            })) || [],
        }),
      );

      // Bottom bar for pillars
      const bottomBar: BottomBarItem | undefined = menuItem.bottomBar
        ? {
            label: menuItem.bottomBar.label,
            links:
              menuItem.bottomBar.links?.map((link) => ({
                name: link.label,
                href: getLinkHref(link),
                absoluteHref: getLinkHref(link),
                icon: typeof link.icon === "string" ? link.icon : null,
              })) || [],
          }
        : undefined;

      // 3. Tabs + Posts Categories
      const categories: CategoryTabItem[] | undefined = menuItem.categories
        ? await Promise.all(
            menuItem.categories.map(async (cat) => {
              const tagIds =
                cat.tags?.map((t: string | HiddenTag) =>
                  typeof t === "string" ? t : t.id,
                ) || [];

              // Fetch latest 8 posts for this category's tags
              let posts: CategoryPostItem[] = [];
              if (tagIds.length > 0) {
                try {
                  const postQuery = await payload.find({
                    collection: "posts",
                    where: {
                      and: [
                        { hiddenTags: { in: tagIds } },
                        {
                          publishedAt: {
                            less_than: new Date().toISOString(),
                          },
                        },
                      ],
                    },
                    limit: 8,
                    sort: "-publishedAt",
                    locale: locale ?? defaultLocale,
                  });

                  posts = postQuery.docs.map((p) => ({
                    title: p.title,
                    slug: p.slug,
                    href: `/${p.slug}`,
                    thumbnail:
                      typeof p.thumbnail === "object"
                        ? (p.thumbnail as Media)
                        : null,
                    publishedAt: p.publishedAt,
                  }));
                } catch {
                  posts = [];
                }
              }

              return {
                name: cat.label,
                href: getLinkHref(cat),
                absoluteHref: getLinkHref(cat),
                icon: typeof cat.icon === "string" ? cat.icon : null,
                tagIds,
                posts,
              };
            }),
          )
        : undefined;

      const name = menuItem.label || "";
      const icon = typeof menuItem.icon === "string" ? menuItem.icon : null;
      const normalizedName = normalizeMenuName(
        menuItem.label || icon || `menu-${index}`,
      );

      return {
        href: getLinkHref(menuItem),
        absoluteHref: getLinkHref(menuItem),
        name,
        normalizedName,
        icon,
        layout,
        children,
        pillars,
        bottomBar,
        categories,
      };
    }),
  );

  return menu;
});

function normalizeMenuName(name: string) {
  return normalizeText(name).replaceAll(" ", "-");
}
