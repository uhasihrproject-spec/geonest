import React from "react";

type Props = {
  id?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  tone?: "white" | "soft";
  divider?: boolean;
  children: React.ReactNode;
};

export default function SectionBand({
  id,
  eyebrow,
  title,
  subtitle,
  tone = "white",
  divider = true,
  children,
}: Props) {
  return (
    <section id={id} className={`${tone === "soft" ? "bg-neutral-50/60" : "bg-white"}`}>
      {divider && <div className="border-t border-neutral-200/70" />}
      <div className="mx-auto max-w-7xl px-4 py-16 md:py-24">
        {(eyebrow || title || subtitle) && (
          <div className="mb-10">
            {eyebrow && (
              <p className="text-xs tracking-[0.35em] text-neutral-500">{eyebrow}</p>
            )}
            {title && (
              <h2 className="mt-3 text-2xl md:text-4xl font-semibold tracking-tight">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-3 max-w-2xl text-neutral-600">{subtitle}</p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
