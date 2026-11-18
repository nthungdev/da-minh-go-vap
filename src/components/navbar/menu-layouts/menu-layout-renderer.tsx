import type { MenuItem } from "@/utils/menu";
import type { MenuCategoryPosts } from "@/utils/menu-category-posts";
import MenuLayoutGrid from "./menu-layout-grid";
import MenuLayoutPillars from "./menu-layout-pillars";
import MenuLayoutTabsPosts from "./menu-layout-tabs-posts";

interface MenuLayoutRendererProps {
  item: MenuItem;
  pathname: string;
  categoryPostsPromise: Promise<MenuCategoryPosts>;
}

export default function MenuLayoutRenderer({
  item,
  pathname,
  categoryPostsPromise,
}: MenuLayoutRendererProps) {
  switch (item.layout) {
    case "pillars":
      return <MenuLayoutPillars item={item} pathname={pathname} />;
    case "tabs-posts":
      return (
        <MenuLayoutTabsPosts
          item={item}
          pathname={pathname}
          categoryPostsPromise={categoryPostsPromise}
        />
      );
    case "grid":
    default:
      return <MenuLayoutGrid item={item} pathname={pathname} />;
  }
}
