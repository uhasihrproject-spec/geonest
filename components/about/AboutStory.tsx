export default function AboutStory() {
  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-white">
      {/* premium soft background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-48 -left-48 h-[700px] w-[700px] rounded-full bg-yellow-300/20 blur-[120px]" />
        <div className="absolute -bottom-48 -right-48 h-[720px] w-[720px] rounded-full bg-neutral-900/10 blur-[140px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-neutral-100/40" />
      </div>

      <div className="relative mx-auto flex min-h-[100svh] max-w-7xl items-center px-4 sm:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
            About Geonest
          </p>

          <h2 className="mt-4 text-4xl md:text-6xl font-semibold tracking-tight text-neutral-900">
            One group. Many ventures. One standard.
          </h2>

          <p className="mt-6 text-base md:text-lg leading-relaxed text-neutral-600">
            Geonest Ventures is a parent company built to operate and grow
            service-focused brands under one trusted identity. Each business runs
            independently — but all follow the same system: clean operations,
            premium experience, and consistency people can rely on.
          </p>

          <div className="mt-14 h-[2px] w-20 bg-yellow-400/70 mx-auto" />
        </div>
      </div>
    </section>
  );
}
