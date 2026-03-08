import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Upload } from "lucide-react";
import { adminApi } from "@/lib/admin-api";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface GalleryTabProps {
  photos: any[];
  onRefresh: () => void;
}

export default function GalleryTab({ photos, onRefresh }: GalleryTabProps) {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState("");

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `admin/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("gallery").upload(path, file);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("gallery").getPublicUrl(path);
      await adminApi("insert-photo", { url: urlData.publicUrl, caption });
      setCaption("");
      toast({ title: "Photo uploaded" });
      onRefresh();
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this photo?")) return;
    try {
      await adminApi("delete-photo", { id });
      toast({ title: "Photo deleted" });
      onRefresh();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-primary/10">
        <CardContent className="pt-6">
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium text-foreground">Caption (optional)</label>
              <Input value={caption} onChange={(e) => setCaption(e.target.value)} className="mt-1" placeholder="Photo caption" />
            </div>
            <div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
              <Button onClick={() => fileRef.current?.click()} disabled={uploading} className="gap-2">
                <Upload className="h-4 w-4" /> {uploading ? "Uploading..." : "Upload Photo"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {photos.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No photos yet.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((p) => (
            <div key={p.id} className="group relative rounded-lg overflow-hidden border border-primary/10">
              <img src={p.url} alt={p.caption || "Gallery"} className="w-full aspect-square object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                <Button
                  variant="destructive"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDelete(p.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              {p.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2 truncate">
                  {p.caption}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
