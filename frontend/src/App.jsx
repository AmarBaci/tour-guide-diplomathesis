import React from 'react';
import { 
  BrowserRouter, 
  Routes, 
  Route, 
  Navigate
} from "react-router-dom";
import { ToastProvider } from './context/ToastContext';
import { DarkModeProvider } from './context/DarkModeContext';
import RootLayout from "./components/RootLayout";
import LandingPage from "./pages/LandingPage";
import SelectAccount from "./pages/SelectAccount";
import AuthLayout from './components/AuthLayout';
import DashboardLayout from './components/DashboardLayout'; // NEW LAYOUT

// Tourist
import TouristLogin from "./pages/Tourist/Login";
import TouristSignup from "./pages/Tourist/SignUp";
import TouristDashboard from './pages/Tourist/Dashboard';

// Guide
import GuideLogin from "./pages/Guide/Login";
import GuideSignup from "./pages/Guide/SignUp";
import GuideDashboard from "./pages/Guide/Dashboard";
import GuideVerificationPending from "./pages/Guide/VerificationPending";

// Agency Admin
import AgencyAdminLogin from "./pages/AgencyAdmin/Login";
import AgencyAdminSignup from "./pages/AgencyAdmin/SignUp";
import AgencyAdminDashboard from "./pages/AgencyAdmin/Dashboard";
import AgencyVerificationPending from "./pages/AgencyAdmin/VerificationPending";

// Agency Operator
import AgencyOperatorLogin from "./pages/AgencyOperator/Login";
import AgencyOperatorSignup from "./pages/AgencyOperator/SignUp";
import AgencyOperatorDashboard from "./pages/AgencyOperator/Dashboard";

// Ministry Admin
import MinistryAdminLogin from "./pages/Ministry/Login";
import MinistryAdminSignup from "./pages/Ministry/SignUp";
import MinistryAdminDashboard from "./pages/Ministry/Dashboard";

// Platform Admin
import PlatformAdminLogin from "./pages/Platform/Login";
import PlatformAdminSignup from "./pages/Platform/SignUp";
import PlatformAdminDashboard from './pages/Platform/Dashboard';

// Shared Auth
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// Components
import ProtectedRoute from './components/auth/ProtectedRoute';
import Unauthorized from './pages/Unauthorized'; 

function App() {
  return (
    <DarkModeProvider>
    <ToastProvider>
    <BrowserRouter>
      <Routes>
        {/* Public routes WITH header/footer */}
        <Route element={<RootLayout />}>
          <Route index path="/" element={<LandingPage />} />
          <Route path="/select-account" element={<SelectAccount />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
        </Route>

        {/* Auth routes WITHOUT header/footer */}
        <Route element={<AuthLayout />}>
          {/* Tourist Routes */}
          <Route path="/tourist/login" element={<TouristLogin />} />
          <Route path="/tourist/signup" element={<TouristSignup />} />
          
          {/* Guide Routes */}
          <Route path="/guide/login" element={<GuideLogin />} />
          <Route path="/guide/signup" element={<GuideSignup />} />
          <Route path="/guide/verification-pending" element={<GuideVerificationPending />} />
          
          {/* Agency Admin Routes */}
          <Route path="/agency-admin/login" element={<AgencyAdminLogin />} />
          <Route path="/agency-admin/signup" element={<AgencyAdminSignup />} />
          <Route path="/agency-admin/verification-pending" element={<AgencyVerificationPending />} />
          
          {/* Agency Operator Routes */}
          <Route path="/agency-operator/login" element={<AgencyOperatorLogin />} />
          <Route path="/agency-operator/signup" element={<AgencyOperatorSignup />} />
          
          {/* Ministry Admin Routes */}
          <Route path="/ministry-admin/login" element={<MinistryAdminLogin />} />
          <Route path="/ministry-admin/signup" element={<MinistryAdminSignup />} />
          
          {/* Platform Admin Routes */}
          <Route path="/platform-admin/login" element={<PlatformAdminLogin />} />
          <Route path="/platform-admin/signup" element={<PlatformAdminSignup />} />
          
          {/* Universal Auth Routes */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>
        
        {/* DASHBOARD ROUTES WITH NEW LAYOUT */}
        <Route element={<DashboardLayout />}>
          <Route 
            path="/tourist/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['tourist']}>
                <TouristDashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/guide/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['guide']}>
                <GuideDashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/agency-admin/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['agency_admin']}>
                <AgencyAdminDashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/agency-operator/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['agency_operator']}>
                <AgencyOperatorDashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/ministry-admin/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['ministry_admin']}>
                <MinistryAdminDashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/platform-admin/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <PlatformAdminDashboard />
              </ProtectedRoute>
            } 
          />
        </Route>
        
        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </ToastProvider>
    </DarkModeProvider>
  );
}

export default App;