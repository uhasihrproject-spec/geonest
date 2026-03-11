import Navbar from "@/components/home/Navbar";
import AboutHero from "@/components/about/AboutHero";
import AboutStory from "@/components/about/AboutStory";
import AboutStats from "@/components/about/AboutStats";
import AboutValues from "@/components/about/AboutValues";
import AboutBrandsGrid from "@/components/about/AboutBrandsGrid";
import AboutHowWeWork from "@/components/about/AboutHowWeWork";
import AboutTimeline from "@/components/about/AboutTimeline";
import AboutCTA from "@/components/about/AboutCTA";
import Footer from "@/components/home/Footer";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white text-neutral-900">
      <Navbar />
      <AboutHero />
      <AboutStory />
      <AboutStats />
      <AboutValues />
      <AboutBrandsGrid />
      <AboutHowWeWork />
      <AboutTimeline />
      <AboutCTA />
      <Footer />
    </main>
  );
}
