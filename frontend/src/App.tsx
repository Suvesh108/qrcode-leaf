import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import PublicLayout from './components/layout/PublicLayout';
import { TemplateProvider } from './TemplateContext';

// Lazy load views for better performance
const LandingView = lazy(() => import('./views/LandingView'));
const GeneratorView = lazy(() => import('./views/GeneratorView'));
const DashboardView = lazy(() => import('./views/DashboardView'));
const TemplatesView = lazy(() => import('./views/TemplatesView'));
const DocsView = lazy(() => import('./views/DocsView'));
const PricingView = lazy(() => import('./views/PricingView'));
const LoginView = lazy(() => import('./views/LoginView'));
const SignupView = lazy(() => import('./views/SignupView'));

// Placeholder views for others
const EmptyView = ({ title }: { title: string }) => (
  <div className="flex-1 flex items-center justify-center bg-surface">
    <div className="text-center space-y-4">
      <h1 className="text-4xl font-bold text-text-primary tracking-tight">{title}</h1>
      <p className="text-text-secondary">This section is currently under development.</p>
    </div>
  </div>
);

// Guarded route for Admin access only
function AdminRoute({ children }: { children: React.ReactNode }) {
  const userStr = localStorage.getItem('leafqr_user');
  let isAdmin = false;
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      isAdmin = user?.role === 'admin';
    } catch (e) {
      isAdmin = false;
    }
  }
  return isAdmin ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <TemplateProvider>
      <BrowserRouter>
        <Suspense fallback={
          <div className="h-screen w-screen flex items-center justify-center bg-surface">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-secondary/20 border-t-secondary rounded-full animate-spin" />
              <p className="text-sm font-mono font-medium text-secondary animate-pulse">Initializing System...</p>
            </div>
          </div>
        }>
          <Routes>
            {/* Public Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingView />} />
              <Route path="/pricing" element={<PricingView />} />
              <Route path="/docs" element={<DocsView />} />
              <Route path="/login" element={<LoginView />} />
              <Route path="/signup" element={<SignupView />} />
            </Route>

            {/* App Routes */}
            <Route element={<AppLayout />}>
              <Route 
                path="/dashboard" 
                element={
                  <AdminRoute>
                    <DashboardView />
                  </AdminRoute>
                } 
              />
              <Route path="/generator" element={<GeneratorView />} />
              <Route path="/collections" element={<TemplatesView />} />
              <Route path="/analytics" element={<EmptyView title="Detailed Analytics" />} />
              <Route path="/settings" element={<EmptyView title="Account Settings" />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TemplateProvider>
  );
}
