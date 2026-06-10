import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

/**
 * Render a DOM element to a multi-page A4 portrait PDF and trigger download.
 * Designed for the programme page — preserves on-screen gold theme via rasterization.
 */
export async function downloadElementAsPdf(el: HTMLElement, filename: string) {
  // Force a clean white background snapshot regardless of theme overlays
  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#FAF8F3",
    windowWidth: el.scrollWidth,
  });

  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const pageWidthMm = pdf.internal.pageSize.getWidth();
  const pageHeightMm = pdf.internal.pageSize.getHeight();

  // Scale the canvas width to fit page width
  const imgWidthMm = pageWidthMm;
  const imgHeightMm = (canvas.height * imgWidthMm) / canvas.width;

  let heightLeft = imgHeightMm;
  let position = 0;
  const imgData = canvas.toDataURL("image/jpeg", 0.92);

  pdf.addImage(imgData, "JPEG", 0, position, imgWidthMm, imgHeightMm);
  heightLeft -= pageHeightMm;

  while (heightLeft > 0) {
    position = heightLeft - imgHeightMm; // negative offset moves image up
    pdf.addPage();
    pdf.addImage(imgData, "JPEG", 0, position, imgWidthMm, imgHeightMm);
    heightLeft -= pageHeightMm;
  }

  pdf.save(filename);
}
