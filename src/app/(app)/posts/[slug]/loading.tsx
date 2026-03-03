import RefreshRouteOnSave from "@/components/refresh-route-on-save";
import AppPage from "@/components/app-page";

export default async function Page() {
  return (
    <AppPage className="animate-pulse space-y-4">
      <RefreshRouteOnSave />

      <div className="mx-auto h-[450px] max-w-[800px] bg-gray-300"></div>

      <div className="h-4 bg-gray-300"></div>

      <div className="h-4 bg-gray-300"></div>

      <div className="h-4 bg-gray-300"></div>

      <div className="h-10 bg-gray-300"></div>

      <div className="h-20 bg-gray-300"></div>
    </AppPage>
  );
}
