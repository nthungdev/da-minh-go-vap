import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";

export default function AppViewMoreLink({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="text-secondary flex flex-row items-center justify-end space-x-1 transition-transform hover:scale-105"
    >
      <span>Xem tiếp</span>
      <FaArrowRight size={16} />
    </Link>
  );
}
