import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, Users, Calendar, MapPin, Image, MessageSquare, Settings, Mail, Gift, CreditCard, Bell } from "lucide-react";
import { adminApi, clearAdminToken } from "@/lib/admin-api";
import OverviewTab from "./OverviewTab";
import RSVPsTab from "./RSVPsTab";
import EventsTab from "./EventsTab";
import VenueTab from "./VenueTab";
import GalleryTab from "./GalleryTab";
import MessagesTab from "./MessagesTab";
import SettingsTab from "./SettingsTab";
import EmailListTab from "./EmailListTab";
import GiftsTab from "./GiftsTab";
import PaymentSettingsTab from "./PaymentSettingsTab";
import EmailSettingsTab from "./EmailSettingsTab";
import type { DashboardData } from "./types";

interface AdminDashboardProps {
  onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const { data, isLoading, refetch } = useQuery<DashboardData>({
    queryKey: ["admin-dashboard"],
    queryFn: () => adminApi("get-dashboard") as Promise<DashboardData>,
  });

  const handleLogout = () => {
    clearAdminToken();
    onLogout();
  };

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground animate-pulse">Loading dashboard...</p>
      </div>
    );
  }

  const { rsvps = [], events = [], venue = null, photos = [], settings = null, email_list = [], gift_options = [], gift_payments = [], payment_settings = null, email_settings = null, gift_wall = [] } = data ?? ({} as Partial<DashboardData>);

  // Single source of truth — drives both tab triggers and tab content.
  const ADMIN_TABS = [
    { value: "overview", label: "Overview", icon: LayoutDashboard, render: () => <OverviewTab rsvps={rsvps} /> },
    { value: "rsvps", label: "RSVPs", icon: Users, render: () => <RSVPsTab rsvps={rsvps} onRefresh={handleRefresh} /> },
    { value: "events", label: "Events", icon: Calendar, render: () => <EventsTab events={events} onRefresh={handleRefresh} /> },
    { value: "venue", label: "Venue", icon: MapPin, render: () => <VenueTab venue={venue} onRefresh={handleRefresh} /> },
    { value: "gallery", label: "Gallery", icon: Image, render: () => <GalleryTab photos={photos} onRefresh={handleRefresh} /> },
    { value: "messages", label: "Messages", icon: MessageSquare, render: () => <MessagesTab rsvps={rsvps} /> },
    { value: "gifts", label: "Gifts", icon: Gift, render: () => <GiftsTab gifts={gift_options} payments={gift_payments} giftWall={gift_wall} onRefresh={handleRefresh} /> },
    { value: "payment-settings", label: "Payments", icon: CreditCard, render: () => <PaymentSettingsTab settings={payment_settings} onRefresh={handleRefresh} /> },
    { value: "settings", label: "Settings", icon: Settings, render: () => <SettingsTab settings={settings} onRefresh={handleRefresh} /> },
    { value: "email-settings", label: "Notifications", icon: Bell, render: () => <EmailSettingsTab settings={email_settings} onRefresh={handleRefresh} /> },
    { value: "email-list", label: "Email List", icon: Mail, render: () => <EmailListTab subscribers={email_list} onRefresh={handleRefresh} /> },
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-primary/10 bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="font-display text-xl text-primary">Wedding Admin</h1>
          <Button variant="ghost" onClick={handleLogout} className="gap-2 text-muted-foreground">
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <Tabs defaultValue="overview">
          <TabsList className="mb-6 flex-wrap h-auto gap-1">
            {ADMIN_TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger key={tab.value} value={tab.value} className="gap-2">
                  <Icon className="h-4 w-4" /> {tab.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {ADMIN_TABS.map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>{tab.render()}</TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  );
}
