import { useEffect, type ReactNode } from "react";
import { HashRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { StoreProvider, useStore } from "./lib/store";
import { ToastHost } from "./components/ui";
import Shell from "./components/Shell";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import CandidatePortal from "./pages/CandidatePortal";
import Dashboard from "./pages/Dashboard";
import Candidates from "./pages/Candidates";
import Documents from "./pages/Documents";
import Approvals from "./pages/Approvals";
import Offers from "./pages/Offers";
import Engagement from "./pages/Engagement";
import { SettingsPage, TemplatesPage, UsersPage } from "./pages/Settings";
import Billing from "./pages/Billing";
import PlatformAdmin from "./pages/PlatformAdmin";

function Protected({ children }: { children: ReactNode }) {
  const { user } = useStore();
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function Toasts() {
  const { toasts, dismissToast } = useStore();
  return <ToastHost toasts={toasts} onDismiss={dismissToast} />;
}

export default function App() {
  return (
    <StoreProvider>
      <HashRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/portal/:token" element={<CandidatePortal />} />
          <Route path="/app" element={<Protected><Shell /></Protected>}>
            <Route index element={<Dashboard />} />
            <Route path="candidates" element={<Candidates />} />
            <Route path="candidates/:id" element={<Candidates />} />
            <Route path="documents" element={<Documents />} />
            <Route path="approvals" element={<Approvals />} />
            <Route path="offers" element={<Offers />} />
            <Route path="engagement" element={<Engagement />} />
            <Route path="templates" element={<TemplatesPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="billing" element={<Billing />} />
            <Route path="admin" element={<PlatformAdmin />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toasts />
      </HashRouter>
    </StoreProvider>
  );
}
