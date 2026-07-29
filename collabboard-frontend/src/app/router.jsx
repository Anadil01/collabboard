import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import { useAuthStore } from "../store/auth.store";

const Login = lazy(() => import("../pages/Login"));
const Signup = lazy(() => import("../pages/Signup"));
const LandingPage = lazy(() => import("../pages/LandingPage"));
const Dashboard = lazy(() => import("../pages/Dashboard"));
const Board = lazy(() => import("../pages/Board"));
const NotFound = lazy(() => import("../pages/NotFound"));
const InfoPages = lazy(() => import("../pages/InfoPages"));
const PrivacyPolicy = lazy(() => import("../pages/PrivacyPolicy"));
const Terms = lazy(() => import("../pages/Terms"));
const RefundPolicy = lazy(() => import("../pages/RefundPolicy"));
const ShippingPolicy = lazy(() => import("../pages/ShippingPolicy"));
const Contact = lazy(() => import("../pages/Contact"));
const Pricing = lazy(()=> import("../components/pricing/Pricing"));

function Protected({ children }) {
  const token = useAuthStore(s => s.token);
  return token ? children : <Navigate to="/login" />;
}

function PublicOnly({ children }) {
  const token = useAuthStore((s) => s.token);
  return token ? <Navigate to="/dashboard" replace /> : children;
}

export default function Router() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="p-6 text-sm text-slate-500">Loading...</div>}>
        <Routes>

          <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
          <Route path="/signup" element={<PublicOnly><Signup /></PublicOnly>} />
          <Route path="/" element={<LandingPage />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/help" element={<InfoPages />} />
          <Route path="/docs" element={<InfoPages />} />
          <Route path="/refunds" element={<RefundPolicy />} />
          <Route path="/shipping" element={<ShippingPolicy />} />
          <Route path="/shortcuts" element={<InfoPages />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/pricing" element={<Pricing />} />

          <Route element={
            <Protected>
              <AppLayout />
            </Protected>
          }>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/board/:id" element={<Board />} />
          </Route>

          <Route path="*" element={<NotFound />} />

        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
