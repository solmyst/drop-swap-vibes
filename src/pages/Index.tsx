import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeaturedSection from "@/components/FeaturedSection";
import CategoryPills from "@/components/CategoryPills";
// import PassSection from "@/components/PassSection"; // COMMENTED OUT - Pass system disabled
import ImpactSection from "@/components/ImpactSection";
import AboutSection from "@/components/AboutSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background dark">
      <Navbar />
      <main>
        <Hero />
        <FeaturedSection />
        <CategoryPills />
        <ImpactSection />
        {/* <PassSection /> */} {/* COMMENTED OUT - Pass system disabled */}
        <AboutSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;