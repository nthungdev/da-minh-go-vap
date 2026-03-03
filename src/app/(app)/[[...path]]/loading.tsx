import AppPage from "@/components/app-page";
import Spinner from "@/components/spinner";

export default async function Page() {
  return (
    <AppPage className="p-4">
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    </AppPage>
  );
}
