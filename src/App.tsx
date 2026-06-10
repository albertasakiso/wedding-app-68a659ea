import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import Index from "./pages/Index";
import { useIsWeddingDayOrPast } from "./hooks/useSiteSettings";
import { toast } from "@/hooks/use-toast";

const RSVP = lazy(() => import("./pages/RSVP"));
const Gallery = lazy(() => import("./pages/Gallery"));
const Gifts = lazy(() => import("./pages/Gifts"));
const Admin = lazy(() => import("./pages/Admin"));
const MyDay = lazy(() => import("./pages/MyDay"));
const QrLanding = lazy(() => import("./pages/QrLanding"));
const CheckIn = lazy(() => import("./pages/CheckIn"));
const Programme = lazy(() => import("./pages/Programme"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const RedirectHandler = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const redirect = sessionStorage.getItem("redirect");
    if (redirect) {
      sessionStorage.removeItem("redirect");
      navigate(redirect, { replace: true });
    }
  }, [navigate]);

  return <>{children}</>;
};

const RouteFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
      <p className="text-sm text-muted-foreground font-body tracking-wider uppercase">Loading…</p>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <RedirectHandler>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/rsvp" element={<RsvpRouteGate />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/gifts" element={<Gifts />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/my-day" element={<MyDay />} />
              <Route path="/qr" element={<QrLanding />} />
              <Route path="/check-in" element={<CheckIn />} />
              <Route path="/programme" element={<Programme />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </RedirectHandler>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

const RsvpRouteGate = () => {
  const closed = useIsWeddingDayOrPast();
  useEffect(() => {
    if (closed) toast({ title: "RSVPs are closed", description: "See you at the celebration!" });
  }, [closed]);
  if (closed) return <Navigate to="/" replace />;
  return <RSVP />;
};

export default App;
