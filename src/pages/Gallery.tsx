import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeTable } from "@/hooks/useRealtimeTable";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PhotoUploadCard from "@/components/PhotoUploadCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Camera, ArrowLeft, X, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

interface Photo {
  id: string;
  url: string;
  caption: string | null;
  uploaded_by: string | null;
}

function GalleryImage({ photo, onClick }: { photo: Photo; onClick: () => void }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="cursor-pointer group" onClick={onClick}>
      <div className="relative rounded-xl overflow-hidden shadow-soft hover:shadow-elegant transition-all aspect-square">
        {!loaded && <Skeleton className="absolute inset-0" />}
        <img
          src={photo.url}
          alt={photo.caption || "Wedding photo"}
          className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
          loading="lazy"
          onLoad={() => setLoaded(true)}
        />
        {photo.caption && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
            <p className="text-white font-body text-sm">{photo.caption}</p>
          </div>
        )}
      </div>
    </div>
  );
}

const Gallery = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [lightboxLoaded, setLightboxLoaded] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const fetchPhotos = useCallback(async () => {
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
  }, []);

  useEffect(() => { fetchPhotos(); }, [fetchPhotos]);
  useRealtimeTable("gallery_photos", fetchPhotos, "gallery-realtime");

  const navigatePhoto = useCallback((direction: number) => {
    setSelectedIndex((prev) => {
      if (prev === null) return null;
      const next = prev + direction;
      if (next >= 0 && next < photos.length) {
        setLightboxLoaded(false);
        return next;
      }
      return prev;
    });
  }, [photos.length]);

  // Preload adjacent images
  useEffect(() => {
    if (selectedIndex === null) return;
    [selectedIndex - 1, selectedIndex + 1].forEach((i) => {
      if (i >= 0 && i < photos.length) {
        const img = new Image();
        img.src = photos[i].url;
      }
    });
  }, [selectedIndex, photos]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === "Escape") setSelectedIndex(null);
      if (e.key === "ArrowLeft") navigatePhoto(-1);
      if (e.key === "ArrowRight") navigatePhoto(1);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selectedIndex, navigatePhoto]);

  // Touch swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 50) {
      navigatePhoto(delta > 0 ? -1 : 1);
    }
    touchStartX.current = null;
  };

  const selectedPhoto = selectedIndex !== null ? photos[selectedIndex] : null;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-32 pb-24">
        <div className="container mx-auto px-4">
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

          <PhotoUploadCard onUploaded={fetchPhotos} />

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-xl" />
              ))}
            </div>
          ) : photos.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
              {photos.map((photo, idx) => (
                <GalleryImage key={photo.id} photo={photo} onClick={() => { setLightboxLoaded(false); setSelectedIndex(idx); }} />
              ))}
            </div>
          ) : (
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[
                  "Engagement Day", "Our First Date", "The Proposal", "Together Forever",
                  "Adventures", "Love Story", "Memories", "Journey",
                ].map((caption, index) => (
                  <div
                    key={index}
                    className="aspect-square rounded-xl bg-gradient-to-br from-champagne to-cream border border-primary/20 overflow-hidden shadow-soft hover:shadow-elegant transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    <div className="w-full h-full flex items-center justify-center bg-primary/5">
                      <div className="text-center p-4">
                        <Camera className="w-8 h-8 text-primary/40 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground font-body">{caption}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-12">
                <p className="text-muted-foreground font-body text-lg">
                  Be the first to share a moment — upload above.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Lightbox with swipe support */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedIndex(null)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/10 z-10"
            onClick={() => setSelectedIndex(null)}
          >
            <X className="w-6 h-6" />
          </Button>

          {selectedIndex! > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 z-10"
              onClick={(e) => { e.stopPropagation(); navigatePhoto(-1); }}
            >
              <ChevronLeft className="w-8 h-8" />
            </Button>
          )}

          {selectedIndex! < photos.length - 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 z-10"
              onClick={(e) => { e.stopPropagation(); navigatePhoto(1); }}
            >
              <ChevronRight className="w-8 h-8" />
            </Button>
          )}

          <div className="relative">
            {!lightboxLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            )}
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.caption || "Wedding photo"}
              className={`max-w-full max-h-[90vh] object-contain rounded-lg transition-opacity duration-300 ${
                lightboxLoaded ? "opacity-100" : "opacity-0"
              }`}
              onClick={(e) => e.stopPropagation()}
              onLoad={() => setLightboxLoaded(true)}
            />
          </div>

          {selectedPhoto.caption && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm px-6 py-3 rounded-full">
              <p className="text-white font-body">{selectedPhoto.caption}</p>
            </div>
          )}

          <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
            <p className="text-white text-sm font-sans">{selectedIndex! + 1} / {photos.length}</p>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Gallery;
