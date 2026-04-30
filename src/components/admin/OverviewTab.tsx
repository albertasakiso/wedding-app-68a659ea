import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserCheck, UserX, Heart, Download, Gift } from "lucide-react";
import RecentActivity from "./RecentActivity";
import { adminApi } from "@/lib/admin-api";
import { toCsv, downloadCsv } from "@/lib/csv-utils";
import type { RSVPRow, GiftWallRow, GiftPaymentRow, DashboardData } from "./types";

interface OverviewTabProps {
  rsvps: RSVPRow[];
}

export default function OverviewTab({ rsvps }: OverviewTabProps) {
  const total = rsvps.length;
  const attending = rsvps.filter((r) => r.attending).length;
  const declined = rsvps.filter((r) => !r.attending).length;
  const plusOnes = rsvps.filter((r) => r.plus_one_name).length;

  const { data: dashboard } = useQuery<DashboardData>({
    queryKey: ["admin-dashboard"],
    queryFn: () => adminApi("get-dashboard") as Promise<DashboardData>,
  });
  const giftWall: GiftWallRow[] = dashboard?.gift_wall ?? [];
  const giftPayments: GiftPaymentRow[] = dashboard?.gift_payments ?? [];

  const stats = [
    { label: "Total RSVPs", value: total, icon: Users, color: "text-primary" },
    { label: "Attending", value: attending, icon: UserCheck, color: "text-green-600" },
    { label: "Declined", value: declined, icon: UserX, color: "text-red-500" },
    { label: "Plus Ones", value: plusOnes, icon: Heart, color: "text-pink-500" },
    { label: "Total Guests", value: attending + plusOnes, icon: Users, color: "text-primary" },
  ];

  const exportRsvps = () => {
    const csv = toCsv(rsvps, [
      { key: "guest_name", header: "Guest Name" },
      { key: "attending", header: "Attending" },
      { key: "phone", header: "Phone" },
      { key: "email", header: "Email" },
      { key: "plus_one_name", header: "Plus One" },
      { key: "message", header: "Message" },
      { key: "created_at", header: "Submitted" },
    ]);
    downloadCsv(`rsvps-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  const exportGiftWall = () => {
    const csv = toCsv(giftWall, [
      { key: "donor_name", header: "Donor" },
      { key: "gift_type", header: "Type" },
      { key: "phone", header: "Phone" },
      { key: "email", header: "Email" },
      { key: "message", header: "Message" },
      { key: "is_visible", header: "Visible" },
      { key: "created_at", header: "Date" },
    ]);
    downloadCsv(`gift-wall-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  const exportPayments = () => {
    const csv = toCsv(giftPayments, [
      { key: "donor_name", header: "Donor" },
      { key: "donor_email", header: "Email" },
      { key: "donor_phone", header: "Phone" },
      { key: "amount", header: "Amount" },
      { key: "currency", header: "Currency" },
      { key: "payment_method", header: "Method" },
      { key: "payment_provider", header: "Provider" },
      { key: "status", header: "Status" },
      { key: "payment_reference", header: "Reference" },
      { key: "created_at", header: "Date" },
    ]);
    downloadCsv(`gift-payments-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="border-primary/10">
            <CardContent className="pt-6 text-center">
              <s.icon className={`h-8 w-8 mx-auto mb-2 ${s.color}`} />
              <p className="text-3xl font-display font-bold text-foreground">{s.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-primary/10">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4 text-primary" />
              <h3 className="font-display text-foreground">Quick Exports</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={exportRsvps} disabled={rsvps.length === 0} className="gap-2">
                <Users className="h-3 w-3" /> RSVPs ({rsvps.length})
              </Button>
              <Button variant="outline" size="sm" onClick={exportGiftWall} disabled={giftWall.length === 0} className="gap-2">
                <Gift className="h-3 w-3" /> Gift Wall ({giftWall.length})
              </Button>
              <Button variant="outline" size="sm" onClick={exportPayments} disabled={giftPayments.length === 0} className="gap-2">
                <Download className="h-3 w-3" /> Payments ({giftPayments.length})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <RecentActivity />
    </div>
  );
}
