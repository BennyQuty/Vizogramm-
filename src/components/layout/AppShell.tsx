import React from 'react';
import { Header } from './Header';
import { ToastContainer } from '../ui/Notification';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from '../../context/RouterContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Button';

export interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { role, switchRole } = useAuth();
  const { currentPath, navigate } = useRouter();

  const isLoginPage = currentPath === '/login';

  // Role Separation Check
  const isStudentOnRestrictedRoute =
    role === 'student' && (currentPath.startsWith('/instructor') || currentPath.startsWith('/admin'));

  return (
    <div className="min-h-screen bg-[#0B0D13] text-[#F8FAFC] flex flex-col font-sans">
      {!isLoginPage && <Header />}

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {isStudentOnRestrictedRoute ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8 bg-[#121520] border border-[#2B344D] rounded-xl max-w-xl mx-auto">
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 mb-4">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">
              Staff & Administrator Area Restricted
            </h2>
            <p className="text-xs text-[#94A3B8] leading-relaxed mb-6 max-w-md">
              Student accounts do not have permission to view cohort diagnostics, exam authoring tools, or System Administrator AI engine settings.
            </p>
            <div className="flex items-center gap-3">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<ArrowLeft className="w-4 h-4" />}
                onClick={() => navigate('/student/home')}
              >
                Go to Student Home
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => switchRole('instructor')}
              >
                Switch to Instructor Role
              </Button>
            </div>
          </div>
        ) : (
          children
        )}
      </main>

      <footer className="w-full border-t border-[#1E2538] bg-[#0B0D13] py-4 text-xs text-[#64748B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#94A3B8]">Vizogramm</span>
            <span>·</span>
            <span>AI Post-Exam Diagnostic Architecture for Introductory CS</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>WCAG 2.2 AA Validated</span>
            <span>·</span>
            <span>Fall 2026 CS 101 Cohort</span>
          </div>
        </div>
      </footer>

      <ToastContainer />
    </div>
  );
}
