import { lazy, Suspense } from "react";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";

// Below-the-fold sections lazy-loaded to speed up initial paint
const EventTimeline = lazy(() => import("@/components/EventTimeline"));
const ProgrammePreview = lazy(() => import("@/components/ProgrammePreview"));
const VenueSection = lazy(() => import("@/components/VenueSection"));
const StorySection = lazy(() => import("@/components/StorySection"));
const DressCode = lazy(() => import("@/components/DressCode"));
const GalleryPreview = lazy(() => import("@/components/GalleryPreview"));
const MessagesWall = lazy(() => import("@/components/MessagesWall"));

const SectionSkeleton = () => (
  <div className="container mx-auto px-4 py-20">
    <div className="h-64 rounded-xl bg-muted/30 animate-pulse" />
  </div>
);

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <div id="hero">
          <Hero />
        </div>
        <Suspense fallback={<SectionSkeleton />}>
          <EventTimeline />
          <ProgrammePreview />
          <VenueSection />
          <StorySection />
          <DressCode />
          <GalleryPreview />
          <MessagesWall />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
