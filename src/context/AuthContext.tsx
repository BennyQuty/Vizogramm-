import { createContext, useContext, useState, ReactNode } from 'react';
import { useRouter } from './RouterContext';
import { User, UserRole } from '../types/domain';
import { DEMO_USERS } from '../data/seedData';

interface AuthContextType {
  role: UserRole;
  user: User;
  switchRole: (newRole: UserRole) => void;
  setUserById: (userId: string) => void;
  login: (email: string, chosenRole?: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { currentPath, navigate } = useRouter();
  const [user, setUser] = useState<User>(() => DEMO_USERS[0]); // default to Dr. Rebecca Vance (instructor)
  const [role, setRole] = useState<UserRole>(user.role);

  const setUserById = (userId: string) => {
    const found = DEMO_USERS.find((u) => u.id === userId);
    if (!found) return;

    setUser(found);
    setRole(found.role);

    if (found.role === 'student' && (currentPath.startsWith('/instructor') || currentPath.startsWith('/admin'))) {
      navigate('/student/home');
    } else if (found.role === 'instructor' && (currentPath.startsWith('/student') || currentPath.startsWith('/admin'))) {
      navigate('/instructor/dashboard');
    } else if (found.role === 'admin') {
      navigate('/admin/ai-config');
    }
  };

  const switchRole = (newRole: UserRole) => {
    if (newRole === 'instructor') {
      const inst = DEMO_USERS.find((u) => u.role === 'instructor') || DEMO_USERS[0];
      setUser(inst);
      setRole('instructor');
      if (currentPath.startsWith('/student')) {
        navigate('/instructor/dashboard');
      }
    } else if (newRole === 'student') {
      const stu = DEMO_USERS.find((u) => u.role === 'student') || DEMO_USERS[1];
      setUser(stu);
      setRole('student');
      if (currentPath.startsWith('/instructor') || currentPath.startsWith('/admin')) {
        navigate('/student/home');
      }
    } else {
      const admin = DEMO_USERS.find((u) => u.role === 'admin') || DEMO_USERS[DEMO_USERS.length - 1];
      setUser(admin);
      setRole('admin');
      navigate('/admin/ai-config');
    }
  };

  const login = (email: string, chosenRole?: UserRole) => {
    const found = DEMO_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      setUser(found);
      setRole(found.role);
      if (found.role === 'student') navigate('/student/home');
      else if (found.role === 'admin') navigate('/admin/ai-config');
      else navigate('/instructor/dashboard');
      return;
    }

    // Fallback if custom email
    const targetRole = chosenRole || 'student';
    const fallbackUser: User = {
      id: `user-custom-${Date.now()}`,
      name: email.split('@')[0],
      email,
      role: targetRole,
      avatarInitials: email.substring(0, 2).toUpperCase(),
      section: 'Section A (Prof. Vance)',
    };
    setUser(fallbackUser);
    setRole(targetRole);
    if (targetRole === 'student') navigate('/student/home');
    else navigate('/instructor/dashboard');
  };

  const logout = () => {
    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        role,
        user,
        switchRole,
        setUserById,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
