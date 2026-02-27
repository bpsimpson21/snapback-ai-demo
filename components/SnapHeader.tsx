"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/ai-strategy", label: "The Case for AI" },
  { href: "/ai-workflow", label: "AI Workflow" },
  { href: "/travel-planner", label: "Travel Planner" },
  { href: "/analysis", label: "YouTube Audit" },
  { href: "/world-cup-ai", label: "World Cup AI" },
  { href: "/about", label: "Who We Are" },
];

export default function SnapHeader() {
  const pathname = usePathname();

  return (
    <header className="bg-snap-black border-b border-white/10 px-6 py-4 flex items-center justify-between shrink-0">
      <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition">
        <Image
          src="/snapback-hat-logo.png"
          alt="Snapback logo"
          width={36}
          height={36}
          className="rounded object-contain"
        />
        <div className="leading-none">
          <span className="block text-snap-yellow font-bold text-lg tracking-tight">Snapback</span>
          <span className="block text-xs text-gray-500 mt-0.5">AI Ops Lab</span>
        </div>
      </Link>

      <nav className="flex items-center gap-6">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`text-sm transition-colors ${
              pathname === link.href
                ? "text-snap-yellow font-semibold"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
