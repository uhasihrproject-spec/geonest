"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const links = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Companies", href: "#companies" },
];

const services = [
  { label: "Geonest Mart", href: "/mart" },
  { label: "Geonest Salon", href: "/salon" },
  { label: "Geonest Pharmacy", href: "/pharmacy" },
  { label: "Geonest Travel & Tour", href: "/travels" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [openServices, setOpenServices] = useState(false);
  const [openMobile, setOpenMobile] = useState(false);
  const ddRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const closeOnOutside = (e: MouseEvent) => {
      if (!ddRef.current) return;
      if (!ddRef.current.contains(e.target as Node)) setOpenServices(false);
    };
    document.addEventListener("mousedown", closeOnOutside);
    return () => document.removeEventListener("mousedown", closeOnOutside);
  }, []);

  return (
    <header
      className={[
        "sticky top-0 z-50 transition-all",
        scrolled
          ? "bg-white/80 backdrop-blur border-b border-neutral-200"
          : "bg-white",
      ].join(" ")}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="rounded-b-3xl">
        <div className="h-16 flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3 group">
            <div className="relative h-10 w-10">
              {/* put your svg at public/logo.svg */}
              <Image
                src="/logo.svg"
                alt="Geonest Ventures"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="leading-tight">
            <p className="font-semibold tracking-tight text-neutral-900 group-hover:opacity-90 transition">
                Geonest
            </p>
            <p className="text-xs -mt-0.5 font-light text-yellow-500">
                Ventures
            </p>
            </div>
        </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="relative text-sm text-neutral-700 hover:text-neutral-950 transition
                           after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-yellow-400
                           after:transition-all after:duration-300 hover:after:w-full"
              >
                {l.label}
              </a>
            ))}

            {/* Services dropdown */}
            <div className="relative" ref={ddRef}>
              <button
                onClick={() => setOpenServices((v) => !v)}
                className="relative text-sm text-neutral-700 hover:text-neutral-950 transition
                           after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-yellow-400
                           after:transition-all after:duration-300 hover:after:w-full"
              >
                Services <span className="ml-1 opacity-60">▾</span>
              </button>

              <div
                className={[
                  "absolute left-0 mt-3 w-64 rounded-2xl border border-neutral-200 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.10)]",
                  "transition-all duration-200 origin-top",
                  openServices
                    ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                    : "opacity-0 scale-95 -translate-y-2 pointer-events-none",
                ].join(" ")}
              >
                <div className="p-2">
                  {services.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      onClick={() => setOpenServices(false)}
                      className="block rounded-xl px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-neutral-950 transition"
                    >
                      {s.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
            <a
              href="#contact"
              className="rounded-2xl px-4 py-2 text-sm font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition"
            >
              Contact
            </a>
          </nav>

          {/* Mobile button */}
          <button
            onClick={() => setOpenMobile((v) => !v)}
            className="md:hidden rounded-xl border border-neutral-200 px-3 py-2 text-sm text-neutral-800 hover:bg-neutral-50 transition"
            aria-label="Open menu"
          >
            {openMobile ? "Close" : "Menu"}
          </button>
        </div>

        {/* Mobile panel */}
        <div
          className={[
            "md:hidden overflow-hidden transition-all duration-300",
            openMobile ? "max-h-[420px] pb-4" : "max-h-0",
          ].join(" ")}
        >
          <div className="rounded-2xl border border-neutral-200 bg-white p-3">
            {[...links, { label: "Contact", href: "#contact" }].map((l) => (
              <a
                key={l.label}
                href={l.href}
                onClick={() => setOpenMobile(false)}
                className="block rounded-xl px-3 py-3 text-sm text-neutral-800 hover:bg-neutral-50 transition"
              >
                {l.label}
              </a>
            ))}

            <div className="mt-2 border-t border-neutral-200 pt-2">
              <p className="px-3 py-2 text-xs uppercase tracking-[0.25em] text-neutral-500">
                Services
              </p>
              {services.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  onClick={() => setOpenMobile(false)}
                  className="block rounded-xl px-3 py-3 text-sm text-neutral-800 hover:bg-neutral-50 transition"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
    </header>
  );
}
