"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ShieldCheck,
  LogOut,
  ClipboardList,
  Package,
  PlusCircle,
  ArrowRight,
} from "lucide-react";

const AUTH_KEY = "geonest_admin_auth";
// Put this in .env.local (or your env file):
// NEXT_PUBLIC_ADMIN_PASSWORD="your_password_here"
const ENV_PASSWORD_KEY = "NEXT_PUBLIC_ADMIN_PASSWORD";

export default function AdminPage() {
  const router = useRouter();
  const pathname = usePathname();

  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);

  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>("");

  const correctPassword = useMemo(() => {
    // Must be NEXT_PUBLIC_* if you want it available in the browser.
    return process.env[ENV_PASSWORD_KEY] as string | undefined;
  }, []);

  useEffect(() => {
    setReady(true);
    const ok = sessionStorage.getItem(AUTH_KEY) === "true";
    setAuthed(ok);
  }, []);

  function login() {
    setError("");

    if (!correctPassword) {
      setError(
        `Admin password not configured. Add ${ENV_PASSWORD_KEY} in your .env file.`
      );
      return;
    }

    if (password.trim() === correctPassword) {
      sessionStorage.setItem(AUTH_KEY, "true");
      setAuthed(true);

      // If you want to go straight to Orders after login:
      router.push("/mart/admin/orders");
      return;
    }

    setError("Incorrect password.");
  }

  function logout() {
    sessionStorage.removeItem(AUTH_KEY);
    setAuthed(false);
    setPassword("");
    setError("");
    // Keep user on /mart/admin (this page) and show login again
    router.replace("/mart/admin");
  }

  // If someone is already authed and comes to /mart/admin, you can keep them here (dashboard)
  // OR auto-send to orders. If you want auto-send, uncomment:
  // useEffect(() => {
  //   if (ready && authed && pathname === "/mart/admin") router.replace("/mart/admin/orders");
  // }, [ready, authed, pathname, router]);

  if (!ready) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-[28px] bg-white p-6 ring-1 ring-neutral-200/70">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-red-600" />
            <h1 className="text-lg font-semibold">Admin Access</h1>
          </div>
          <p className="mt-2 text-sm text-neutral-600">Loading…</p>
          <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-neutral-100">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-red-600/30" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] py-10">
      <div className="mx-auto w-full max-w-6xl px-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
              Geonest Mart
            </p>
            <h1 className="mt-2 text-2xl font-semibold">Admin</h1>
            <p className="mt-1 text-sm text-neutral-600">
              Manage orders, products, and add new items.
            </p>
          </div>

          {authed ? (
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-800 transition"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm ring-1 ring-neutral-200/70">
              <ShieldCheck className="h-4 w-4 text-red-600" />
              Locked
            </div>
          )}
        </div>

        {/* Content */}
        <div className="mt-8">
          {!authed ? (
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Login Card */}
              <div className="rounded-[28px] bg-white p-6 ring-1 ring-neutral-200/70">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-red-600" />
                  <h2 className="text-lg font-semibold">Admin Login</h2>
                </div>

                <p className="mt-2 text-sm text-neutral-600">
                  Enter the admin password to continue.
                </p>

                <div className="mt-5">
                  <label className="text-sm font-medium text-neutral-700">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") login();
                    }}
                    placeholder="••••••••"
                    className="mt-2 w-full rounded-2xl bg-white px-4 py-3 text-sm ring-1 ring-neutral-200 focus:outline-none focus:ring-2 focus:ring-red-500/40"
                  />
                  {error ? (
                    <p className="mt-2 text-sm text-red-600">{error}</p>
                  ) : (
                    <p className="mt-2 text-xs text-neutral-500">
                      Tip: keep your password in{" "}
                      <span className="font-mono">.env.local</span>.
                    </p>
                  )}

                  <button
                    onClick={login}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-3 text-sm font-medium text-white hover:bg-red-700 transition"
                  >
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Info / Preview */}
              <div className="rounded-[28px] bg-neutral-950 p-6 text-white">
                <p className="text-xs uppercase tracking-[0.25em] text-white/60">
                  What you can do
                </p>
                <h3 className="mt-3 text-xl font-semibold">
                  3 Admin Sections
                </h3>
                <p className="mt-2 text-sm text-white/70">
                  Once logged in, you’ll get quick access to:
                </p>

                <div className="mt-5 grid gap-3">
                  <div className="rounded-2xl bg-white/10 p-4">
                    <div className="flex items-center gap-2">
                      <ClipboardList className="h-5 w-5" />
                      <p className="font-medium">Orders</p>
                    </div>
                    <p className="mt-1 text-sm text-white/70">
                      Track and update order statuses.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/10 p-4">
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      <p className="font-medium">Products</p>
                    </div>
                    <p className="mt-1 text-sm text-white/70">
                      View your catalog and manage items.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/10 p-4">
                    <div className="flex items-center gap-2">
                      <PlusCircle className="h-5 w-5" />
                      <p className="font-medium">Add New</p>
                    </div>
                    <p className="mt-1 text-sm text-white/70">
                      Add a new product quickly.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Dashboard Cards (3 sections) */}
              <div className="grid gap-5 md:grid-cols-3">
                <AdminCard
                  title="Orders"
                  desc="View and update order statuses."
                  icon={<ClipboardList className="h-5 w-5" />}
                  href="/mart/admin/orders"
                  pill="Live"
                />
                <AdminCard
                  title="Products"
                  desc="Manage your product catalog."
                  icon={<Package className="h-5 w-5" />}
                  href="/mart/admin/products"
                  pill="Catalog"
                />
                <AdminCard
                  title="Add New"
                  desc="Create a new product listing."
                  icon={<PlusCircle className="h-5 w-5" />}
                  href="/mart/admin/new"
                  pill="Fast"
                />
              </div>

              {/* Small hint row */}
              <div className="mt-6 rounded-[28px] bg-white p-5 ring-1 ring-neutral-200/70">
                <p className="text-sm text-neutral-700">
                  You’re logged in on this device. If you want stricter security
                  later, we can switch from sessionStorage to a proper backend
                  auth (cookies + server checks).
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function AdminCard({
  title,
  desc,
  href,
  icon,
  pill,
}: {
  title: string;
  desc: string;
  href: string;
  icon: React.ReactNode;
  pill?: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-[28px] bg-white p-6 ring-1 ring-neutral-200/70 hover:ring-neutral-300 transition"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-950 text-white">
          {icon}
        </div>

        {pill ? (
          <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-700">
            {pill}
          </span>
        ) : null}
      </div>

      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-neutral-600">{desc}</p>

      <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-neutral-900">
        Open
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
