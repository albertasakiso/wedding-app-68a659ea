import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Camera, ArrowLeft, X } from "lucide-react";

interface Photo {
  id: string;
  url: string;
  caption: string | null;
  uploaded_by: string | null;
}

const Gallery = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from("gallery_photos")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPhotos(data || []);
    } catch (error) {
      console.error("Error fetching photos:", error);
    } finally {
      setLoading(false);
    }
  };

  // Placeholder images for now
  const placeholderPhotos = [
    { id: "1", caption: "Engagement Day" },
    { id: "2", caption: "Our First Date" },
    { id: "3", caption: "The Proposal" },
    { id: "4", caption: "Together Forever" },
    { id: "5", caption: "Adventures" },
    { id: "6", caption: "Love Story" },
    { id: "7", caption: "Memories" },
    { id: "8", caption: "Journey" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-32 pb-24">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-16">
            <Link
              to="/"
              className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 font-body transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
            <p className="text-muted-foreground text-sm tracking-[0.3em] uppercase mb-4 font-body">
              Our Moments
            </p>
            <h1 className="font-display text-4xl md:text-5xl text-foreground mb-4">
              Photo <span className="text-primary">Gallery</span>
            </h1>
            <p className="text-muted-foreground font-body text-lg max-w-2xl mx-auto">
              A collection of our favorite memories together. More photos will be added after the wedding!
            </p>
          </div>

          {/* Gallery Grid */}
          {loading ? (
            <div className="text-center py-20">
              <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground font-body">Loading gallery...</p>
            </div>
          ) : photos.length > 0 ? (
            <div className="columns-2 md:columns-3 lg:columns-4 gap-4 max-w-6xl mx-auto">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="break-inside-avoid mb-4 cursor-pointer group"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <div className="relative rounded-xl overflow-hidden shadow-soft hover:shadow-elegant transition-all">
                    <img
                      src={photo.url}
                      alt={photo.caption || "Wedding photo"}
                      className="w-full h-auto group-hover:scale-105 transition-transform duration-300"
                    />
                    {photo.caption && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                        <p className="text-white font-body text-sm">{photo.caption}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {placeholderPhotos.map((photo, index) => (
                  <div
                    key={photo.id}
                    className="aspect-square rounded-xl bg-gradient-to-br from-champagne to-cream border border-primary/20 overflow-hidden shadow-soft hover:shadow-elegant transition-all hover:scale-[1.02] cursor-pointer"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="w-full h-full flex items-center justify-center bg-primary/5">
                      <div className="text-center p-4">
                        <Camera className="w-8 h-8 text-primary/40 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground font-body">{photo.caption}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-12">
                <p className="text-muted-foreground font-body text-lg">
                  Photos coming soon! Check back after our engagement shoot.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Lightbox */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/10"
            onClick={() => setSelectedPhoto(null)}
          >
            <X className="w-6 h-6" />
          </Button>
          <img
            src={selectedPhoto.url}
            alt={selectedPhoto.caption || "Wedding photo"}
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          {selectedPhoto.caption && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm px-6 py-3 rounded-full">
              <p className="text-white font-body">{selectedPhoto.caption}</p>
            </div>
          )}
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Gallery;
