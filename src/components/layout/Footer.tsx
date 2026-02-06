import Link from "next/link";
import { Plane, Hotel, Car, Mail, Phone, MapPin } from "lucide-react";

const columns = [
  {
    title: "Services",
    links: [
      { label: "Flights", href: "/flights", icon: Plane },
      { label: "Hotels", href: "/hotels", icon: Hotel },
      { label: "Cabs & Transfers", href: "/cabs", icon: Car },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Blog", href: "#" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", href: "#" },
      { label: "Cancellation Policy", href: "#" },
      { label: "Privacy Policy", href: "#" },
    ],
  },
] as const;

export default function Footer() {
  return (
    <footer className="bg-surface-dark pb-24 text-white/80 md:pb-8">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand column */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
                <span className="text-sm font-bold text-white">IF</span>
              </div>
              <span className="text-lg font-bold text-white">
                Icon <span className="text-accent-400">Fly</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-white/60">
              Your trusted travel partner for flights, hotels, and ground
              transportation worldwide.
            </p>
            <div className="flex flex-col gap-2 text-sm text-white/50">
              <span className="flex items-center gap-2">
                <Mail size={14} /> support@iconfly.com
              </span>
              <span className="flex items-center gap-2">
                <Phone size={14} /> +91 1800-123-4567
              </span>
              <span className="flex items-center gap-2">
                <MapPin size={14} /> New Delhi, India
              </span>
            </div>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/40">
                {col.title}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-accent-400"
                    >
                      {"icon" in link && <link.icon size={14} />}
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-white/40">
          &copy; {new Date().getFullYear()} Icon Fly. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
