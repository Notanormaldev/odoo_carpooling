import React, { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Loader } from 'lucide-react';
import '@maptiler/sdk/dist/maptiler-sdk.css';
import useAuthStore from './store/authStore';

// Components
import ProtectedRoute from './components/ProtectedRoute';

// Views
import LoginView from './views/LoginView';
import SignupView from './views/SignupView';
import VerifyOtpView from './views/VerifyOtpView';
import GoogleSuccessHandler from './views/GoogleSuccessHandler';

// Layout
import MainLayout from './layouts/MainLayout';

export default function App() {
  const { loadUser, loading } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-[#e85d4a]" />
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginView />} />
          <Route path="/signup" element={<SignupView />} />
          <Route path="/verify-otp" element={<VerifyOtpView />} />
          <Route path="/auth/google/success" element={<GoogleSuccessHandler />} />
          <Route path="/*" element={<ProtectedRoute><MainLayout /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </>
  );
}
