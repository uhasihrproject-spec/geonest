import TopBar from "@/components/home/TopBar";
import Navbar from "@/components/home/Navbar";
import Hero from "@/components/home/Hero";
import AboutGeonest from "@/components/home/AboutGeonest";
import HowGeonestWorks from "@/components/home/HowGeonestWorks";
import ServicesShowcase from "@/components/home/ServicesShowcase";
import OurStandards from "@/components/home/OurStandards";
import Testimonials from "@/components/home/Testimonials";
import FAQCTA from "@/components/home/FAQCTA";
import Footer from "@/components/home/Footer";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <TopBar />
      <Navbar />
      <Hero />
      <AboutGeonest />
      <HowGeonestWorks />
      <ServicesShowcase />
      <OurStandards />
      <Testimonials />
      <FAQCTA />
      <Footer />
    </main>
  );
}
