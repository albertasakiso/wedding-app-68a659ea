import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, Users, Calendar, MapPin, Image, MessageSquare, Settings, Mail, Gift, CreditCard } from "lucide-react";
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

interface AdminDashboardProps {
  onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => adminApi("get-dashboard"),
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

  const { rsvps = [], events = [], venue = null, photos = [], settings = null, email_list = [], gift_options = [], gift_payments = [], payment_settings = null } = data || {};

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
            <TabsTrigger value="overview" className="gap-2"><LayoutDashboard className="h-4 w-4" /> Overview</TabsTrigger>
            <TabsTrigger value="rsvps" className="gap-2"><Users className="h-4 w-4" /> RSVPs</TabsTrigger>
            <TabsTrigger value="events" className="gap-2"><Calendar className="h-4 w-4" /> Events</TabsTrigger>
            <TabsTrigger value="venue" className="gap-2"><MapPin className="h-4 w-4" /> Venue</TabsTrigger>
            <TabsTrigger value="gallery" className="gap-2"><Image className="h-4 w-4" /> Gallery</TabsTrigger>
            <TabsTrigger value="messages" className="gap-2"><MessageSquare className="h-4 w-4" /> Messages</TabsTrigger>
            <TabsTrigger value="settings" className="gap-2"><Settings className="h-4 w-4" /> Settings</TabsTrigger>
            <TabsTrigger value="email-list" className="gap-2"><Mail className="h-4 w-4" /> Email List</TabsTrigger>
          </TabsList>

          <TabsContent value="overview"><OverviewTab rsvps={rsvps} /></TabsContent>
          <TabsContent value="rsvps"><RSVPsTab rsvps={rsvps} onRefresh={handleRefresh} /></TabsContent>
          <TabsContent value="events"><EventsTab events={events} onRefresh={handleRefresh} /></TabsContent>
          <TabsContent value="venue"><VenueTab venue={venue} onRefresh={handleRefresh} /></TabsContent>
          <TabsContent value="gallery"><GalleryTab photos={photos} onRefresh={handleRefresh} /></TabsContent>
          <TabsContent value="messages"><MessagesTab rsvps={rsvps} /></TabsContent>
          <TabsContent value="settings"><SettingsTab settings={settings} onRefresh={handleRefresh} /></TabsContent>
          <TabsContent value="email-list"><EmailListTab subscribers={email_list} onRefresh={handleRefresh} /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
