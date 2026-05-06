import logoSrc from "@/assets/wedding-logo.png";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  alt?: string;
}

/**
 * Wedding monogram logo. Use Tailwind sizing classes (h-8, h-12 etc.) on
 * the wrapper to control display size.
 */
export default function Logo({ className, alt = "Apiligu Albert Asakiso & Ruby Teye-Doryumu" }: LogoProps) {
  return (
    <img
      src={logoSrc}
      alt={alt}
      className={cn("object-contain select-none", className)}
      draggable={false}
    />
  );
}
