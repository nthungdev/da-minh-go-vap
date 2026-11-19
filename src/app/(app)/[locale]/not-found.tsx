import AppPage from "@/components/app-page";
import NotFoundContent from "./not-found-content";

export default function NotFound() {
  return (
    <AppPage className="flex flex-1 flex-col items-center justify-center">
      <NotFoundContent />
    </AppPage>
  );
}
