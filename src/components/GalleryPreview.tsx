import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Camera, ArrowRight } from "lucide-react";

const GalleryPreview = () => {
  // Placeholder images - will be replaced with real photos from Supabase
  const previewImages = [
    { id: 1, caption: "Engagement photo" },
    { id: 2, caption: "Our story" },
    { id: 3, caption: "Together" },
    { id: 4, caption: "Love" },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-cream/30 to-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-muted-foreground text-sm tracking-[0.3em] uppercase mb-4 font-body">
            Our Moments
          </p>
          <h2 className="font-display text-4xl md:text-5xl text-foreground mb-4">
            Photo <span className="text-primary">Gallery</span>
          </h2>
          <p className="text-muted-foreground font-body text-lg max-w-2xl mx-auto">
            A glimpse into our journey together. More photos will be added after the celebration!
          </p>
        </div>

        {/* Preview Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto mb-12">
          {previewImages.map((image, index) => (
            <div
              key={image.id}
              className="aspect-square rounded-xl bg-gradient-to-br from-champagne to-cream border border-primary/20 overflow-hidden shadow-soft hover:shadow-elegant transition-all hover:scale-[1.02] cursor-pointer"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-full h-full flex items-center justify-center bg-primary/5">
                <div className="text-center">
                  <Camera className="w-8 h-8 text-primary/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground font-body">{image.caption}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button asChild variant="outline" size="lg" className="border-primary/30 text-foreground hover:bg-primary/10 font-display">
            <Link to="/gallery">
              View Full Gallery
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default GalleryPreview;
