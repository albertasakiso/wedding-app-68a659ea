import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Download, QrCode } from "lucide-react";
import { generateQrPngDataUrl, generateQrSvgString, downloadDataUrl, downloadString } from "@/lib/qr-utils";

export default function QRCodeTab() {
  const defaultUrl = `${window.location.origin}/qr`;
  const [url, setUrl] = useState(defaultUrl);
  const [size, setSize] = useState(640);
  const [color, setColor] = useState("#D4AF37");
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [margin, setMargin] = useState(2);
  const [dataUrl, setDataUrl] = useState("");

  useEffect(() => {
    let cancelled = false;
    generateQrPngDataUrl(url, { size, color, bgColor, margin }).then((d) => { if (!cancelled) setDataUrl(d); });
    return () => { cancelled = true; };
  }, [url, size, color, bgColor, margin]);

  const downloadPng = async () => {
    const hi = await generateQrPngDataUrl(url, { size: 1600, color, bgColor, margin });
    downloadDataUrl(hi, "wedding-qr.png");
  };
  const downloadSvg = async () => {
    const svg = await generateQrSvgString(url, { color, bgColor, margin });
    downloadString(svg, "wedding-qr.svg", "image/svg+xml");
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display text-lg flex items-center gap-2"><QrCode className="h-5 w-5 text-primary" /> Wedding QR Code</h3>
        <p className="text-sm text-muted-foreground">
          One QR code that opens a guest landing page with three buttons: <strong>RSVP</strong>, <strong>Programme</strong>, and <strong>Check In</strong>.
          Print it on your flyer — guests scan once and choose what to do.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div>
              <Label>Destination URL</Label>
              <Input value={url} onChange={(e) => setUrl(e.target.value)} />
              <p className="text-xs text-muted-foreground mt-1">Default: smart landing page on your wedding site.</p>
            </div>
            <div>
              <Label>Foreground (gold)</Label>
              <div className="flex gap-2">
                <Input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-16 p-1 h-10" />
                <Input value={color} onChange={(e) => setColor(e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Background</Label>
              <div className="flex gap-2">
                <Input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-16 p-1 h-10" />
                <Input value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Preview Size: {size}px</Label>
              <Slider value={[size]} min={320} max={1024} step={32} onValueChange={(v) => setSize(v[0])} />
            </div>
            <div>
              <Label>Margin: {margin}</Label>
              <Slider value={[margin]} min={0} max={8} step={1} onValueChange={(v) => setMargin(v[0])} />
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={downloadPng} className="flex-1 gap-2"><Download className="h-4 w-4" /> Download PNG (high-res)</Button>
              <Button onClick={downloadSvg} variant="outline" className="flex-1 gap-2"><Download className="h-4 w-4" /> SVG</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 flex flex-col items-center justify-center" style={{ background: bgColor }}>
            {dataUrl ? (
              <img src={dataUrl} alt="QR preview" className="max-w-full h-auto rounded" style={{ width: Math.min(size, 400) }} />
            ) : (
              <p className="text-sm text-muted-foreground">Generating…</p>
            )}
            <p className="text-xs text-muted-foreground mt-3 break-all text-center">{url}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
