import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import Dashboard from "./pages/Dashboard";
import SleepPage from "./pages/Sleep";
import HydrationPage from "./pages/Hydration";
import CardioPage from "./pages/Cardio";
import SupplementsPage from "./pages/Supplements";
import FoodPage from "./pages/Food";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/sleep" element={<SleepPage />} />
          <Route path="/hydration" element={<HydrationPage />} />
          <Route path="/cardio" element={<CardioPage />} />
          <Route path="/supplements" element={<SupplementsPage />} />
          <Route path="/food" element={<FoodPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <BottomNav />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
