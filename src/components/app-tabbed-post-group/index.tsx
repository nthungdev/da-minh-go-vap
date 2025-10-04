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
  return (
    <AppTabbedPostGroupGrid
      id={props.title?.replace(/\s+/g, "-").toLowerCase()}
      title={props.title}
      postGroups={props.groups}
    />
  );
}

export default AppTabbedPostGroup;
