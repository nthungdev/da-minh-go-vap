import AppGridHeader from "@/components/app-grid-header";
import AppPostGridSix from "@/components/app-post-grid-five";
import AppPostTabGridAsync from "@/components/app-post-tab-grid-async";
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
    <div className="space-y-4">
      {props.title && <AppGridHeader text={props.title} />}
      <AppPostTabGridAsync
        postGroups={props.groups}
        component={AppPostGridSix}
      />
    </div>
  );
}

export default AppTabbedPostGroup;
