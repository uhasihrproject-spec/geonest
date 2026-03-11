import FlipCard from "./FlipCard";

export default function AboutValues() {
  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-white">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-48 -left-48 h-[700px] w-[700px] rounded-full bg-yellow-300/18 blur-[120px]" />
        <div className="absolute -bottom-48 -right-48 h-[720px] w-[720px] rounded-full bg-neutral-900/10 blur-[140px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-neutral-100/40" />
      </div>

      <div className="relative mx-auto flex min-h-[100svh] max-w-7xl items-center px-4 sm:px-6">
        <div className="w-full">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
              Our values
            </p>

            <h2 className="mt-4 text-3xl md:text-5xl font-semibold tracking-tight text-neutral-900">
              What makes Geonest different
            </h2>

            <p className="mt-6 text-neutral-600 max-w-2xl mx-auto leading-relaxed">
              We hold every venture to the same standard. Tap a card to flip and
              see what that means in real detail.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <FlipCard
              title="Structured Operations"
              front="Clear processes that keep service consistent, not dependent on luck."
              back="We build systems: workflows, roles, checks, and standards — so delivery stays reliable across teams and locations."
            />
            <FlipCard
              title="Customer-First Experience"
              front="People should feel the difference from entry to exit."
              back="We design the experience intentionally — comfort, speed, respect, and quality — so customers return and recommend."
            />
            <FlipCard
              title="Premium Brand Standard"
              front="Clean presentation and professionalism across every brand."
              back="One identity, many businesses — each one aligned in quality control, service tone, and premium feel."
            />
          </div>

          <div className="mt-14 h-[2px] w-20 bg-yellow-400/70 mx-auto" />
        </div>
      </div>
    </section>
  );
}
