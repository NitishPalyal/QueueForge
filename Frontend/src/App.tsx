import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { queryClient } from './shared/lib/queryClient';
import { Layout } from './shared/components/Layout';
import { ProtectedRoute } from './features/auth/components/ProtectedRoute';
import { LoginForm } from './features/auth/components/LoginForm';
import { RegisterForm } from './features/auth/components/RegisterForm';
import { Dashboard } from './features/dashboard/Dashboard';
import { JobList } from './features/jobs/components/JobList';
import { SingleJobCreateForm } from './features/jobs/components/SingleJobCreateForm';
import { BatchList } from './features/batches/components/BatchList';
import { BatchCreateForm } from './features/batches/components/BatchCreateForm';
import { AnalyticsPage } from './features/benchmarks/components/AnalyticsPage';
import './shared/styles/tokens.css';

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" theme="dark" richColors closeButton />
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />

          {/* Protected Application Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/jobs" element={<JobList />} />
              <Route path="/create-job" element={<SingleJobCreateForm />} />
              <Route path="/batches" element={<BatchList />} />
              <Route path="/create-batch" element={<BatchCreateForm />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;