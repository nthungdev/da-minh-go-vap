import { HTMLAttributes } from "react";
import { getPayload } from "payload";
import Image from "next/image";
import config from "@payload-config";
import { Media } from "@/payload-types";
import { getDataOrUndefined } from "@/payload/utils/data";
import AppBanners from "@/components/app-banners";
import AppPageContent from "@/components/app-page/app-page-content";

interface AppPageProps extends HTMLAttributes<HTMLDivElement> {
  banners?: Media[];
  showDecorativeGraphic?: boolean;
}

export default async function AppPage({
  children,
  className,
  banners,
  ...props
}: AppPageProps) {
  const payload = await getPayload({ config: config });
  const navBar = await payload.findGlobal({ slug: "navBar" });

  const hasBanners = !!banners?.length;
  const imageMobileUrl = getDataOrUndefined(
    navBar.bottomDecorativeGraphic?.imageMobile,
  )?.url;
  const imageDesktopUrl = getDataOrUndefined(
    navBar.bottomDecorativeGraphic?.imageDesktop,
  )?.url;
  const shouldShowDecorativeGraphic =
    hasBanners && !!(imageMobileUrl || imageDesktopUrl);

  return (
    <div className="w-full" {...props}>
      {!!banners?.length && <AppBanners banners={banners} />}

      {shouldShowDecorativeGraphic && (
        <div className="relative">
          <picture className="absolute right-0 bottom-px left-0 z-10 block w-full">
            {imageMobileUrl && (
              <source media="(max-width: 799px)" srcSet={imageMobileUrl} />
            )}

            {imageDesktopUrl && (
              <source media="(min-width: 800px)" srcSet={imageDesktopUrl} />
            )}

            {imageMobileUrl && (
              <Image
                className="w-full"
                src={imageMobileUrl}
                alt=""
                width={0}
                height={0}
              />
            )}
          </picture>
        </div>
      )}

      <AppPageContent className={className}>{children}</AppPageContent>
    </div>
  );
}
