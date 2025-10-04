import AppTabbedPostGroupGrid from "@/components/app-tabbed-post-group/grid";
import { Page } from "@/payload-types";

interface AppTabbedPostGroupProps {
  title?: string;
  groups: {
    title: string;
    hiddenTags: string[];
    limit: number;
    viewMoreButton?: {
      enable: boolean;
      relativeUrl: Page | string | undefined | null;
    };
  }[];
}

async function AppTabbedPostGroup(props: AppTabbedPostGroupProps) {
  const id = (props.title ?? Math.random().toString())
    .replace(/\s+/g, "-")
    .toLowerCase();
  return (
    <AppTabbedPostGroupGrid
      id={id}
      title={props.title}
      postGroups={props.groups}
    />
  );
}

export default AppTabbedPostGroup;
