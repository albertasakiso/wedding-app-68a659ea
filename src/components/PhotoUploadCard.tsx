import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Loader2, Camera } from "lucide-react";
import { convertToWebP } from "@/lib/image-utils";

interface PhotoUploadCardProps {
  onUploaded?: () => void;
}

export default function PhotoUploadCard({ onUploaded }: PhotoUploadCardProps) {
  const [uploading, setUploading] = useState(false);
  const [uploaderName, setUploaderName] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    let successCount = 0;
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) {
          toast.error(`Skipping non-image: ${file.name}`);
          continue;
        }
        try {
          const { blob, webpName } = await convertToWebP(file);
          const path = `guest-uploads/${Date.now()}-${webpName}`;
          const { error: uploadErr } = await supabase.storage
            .from("gallery")
            .upload(path, blob, { contentType: "image/webp", upsert: false });
          if (uploadErr) throw uploadErr;
          const { data: pub } = supabase.storage.from("gallery").getPublicUrl(path);
          const { error: insertErr } = await supabase.from("gallery_photos").insert({
            url: pub.publicUrl,
            uploaded_by: uploaderName.trim() || "Anonymous Guest",
            caption: null,
          });
          if (insertErr) throw insertErr;
          successCount++;
        } catch (e: any) {
          toast.error(`Failed: ${file.name} — ${e.message}`);
        }
      }
      if (successCount > 0) {
        toast.success(`${successCount} photo${successCount > 1 ? "s" : ""} uploaded! 🎉`);
        onUploaded?.();
      }
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="max-w-2xl mx-auto mb-12">
      <div
        className={`rounded-2xl border-2 border-dashed transition-all p-8 text-center bg-card ${
          dragActive ? "border-primary bg-primary/5" : "border-primary/20"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          handleFiles(e.dataTransfer.files);
        }}
      >
        <Camera className="w-10 h-10 text-primary mx-auto mb-3" />
        <h3 className="font-display text-xl text-foreground mb-2">Share Your Memories</h3>
        <p className="text-sm text-muted-foreground font-body mb-4">
          Drop photos here or click to upload. They'll appear in our gallery!
        </p>
        <Input
          value={uploaderName}
          onChange={(e) => setUploaderName(e.target.value)}
          placeholder="Your name (optional)"
          className="max-w-xs mx-auto mb-4"
          disabled={uploading}
        />
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
          disabled={uploading}
        />
        <Button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="bg-primary text-primary-foreground"
        >
          {uploading ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...</>
          ) : (
            <><Upload className="w-4 h-4 mr-2" /> Choose Photos</>
          )}
        </Button>
      </div>
    </div>
  );
}
