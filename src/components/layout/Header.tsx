"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

const navLinks = [
  {
    href: "https://www.lesswrong.com/posts/iy8XANvSr9u3czm7o/systema-robotica",
    label: "Read",
    external: true,
  },
  { href: "/glossary", label: "Glossary", external: false },
  { href: "/archive", label: "Archive", external: false },
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setScrolled(currentY > 10);
      setVisible(currentY < lastScrollY || currentY < 48);
      setLastScrollY(currentY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 h-12 flex items-center px-4 md:px-8 transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-md border-b border-border"
          : "bg-transparent"
      } ${visible ? "translate-y-0" : "-translate-y-full"}`}
    >
      <Link
        href="/"
        className="flex items-center gap-2 text-foreground hover:text-accent transition-colors"
      >
        <Image
          src="/logo.svg"
          alt="Systema Robotica"
          width={20}
          height={17}
          className="dark:invert"
        />
        <span
          className="text-sm tracking-[0.2em] uppercase"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Systema Robotica
        </span>
      </Link>

      <nav className="hidden md:flex items-center gap-6 ml-auto">
        {navLinks.map((link) =>
          link.external ? (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-0.5 text-sm text-muted hover:text-foreground transition-colors"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {link.label}
              <ArrowUpRight size={12} />
            </a>
          ) : (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm transition-colors ${
                pathname === link.href
                  ? "text-foreground"
                  : "text-muted hover:text-foreground"
              }`}
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {link.label}
            </Link>
          )
        )}
        <ThemeToggle />
      </nav>

      {/* Mobile */}
      <div className="flex items-center gap-3 ml-auto md:hidden">
        <ThemeToggle />
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-foreground"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="absolute top-12 left-0 right-0 bg-background border-b border-border p-4 md:hidden">
          {navLinks.map((link) =>
            link.external ? (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-1 py-2 text-sm text-muted"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {link.label}
                <ArrowUpRight size={12} />
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block py-2 text-sm ${
                  pathname === link.href ? "text-foreground" : "text-muted"
                }`}
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {link.label}
              </Link>
            )
          )}
        </div>
      )}
    </header>
  );
}
