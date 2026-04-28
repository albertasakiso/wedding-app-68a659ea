export interface WebPResult {
  blob: Blob;
  originalSize: number;
  convertedSize: number;
  originalName: string;
  webpName: string;
}

export async function convertToWebP(
  file: File,
  maxSizeMB = 15,
  quality = 0.85
): Promise<WebPResult> {
  if (file.size > maxSizeMB * 1024 * 1024) {
    throw new Error(`File exceeds ${maxSizeMB}MB limit`);
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas context unavailable"));
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error("WebP conversion failed"));
          const baseName = file.name.replace(/\.[^.]+$/, "");
          resolve({
            blob,
            originalSize: file.size,
            convertedSize: blob.size,
            originalName: file.name,
            webpName: `${baseName}.webp`,
          });
        },
        "image/webp",
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };

    img.src = url;
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

