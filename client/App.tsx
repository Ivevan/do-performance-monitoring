import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/features/auth/context/AuthContext";
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import LandingPage from "./pages/LandingPage.tsx";
import NotFound from "./pages/NotFound.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Workspaces from "./pages/Workspaces.tsx";
import SettingsPage from "./pages/SettingsPage.tsx";
import ManageRoles from "./pages/ManageRoles.tsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Prevents layout reloading when users Alt-Tab or switch windows
      refetchOnReconnect: false,   // Prevents background requests when internet reconnects
      refetchOnMount: false,       // Serves cached data instantly if it is already in memory
      staleTime: 1000 * 60 * 10,   // Mark data as fresh for 10 minutes (prevents double fetches on navigate)
      gcTime: 1000 * 60 * 30,      // Keep inactive queries in memory for 30 minutes
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/dashboard" element={<ProtectedRoute><Workspaces /></ProtectedRoute>} />
              <Route path="/dashboard/roles" element={<ProtectedRoute><ManageRoles /></ProtectedRoute>} />
              <Route path="/dashboard/cy/:year" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/dashboard/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
