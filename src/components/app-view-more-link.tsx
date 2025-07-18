import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";

export default function AppViewMoreLink({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="text-secondary flex flex-row justify-end items-center space-x-1 hover:scale-105 transition-transform"
    >
      <span>Xem tiếp</span>
      <FaArrowRight size={16} />
    </Link>
  );
}
