"use client";

import * as React from "react";
import MartNavbar from "./MartNavbar";
import MartSidebar from "./MartSidebar";
import MartAssistant from "./MartAssistant";
import MartFooter from "./MartFooter";
import MartEffects from "./MartEffects";

export default function MartShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <MartEffects />

      {/* Soft red/peach ambient background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-white" />
        <div className="absolute -top-28 -left-28 h-[560px] w-[560px] rounded-full bg-red-500/10 blur-3xl" />
        <div className="absolute top-40 -right-28 h-[560px] w-[560px] rounded-full bg-rose-500/10 blur-3xl" />
        <div className="absolute bottom-[-140px] left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-red-500/6 blur-3xl" />
      </div>

      <MartNavbar onOpenSidebar={() => setSidebarOpen(true)} />

      {/* Content never shifts */}
      <main className="mx-auto max-w-7xl px-4">
        {children}
      </main>

      <MartFooter />
      <MartAssistant />

      {/* Desktop + Mobile overlay sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-[90]">
          <button
            aria-label="Close sidebar overlay"
            className="absolute inset-0 bg-black/20"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-4 top-4 h-[calc(100vh-32px)] w-[92vw] max-w-sm rounded-[28px] bg-white shadow-2xl">
            <MartSidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
