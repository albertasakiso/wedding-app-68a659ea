import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import RSVP from "./pages/RSVP";
import Gallery from "./pages/Gallery";
import Gifts from "./pages/Gifts";
import Admin from "./pages/Admin";
import MyDay from "./pages/MyDay";
import QrLanding from "./pages/QrLanding";
import CheckIn from "./pages/CheckIn";
import NotFound from "./pages/NotFound";

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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <RedirectHandler>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/rsvp" element={<RSVP />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/gifts" element={<Gifts />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/my-day" element={<MyDay />} />
            <Route path="/qr" element={<QrLanding />} />
            <Route path="/check-in" element={<CheckIn />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </RedirectHandler>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
