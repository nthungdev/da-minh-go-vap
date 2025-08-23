import AppPage from "@/components/app-page";
import { Spinner } from "flowbite-react";

export default function Loading() {
  return (
    <AppPage>
      <div className="flex flex-row justify-center">
        <Spinner className="text-primary-1 h-12 w-12 text-center" />
      </div>
    </AppPage>
  );
}
