import Link from "next/link";

export default function MartFooter() {
  return (
    <footer className="mt-16 bg-white">
      <div className="mx-auto max-w-7xl px-4">
        <div className="rounded-[32px] bg-neutral-50 px-6 py-10 md:px-10 md:py-12">
          <div className="grid gap-10 md:grid-cols-4">
            <div>
              <p className="text-base font-semibold">
                Geonest <span className="text-red-600">Mart</span>
              </p>
              <p className="mt-2 text-sm text-neutral-600">
                A clean, modern marketplace built for fast buying.
              </p>
              <p className="mt-4 text-sm text-neutral-500">
                © {new Date().getFullYear()} Geonest Mart
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold">Shop</p>
              <div className="mt-3 space-y-2 text-sm text-neutral-600">
                <Link className="block hover:text-red-600" href="/mart/shop">All products</Link>
                <Link className="block hover:text-red-600" href="/mart/categories">Categories</Link>
                <Link className="block hover:text-red-600" href="/mart/deals">Deals</Link>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold">Help</p>
              <div className="mt-3 space-y-2 text-sm text-neutral-600">
                <Link className="block hover:text-red-600" href="/mart/help/shipping">Shipping</Link>
                <Link className="block hover:text-red-600" href="/mart/help/returns">Returns</Link>
                <Link className="block hover:text-red-600" href="/mart/help/support">Support</Link>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold">Newsletter</p>
              <p className="mt-2 text-sm text-neutral-600">
                Weekly deals & new drops.
              </p>
              <div className="mt-4 flex gap-2">
                <input
                  className="h-11 w-full rounded-2xl bg-white px-4 text-sm outline-none shadow-sm focus:ring-2 focus:ring-red-500/20"
                  placeholder="your@email.com"
                />
                <button className="h-11 rounded-2xl bg-black px-5 text-sm font-medium text-white hover:bg-black/90">
                  Subscribe
                </button>
              </div>
              <p className="mt-2 text-xs text-neutral-500">
                Backend-ready: wire to your email service later.
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-neutral-200 pt-6 text-sm text-neutral-500 md:flex-row md:items-center md:justify-between">
            <p>Secure checkout • Fast delivery • Smart assistant</p>
            <p>Visa • Mastercard • MoMo (add later)</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
