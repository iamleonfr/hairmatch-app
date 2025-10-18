import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './Layout';
import { AuthProvider } from './contexts/AuthContext';
import Discover from './Pages/Discover';
import MyProfile from './Pages/MyProfile';
import Favorites from './Pages/Favorites';
import BarberProfile from './Pages/BarberProfile';
import BarberOnboarding from './Pages/BarberOnboarding';
import ManageMyBarberProfile from './Pages/ManageMyBarberProfile';
import Admin from './Pages/Admin';
import SignIn from './Pages/SignIn';
import Login from './Pages/Login';
import Signup from './Pages/Signup';
import './index.css';

const queryClient = new QueryClient();

function AppRoutes() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Discover />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/barber" element={<BarberProfile />} />
        <Route path="/barber-profile" element={<BarberProfile />} />
        <Route path="/my-profile" element={<MyProfile />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/barber-onboarding" element={<BarberOnboarding />} />
        <Route path="/manage-barber" element={<ManageMyBarberProfile />} />
        <Route path="/admin" element={<Admin />} />
  <Route path="/signin" element={<SignIn />} />
  <Route path="/login" element={<Login />} />
  <Route path="/signup" element={<Signup />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
