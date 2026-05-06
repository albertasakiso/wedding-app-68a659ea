import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, Users, Calendar, MapPin, Image, MessageSquare, Settings, Mail, Gift, CreditCard, Bell, History, Shield, Contact, QrCode, ExternalLink } from "lucide-react";
import { adminApi, clearAdminToken, getAdminUser } from "@/lib/admin-api";
import OverviewTab from "./OverviewTab";
import RSVPsTab from "./RSVPsTab";
import EventsTab from "./EventsTab";
import VenueTab from "./VenueTab";
import GalleryTab from "./GalleryTab";
import MessagesTab from "./MessagesTab";
import SettingsTab from "./SettingsTab";
import EmailListTab from "./EmailListTab";
import GiftRecordsTab from "./GiftRecordsTab";
import GiftAuditLogTab from "./GiftAuditLogTab";
import UsersTab from "./UsersTab";
import ContactsTab from "./ContactsTab";
import QRCodeTab from "./QRCodeTab";
import PaymentSettingsTab from "./PaymentSettingsTab";
import EmailSettingsTab from "./EmailSettingsTab";
import type { DashboardData } from "./types";

interface AdminDashboardProps {
  onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const user = getAdminUser();
  const role = user?.role || "super_admin";
  const isGiftRecorderOnly = role === "gift_recorder";
  const canEditGifts = role === "super_admin" || role === "admin" || role === "gift_recorder";

  const { data, isLoading, refetch } = useQuery<DashboardData>({
    queryKey: ["admin-dashboard"],
    queryFn: () => adminApi("get-dashboard") as Promise<DashboardData>,
    enabled: !isGiftRecorderOnly, // Gift recorder only needs gift data
  });

  const handleLogout = () => { clearAdminToken(); onLogout(); };
  const handleRefresh = useCallback(() => { refetch(); }, [refetch]);

  // ------ Gift recorder gets a stripped-down view ------
  if (isGiftRecorderOnly) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-primary/10 bg-card">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div>
              <h1 className="font-display text-xl text-primary">Gift Records</h1>
              <p className="text-xs text-muted-foreground">Signed in as {user?.name} · Gift Recorder</p>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" size="sm" className="gap-2">
                <a href="/" target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4" /> View Site</a>
              </Button>
              <Button variant="ghost" onClick={handleLogout} className="gap-2 text-muted-foreground"><LogOut className="h-4 w-4" /> Logout</Button>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-6">
          <Tabs defaultValue="gifts">
            <TabsList className="mb-6">
              <TabsTrigger value="gifts" className="gap-2"><Gift className="h-4 w-4" /> Gifts</TabsTrigger>
              <TabsTrigger value="audit" className="gap-2"><History className="h-4 w-4" /> Audit Log</TabsTrigger>
              <TabsTrigger value="contacts" className="gap-2"><Contact className="h-4 w-4" /> Contacts</TabsTrigger>
            </TabsList>
            <TabsContent value="gifts"><GiftRecordsTab canEdit={canEditGifts} /></TabsContent>
            <TabsContent value="audit"><GiftAuditLogTab /></TabsContent>
            <TabsContent value="contacts"><ContactsTab /></TabsContent>
          </Tabs>
        </main>
      </div>
    );
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><p className="text-muted-foreground animate-pulse">Loading dashboard...</p></div>;
  }

  const { rsvps = [], events = [], venue = null, photos = [], settings = null, email_list = [], gift_options = [], gift_payments = [], payment_settings = null, email_settings = null, gift_wall = [] } = data ?? ({} as Partial<DashboardData>);

  type Tab = { value: string; label: string; icon: any; render: () => JSX.Element; superOnly?: boolean };
  const ALL_TABS: Tab[] = [
    { value: "overview", label: "Overview", icon: LayoutDashboard, render: () => <OverviewTab rsvps={rsvps} /> },
    { value: "rsvps", label: "RSVPs", icon: Users, render: () => <RSVPsTab rsvps={rsvps} onRefresh={handleRefresh} /> },
    { value: "events", label: "Events", icon: Calendar, render: () => <EventsTab events={events} onRefresh={handleRefresh} /> },
    { value: "venue", label: "Venue", icon: MapPin, render: () => <VenueTab venue={venue} onRefresh={handleRefresh} /> },
    { value: "gallery", label: "Gallery", icon: Image, render: () => <GalleryTab photos={photos} onRefresh={handleRefresh} /> },
    { value: "messages", label: "Messages", icon: MessageSquare, render: () => <MessagesTab rsvps={rsvps} /> },
    { value: "gifts", label: "Gifts", icon: Gift, render: () => <GiftRecordsTab canEdit={canEditGifts} /> },
    { value: "audit", label: "Audit Log", icon: History, render: () => <GiftAuditLogTab /> },
    { value: "contacts", label: "Contacts", icon: Contact, render: () => <ContactsTab /> },
    { value: "qr", label: "QR Code", icon: QrCode, render: () => <QRCodeTab /> },
    { value: "payment-settings", label: "Payments", icon: CreditCard, render: () => <PaymentSettingsTab settings={payment_settings} onRefresh={handleRefresh} /> },
    { value: "settings", label: "Settings", icon: Settings, render: () => <SettingsTab settings={settings} onRefresh={handleRefresh} /> },
    { value: "email-settings", label: "Notifications", icon: Bell, render: () => <EmailSettingsTab settings={email_settings} onRefresh={handleRefresh} /> },
    { value: "email-list", label: "Email List", icon: Mail, render: () => <EmailListTab subscribers={email_list} onRefresh={handleRefresh} /> },
    { value: "users", label: "Users", icon: Shield, render: () => <UsersTab />, superOnly: true },
  ];

  const ADMIN_TABS = ALL_TABS.filter((t) => !t.superOnly || role === "super_admin");

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-primary/10 bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl text-primary">Wedding Admin</h1>
            {user && <p className="text-xs text-muted-foreground">Signed in as {user.name} · {role}</p>}
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm" className="gap-2">
              <a href="/" target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4" /> View Site</a>
            </Button>
            <Button variant="ghost" onClick={handleLogout} className="gap-2 text-muted-foreground"><LogOut className="h-4 w-4" /> Logout</Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <Tabs defaultValue="overview">
          <TabsList className="mb-6 flex-wrap h-auto gap-1">
            {ADMIN_TABS.map((tab) => {
              const Icon = tab.icon;
              return <TabsTrigger key={tab.value} value={tab.value} className="gap-2"><Icon className="h-4 w-4" /> {tab.label}</TabsTrigger>;
            })}
          </TabsList>
          {ADMIN_TABS.map((tab) => <TabsContent key={tab.value} value={tab.value}>{tab.render()}</TabsContent>)}
        </Tabs>
      </main>
    </div>
  );
}
