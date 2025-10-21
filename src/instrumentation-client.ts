import { analytics } from "@/utils/firebase";
import dayjs from "dayjs";
import "dayjs/locale/vi";
dayjs.locale("vi");

if (analytics) {
  console.info("Analytics initialized");
}
