import QRCode from "qrcode";

export interface QrOptions {
  size?: number;       // pixel size for PNG
  margin?: number;
  color?: string;      // dark color
  bgColor?: string;    // light color
}

export async function generateQrPngDataUrl(text: string, opts: QrOptions = {}): Promise<string> {
  return await QRCode.toDataURL(text, {
    width: opts.size ?? 512,
    margin: opts.margin ?? 2,
    color: { dark: opts.color ?? "#D4AF37", light: opts.bgColor ?? "#FFFFFF" },
    errorCorrectionLevel: "H",
  });
}

export async function generateQrSvgString(text: string, opts: QrOptions = {}): Promise<string> {
  return await QRCode.toString(text, {
    type: "svg",
    margin: opts.margin ?? 2,
    color: { dark: opts.color ?? "#D4AF37", light: opts.bgColor ?? "#FFFFFF" },
    errorCorrectionLevel: "H",
  });
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export function downloadString(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  downloadDataUrl(url, filename);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
