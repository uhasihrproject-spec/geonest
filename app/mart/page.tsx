import HeroInspo from "@/components/mart/HeroInspo";
import SectionBand from "@/components/mart/SectionBand";

// NOTE: You’ll create these next sections one by one
// (I can paste each full component as you say “next section”)
import FeaturedSection from "@/components/mart/FeaturedSection";
import DealBand from "@/components/mart/DealBand";
import TrustRow from "@/components/mart/TrustRow";
import TestimonialsSection from "@/components/mart/TestimonialsSection";
import BlogCtaSection from "@/components/mart/BlogCtaSection";

export default function MartHome() {
  return (
    <div className="bg-white">
      {/* Section 1 */}
      <HeroInspo />

      {/* Section 3: Featured Products */}
      <SectionBand
        id="featured"
        eyebrow="02 · FEATURED"
        title="Top picks this week"
        subtitle="Clean grid, quick add, image-ready — backend-friendly."
        tone="white"
      >
        <FeaturedSection />
      </SectionBand>

      {/* Section 4: Deal Band */}
      <SectionBand
        id="deals"
        eyebrow="03 · DEALS"
        title="Weekly deals that actually feel premium"
        subtitle="Simple promo layout that uses space, no card-box look."
        tone="soft"
      >
        <DealBand />
      </SectionBand>

      {/* Section 5: Trust / Why */}
      <SectionBand
        id="why"
        eyebrow="04 · WHY GEONEST MART"
        title="Built for speed, trust, and simplicity"
        subtitle="Clear reasons to buy here — designed to fill space without looking forced."
        tone="white"
      >
        <TrustRow />
      </SectionBand>

      {/* Section 6: Testimonials */}
      <SectionBand
        id="testimonials"
        eyebrow="05 · REVIEWS"
        title="What buyers are saying"
        subtitle="More believable Ghana-style testimonials, better layout."
        tone="soft"
      >
        <TestimonialsSection />
      </SectionBand>

      {/* Section 7: Newsletter */}
      <SectionBand
        id="blog"
        eyebrow="05 · BLOG & CTA"
        title="Guides that help people buy faster"
        subtitle="A clean blog + a strong CTA to drive conversions."
        tone="soft"
      >
        <BlogCtaSection />
      </SectionBand>

    </div>
  );
}
