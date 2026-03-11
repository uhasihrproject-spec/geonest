"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock, MapPin, Phone } from "lucide-react";

function getAccraParts(now: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Accra",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return {
    weekday: get("weekday"),
    hour: parseInt(get("hour"), 10),
    minute: parseInt(get("minute"), 10),
    second: parseInt(get("second"), 10),
  };
}

function isOpenNowAccra(now: Date) {
  const { weekday, hour, minute } = getAccraParts(now);
  const mins = hour * 60 + minute;

  // Sunday: 15:00 – 22:00
  if (weekday === "Sun") return mins >= 15 * 60 && mins < 22 * 60;

  // Mon–Sat: 08:00 – 22:00
  return mins >= 8 * 60 && mins < 22 * 60;
}

function formatAccraTime(now: Date) {
  // Includes seconds
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Accra",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(now);
}

export default function TopBar() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const open = useMemo(() => isOpenNowAccra(now), [now]);
  const time = useMemo(() => formatAccraTime(now), [now]);

  return (
    <div className="w-full bg-neutral-900 text-neutral-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-2">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between text-[11px] sm:text-xs">
          {/* Left group */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="inline-flex items-center gap-2 opacity-80">
              <MapPin className="h-3.5 w-3.5" />
              Accra, Ghana
            </span>

            <span className="inline-flex items-center gap-2 opacity-80 tabular-nums">
              <Clock className="h-3.5 w-3.5" />
              {time}
            </span>

            <span
              className={[
                "inline-flex items-center gap-2 rounded-full px-2 py-[2px] text-[11px] ring-1",
                open
                  ? "bg-emerald-500/10 text-emerald-300 ring-emerald-500/30"
                  : "bg-rose-500/10 text-rose-300 ring-rose-500/30",
              ].join(" ")}
            >
              <span
                className={[
                  "h-1.5 w-1.5 rounded-full",
                  open ? "bg-emerald-400" : "bg-rose-400",
                ].join(" ")}
              />
              {open ? "Open now" : "Closed"}
            </span>

            {/* Hide schedule on small screens to keep it clean */}
            <span className="hidden lg:inline opacity-70">
              Mon–Sat 8:00am–10:00pm · Sun 3:00pm–10:00pm
            </span>
          </div>

          {/* Right group */}
          <div className="flex items-center justify-between md:justify-end gap-4">
            {/* Schedule shown on small screens but compact */}
            <span className="lg:hidden opacity-70">
              Mon–Sat 8–10 · Sun 3–10
            </span>

            <a
              href="tel:+233000000000"
              className="inline-flex items-center gap-2 hover:text-yellow-300 transition"
            >
              <Phone className="h-3.5 w-3.5" />
              <span className="tabular-nums">+233 (0) 00 000 0000</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
