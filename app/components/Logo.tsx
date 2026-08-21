import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 font-bold text-lg">
      <span className="text-xl">◆</span>
      <span>KeyNexa</span>
    </Link>
  );
}
