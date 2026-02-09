"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Plane, Hotel, Car } from "lucide-react";

const tabs = [
  { href: "/", label: "Home", icon: Home },
  { href: "/flights", label: "Flights", icon: Plane },
  { href: "/hotels", label: "Hotels", icon: Hotel },
  { href: "/cabs", label: "Cabs", icon: Car },
] as const;

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="glass fixed bottom-0 left-0 right-0 z-50 border-t border-white/20 pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="mx-auto flex h-16 max-w-md items-center justify-around">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/"
              ? pathname === "/"
              : pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 rounded-xl px-4 py-1.5 text-xs transition-all ${
                active
                  ? "bg-primary-50 font-semibold text-primary-600"
                  : "font-medium text-text-muted hover:text-text-secondary"
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
