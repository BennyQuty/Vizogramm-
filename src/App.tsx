import { RouterProvider, useRouter } from './context/RouterContext';
import { DataProvider } from './context/DataContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { AIConfigProvider } from './context/AIConfigContext';
import { AppShell } from './components/layout/AppShell';

// Pages
import { LoginPage } from './pages/LoginPage';
import { StudentHomePage } from './pages/student/StudentHomePage';
import { AssessmentPage } from './pages/student/AssessmentPage';
import { SubmissionPage } from './pages/student/SubmissionPage';
import { DashboardPage } from './pages/instructor/DashboardPage';
import { AssessmentsPage } from './pages/instructor/AssessmentsPage';
import { AnalyticsPage } from './pages/instructor/AnalyticsPage';
import { RecommendationsPage } from './pages/instructor/RecommendationsPage';
import { StudentsPage } from './pages/instructor/StudentsPage';
import { AdminAiConfigPage } from './pages/admin/AdminAiConfigPage';

function RouteSwitch() {
  const { currentPath } = useRouter();
  const { role } = useAuth();

  // Match routes
  if (currentPath === '/login') {
    return <LoginPage />;
  }

  // Admin routes
  if (currentPath === '/admin/ai-config' || currentPath === '/admin') {
    return <AdminAiConfigPage />;
  }

  // Student routes
  if (currentPath === '/student/home' || currentPath === '/student') {
    return <StudentHomePage />;
  }
  if (currentPath === '/student/assessment') {
    return <AssessmentPage />;
  }
  if (currentPath === '/student/submission') {
    return <SubmissionPage />;
  }

  // Instructor routes
  if (currentPath === '/instructor/dashboard') {
    return <DashboardPage />;
  }
  if (currentPath === '/instructor/assessments') {
    return <AssessmentsPage />;
  }
  if (currentPath === '/instructor/analytics') {
    return <AnalyticsPage />;
  }
  if (currentPath === '/instructor/recommendations') {
    return <RecommendationsPage />;
  }
  if (currentPath === '/instructor/students') {
    return <StudentsPage />;
  }

  // Default fallback based on role
  if (role === 'admin') {
    return <AdminAiConfigPage />;
  }
  if (role === 'student') {
    return <StudentHomePage />;
  }
  return <DashboardPage />;
}

export default function App() {
  return (
    <RouterProvider>
      <DataProvider>
        <AuthProvider>
          <AIConfigProvider>
            <NotificationProvider>
              <AppShell>
                <RouteSwitch />
              </AppShell>
            </NotificationProvider>
          </AIConfigProvider>
        </AuthProvider>
      </DataProvider>
    </RouterProvider>
  );
}
