/**
 * Anonymize a guest entry for public display: first 4 letters of name + last 4 digits of phone.
 * Example: anonymizeEntry("John Smith", "+233 24 690 4618") → "JOHN....4618"
 */
export function anonymizeEntry(name: string, phone?: string | null): string {
  const first4 = (name || "").replace(/\s+/g, "").substring(0, 4).toUpperCase();
  const last4 = phone ? phone.replace(/\D/g, "").slice(-4) : "****";
  return `${first4}....${last4}`;
}

export function formatGHS(amount: number): string {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    maximumFractionDigits: 0,
  }).format(amount);
}
