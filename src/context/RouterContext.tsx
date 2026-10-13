import React, { createContext, useContext, useState, useEffect } from 'react';

export type AppRoute =
  | '/login'
  | '/student/home'
  | '/student/assessment'
  | '/student/submission'
  | '/instructor/dashboard'
  | '/instructor/assessments'
  | '/instructor/analytics'
  | '/instructor/recommendations'
  | '/instructor/students';

interface RouterContextType {
  currentPath: string;
  navigate: (path: AppRoute | string) => void;
  queryParams: URLSearchParams;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

export function RouterProvider({ children }: { children: React.ReactNode }) {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    const path = window.location.pathname;
    return path === '/' ? '/instructor/dashboard' : path;
  });

  const [search, setSearch] = useState<string>(() => window.location.search);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/instructor/dashboard');
      setSearch(window.location.search);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: AppRoute | string) => {
    if (path === currentPath) return;
    window.history.pushState({}, '', path);
    const [pathname, queryString] = path.split('?');
    setCurrentPath(pathname);
    setSearch(queryString ? `?${queryString}` : '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const queryParams = new URLSearchParams(search);

  return (
    <RouterContext.Provider value={{ currentPath, navigate, queryParams }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
}
