export function formatDate(date: Date) {
  const formatted = new Intl.DateTimeFormat("vi-VN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
  return formatted;
}
