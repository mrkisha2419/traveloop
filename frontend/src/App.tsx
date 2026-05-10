import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { AdminDashboard } from "@/pages/AdminDashboard";
import { AuthPage } from "@/pages/AuthPage";
import { BudgetDashboard } from "@/pages/BudgetDashboard";
import { CreateTrip } from "@/pages/CreateTrip";
import { Dashboard } from "@/pages/Dashboard";
import { DiscoverPage } from "@/pages/DiscoverPage";
import { ExpenseTracking } from "@/pages/ExpenseTracking";
import { ItineraryBuilder } from "@/pages/ItineraryBuilder";
import { ItineraryView } from "@/pages/ItineraryView";
import { MyTrips } from "@/pages/MyTrips";
import { PackingChecklist } from "@/pages/PackingChecklist";
import { PublicSharePage } from "@/pages/PublicSharePage";
import { SettingsPage } from "@/pages/SettingsPage";
import { TripNotes } from "@/pages/TripNotes";

export function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/share/:shareSlug" element={<PublicSharePage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="create-trip" element={<CreateTrip />} />
          <Route path="trips" element={<MyTrips />} />
          <Route path="discover" element={<DiscoverPage />} />
          <Route path="itinerary" element={<ItineraryBuilder />} />
          <Route path="itinerary-view" element={<ItineraryView />} />
          <Route path="budget" element={<BudgetDashboard />} />
          <Route path="expenses" element={<ExpenseTracking />} />
          <Route path="packing" element={<PackingChecklist />} />
          <Route path="notes" element={<TripNotes />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>
      <Route element={<ProtectedRoute adminOnly />}>
        <Route element={<AppLayout />}>
          <Route path="admin" element={<AdminDashboard />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
