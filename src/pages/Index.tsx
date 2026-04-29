import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import EventTimeline from "@/components/EventTimeline";
import VenueSection from "@/components/VenueSection";
import StorySection from "@/components/StorySection";
import DressCode from "@/components/DressCode";
import GalleryPreview from "@/components/GalleryPreview";
import MessagesWall from "@/components/MessagesWall";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <div id="hero">
          <Hero />
        </div>
        <EventTimeline />
        <VenueSection />
        <StorySection />
        <DressCode />
        <GalleryPreview />
        <MessagesWall />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
