import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { PermissionErrorModal } from "@/components/ui/PermissionErrorModal";
import { useAnalytics } from "@/hooks/useAnalytics";
import ScrollToTop from "@/components/layout/ScrollToTop";
import { InteractionTracker } from "@/components/analytics/InteractionTracker";
import Landing from "./pages/Landing";
import Work from "./pages/Work";
import Onboarding from "./pages/Onboarding";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import AppDashboard from "./pages/AppDashboard";
import History from "./pages/History";
import Settings from "./pages/Settings";
import Pricing from "./pages/Pricing";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";
import UserAnalytics from "./pages/UserAnalytics";
import AdminDashboard from "./pages/AdminDashboard";

const queryClient = new QueryClient();

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

// Analytics tracker component
const AnalyticsTracker = () => {
  const location = useLocation();
  const { trackPageView, syncLocalQueue } = useAnalytics();
  const { user } = useAuth();

  // Track page views
  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname, trackPageView]);

  // Sync local analytics queue when user logs in
  useEffect(() => {
    if (user) {
      syncLocalQueue();
    }
  }, [user, syncLocalQueue]);

  return null;
};

const AppRoutes = () => (
  <>
    <ScrollToTop />
    <AnalyticsTracker />
    <InteractionTracker />
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/work" element={<Work />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/history"
        element={
          <ProtectedRoute>
            <History />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/analytics"
        element={
          <ProtectedRoute>
            <UserAnalytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <PermissionErrorModal />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
