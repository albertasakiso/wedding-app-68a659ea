import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Upload, CheckCircle } from "lucide-react";
import { adminApi } from "@/lib/admin-api";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { convertToWebP, formatFileSize } from "@/lib/image-utils";
import { useRowSelection } from "@/hooks/useRowSelection";
import BulkSelectionBar from "./BulkSelectionBar";

interface GalleryTabProps {
  photos: any[];
  onRefresh: () => void;
}

export default function GalleryTab({ photos, onRefresh }: GalleryTabProps) {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState("");
  const [conversionInfo, setConversionInfo] = useState<{ original: string; converted: string } | null>(null);
  const sel = useRowSelection();
  const visibleIds = (photos || []).map((p: any) => p.id);
  const allSelected = visibleIds.length > 0 && visibleIds.every((id) => sel.has(id));

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${sel.count} photos? This also removes them from storage.`)) return;
    try {
      await adminApi("bulk-delete-photo", { ids: sel.ids });
      toast({ title: `${sel.count} photos deleted` });
      sel.clear();
      onRefresh();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setConversionInfo(null);
    try {
      // Convert to WebP
      const result = await convertToWebP(file, 15);
      setConversionInfo({
        original: formatFileSize(result.originalSize),
        converted: formatFileSize(result.convertedSize),
      });

      const path = `admin/${Date.now()}.webp`;
      const { error: uploadError } = await supabase.storage
        .from("gallery")
        .upload(path, result.blob, { contentType: "image/webp" });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("gallery").getPublicUrl(path);
      await adminApi("insert-photo", { url: urlData.publicUrl, caption });
      setCaption("");
      toast({ title: "Photo uploaded as WebP ✓" });
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
                <Upload className="h-4 w-4" /> {uploading ? "Converting & Uploading..." : "Upload Photo"}
              </Button>
            </div>
          </div>
          {conversionInfo && (
            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Converted: {conversionInfo.original} → {conversionInfo.converted} (WebP)</span>
            </div>
          )}
        </CardContent>
      </Card>

      <BulkSelectionBar count={sel.count} onClear={sel.clear}>
        <Button size="sm" variant="destructive" onClick={handleBulkDelete} className="gap-1">
          <Trash2 className="h-3.5 w-3.5" /> Delete
        </Button>
      </BulkSelectionBar>

      {photos.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No photos yet.</p>
      ) : (
        <>
          {visibleIds.length > 0 && (
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Checkbox checked={allSelected} onCheckedChange={() => sel.toggleAll(visibleIds)} />
              Select all
            </label>
          )}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((p) => (
              <div key={p.id} className={`group relative rounded-lg overflow-hidden border ${sel.has(p.id) ? "border-primary ring-2 ring-primary" : "border-primary/10"}`}>
                <img src={p.url} alt={p.caption || "Gallery"} className="w-full aspect-square object-cover" />
                <div className="absolute top-2 left-2 z-10 bg-background/90 rounded p-1">
                  <Checkbox checked={sel.has(p.id)} onCheckedChange={() => sel.toggle(p.id)} />
                </div>
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
        </>
      )}
    </div>
  );
}
