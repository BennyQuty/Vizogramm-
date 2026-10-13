import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { DEMO_USERS } from '../data/seedData';
import { useNotification } from '../context/NotificationContext';
import {
  Sparkles,
  GraduationCap,
  UserCheck,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { TextInput, FormField } from '../components/ui/FormControls';

export function LoginPage() {
  const { login, setUserById } = useAuth();
  const { notify } = useNotification();

  const [email, setEmail] = useState('instructor@vizogramm.demo');
  const [password, setPassword] = useState('demo123');
  const [isLoading, setIsLoading] = useState(false);

  const handleQuickLogin = (userId: string) => {
    const targetUser = DEMO_USERS.find((u) => u.id === userId);
    if (!targetUser) return;

    setUserById(userId);
    notify({
      type: 'success',
      title: `Logged in as ${targetUser.name}`,
      message: `Role: ${targetUser.role.toUpperCase()} · Connected demo environment active.`,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      login(email);
      notify({
        type: 'success',
        title: 'Logged In Successfully',
        message: 'Welcome to Vizogramm Diagnostic Platform',
      });
      setIsLoading(false);
    }, 300);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-6">
      <div className="w-full max-w-xl bg-[#121520] border border-[#2B344D] rounded-2xl p-6 sm:p-8 shadow-2xl relative space-y-6">
        {/* Brand Lockup */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-orange-500 shadow-lg shadow-purple-900/30 mb-3">
            <Sparkles className="w-6 h-6 text-white" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-display">
            Vizogramm
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1 max-w-sm mx-auto">
            AI-powered post-assessment diagnostic platform for introductory Computer Science students and instructors.
          </p>
        </div>

        {/* 1-Click Demo Accounts Strip */}
        <div className="p-4 bg-[#0B0D13] border border-[#2B344D] rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white">
              Instant Demo Access (1-Click Login)
            </span>
            <span className="text-[11px] font-mono text-purple-400">
              Password: demo123
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Instructor */}
            <button
              type="button"
              onClick={() => handleQuickLogin('user-inst-vance')}
              className="p-2.5 rounded-lg border border-purple-500/40 bg-purple-500/10 hover:bg-purple-500/20 text-left transition-colors cursor-pointer flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-200">
                  <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
                  <span>Dr. Rebecca Vance</span>
                </div>
                <span className="text-[10px] text-[#94A3B8] block font-mono">
                  instructor@vizogramm.demo
                </span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
            </button>

            {/* Student Demo 001 */}
            <button
              type="button"
              onClick={() => handleQuickLogin('user-stu-001')}
              className="p-2.5 rounded-lg border border-orange-500/40 bg-orange-500/10 hover:bg-orange-500/20 text-left transition-colors cursor-pointer flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-orange-200">
                  <UserCheck className="w-3.5 h-3.5 text-orange-400" />
                  <span>Alex Chen (Student 001)</span>
                </div>
                <span className="text-[10px] text-[#94A3B8] block font-mono">
                  Repeated Misconceptions
                </span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-orange-400" />
            </button>

            {/* Student Demo 003 */}
            <button
              type="button"
              onClick={() => handleQuickLogin('user-stu-003')}
              className="p-2.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-left transition-colors cursor-pointer flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Maya Patel (Student 003)</span>
                </div>
                <span className="text-[10px] text-[#94A3B8] block font-mono">
                  90% Mastered Profile
                </span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
            </button>

            {/* Student Demo 007 - Fresh live test */}
            <button
              type="button"
              onClick={() => handleQuickLogin('user-stu-007')}
              className="p-2.5 rounded-lg border border-[#2B344D] bg-[#161B29] hover:bg-[#191E2E] text-left transition-colors cursor-pointer flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                  <UserCheck className="w-3.5 h-3.5 text-[#94A3B8]" />
                  <span>David Kim (Student 007)</span>
                </div>
                <span className="text-[10px] text-purple-300 block font-mono">
                  Ready to Take Assessment Live
                </span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        </div>

        {/* Manual Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <FormField label="Demo University Email" htmlFor="login-email">
            <TextInput
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </FormField>

          <FormField label="Password" htmlFor="login-password">
            <TextInput
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </FormField>

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full mt-2"
            isLoading={isLoading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Sign In with Credentials
          </Button>
        </form>

        {/* Footer Notes */}
        <div className="pt-3 border-t border-[#1E2538] text-[11px] text-[#64748B] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Demonstration mode: Role-based separation active. Students access assessment workflows; instructors access cohort heatmaps and pacing recommendations.
          </span>
        </div>
      </div>
    </div>
  );
}
