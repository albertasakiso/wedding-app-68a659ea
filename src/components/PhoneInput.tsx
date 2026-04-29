import { forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Props = React.InputHTMLAttributes<HTMLInputElement>;

/**
 * Shared phone input with Ghana-friendly placeholder + tel semantics.
 * Use everywhere a guest-facing phone number is collected.
 */
const PhoneInput = forwardRef<HTMLInputElement, Props>(
  ({ className, placeholder = "+233 XX XXX XXXX", ...props }, ref) => (
    <Input
      ref={ref}
      type="tel"
      inputMode="tel"
      autoComplete="tel"
      placeholder={placeholder}
      className={cn("border-primary/20 focus:border-primary", className)}
      {...props}
    />
  )
);
PhoneInput.displayName = "PhoneInput";

export default PhoneInput;
