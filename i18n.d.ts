import { Locale } from "@/i18n/config";
import messages from "./messages/vi.json";

declare module "next-intl" {
  interface AppConfig {
    Locale: Locale;
    Messages: typeof messages;
  }
}
