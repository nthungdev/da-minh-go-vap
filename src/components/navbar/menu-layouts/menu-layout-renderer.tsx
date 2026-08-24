import type { MenuItem } from "@/utils/menu";
import MenuLayoutGrid from "./menu-layout-grid";
import MenuLayoutPillars from "./menu-layout-pillars";
import MenuLayoutTabsPosts from "./menu-layout-tabs-posts";

interface MenuLayoutRendererProps {
  item: MenuItem;
  pathname: string;
}

export default function MenuLayoutRenderer({
  item,
  pathname,
}: MenuLayoutRendererProps) {
  switch (item.layout) {
    case "pillars":
      return <MenuLayoutPillars item={item} pathname={pathname} />;
    case "tabs-posts":
      return <MenuLayoutTabsPosts item={item} pathname={pathname} />;
    case "grid":
    default:
      return <MenuLayoutGrid item={item} pathname={pathname} />;
  }
}
