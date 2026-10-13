import { useState } from 'react';
import { useRouter, AppRoute } from '../../context/RouterContext';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContext';
import { DEMO_USERS } from '../../data/seedData';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import {
  Menu,
  X,
  UserCheck,
  GraduationCap,
  Sparkles,
  RotateCcw,
  BookOpen,
  ChevronDown,
  Shield,
  Layers,
  HelpCircle,
  Cpu,
} from 'lucide-react';

export function Header() {
  const { currentPath, navigate } = useRouter();
  const { role, user, setUserById } = useAuth();
  const { resetDemoData } = useData();
  const { notify } = useNotification();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [demoGuideOpen, setDemoGuideOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  const adminNav: { label: string; path: AppRoute }[] = [
    { label: 'AI Diagnostic Engine', path: '/admin/ai-config' },
    { label: 'Overview', path: '/instructor/dashboard' },
    { label: 'Assessments', path: '/instructor/assessments' },
    { label: 'Cohort Diagnostics', path: '/instructor/analytics' },
    { label: 'Interventions', path: '/instructor/recommendations' },
    { label: 'Student Roster', path: '/instructor/students' },
  ];

  const instructorNav: { label: string; path: AppRoute }[] = [
    { label: 'Overview', path: '/instructor/dashboard' },
    { label: 'Assessments', path: '/instructor/assessments' },
    { label: 'Cohort Diagnostics', path: '/instructor/analytics' },
    { label: 'Interventions', path: '/instructor/recommendations' },
    { label: 'Student Roster', path: '/instructor/students' },
  ];

  const studentNav: { label: string; path: AppRoute }[] = [
    { label: 'Home', path: '/student/home' },
    { label: 'My Assessments', path: '/student/assessment' },
    { label: 'My Progress', path: '/student/submission' },
  ];

  const navItems = role === 'admin' ? adminNav : role === 'instructor' ? instructorNav : studentNav;

  const handleNavClick = (path: AppRoute) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const handleSwitchAccount = (userId: string) => {
    setUserById(userId);
    setAccountMenuOpen(false);
    const targetUser = DEMO_USERS.find((u) => u.id === userId);
    notify({
      type: 'info',
      title: `Switched Persona to ${targetUser?.name}`,
      message: `Role: ${targetUser?.role.toUpperCase()} · Connected records updated in real time.`,
    });
  };

  const handleConfirmReset = () => {
    resetDemoData();
    setResetConfirmOpen(false);
    notify({
      type: 'success',
      title: 'Demo Dataset Restored',
      message: 'Initial demo accounts, submissions, diagnostics, and recommendations reset successfully.',
    });
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#0B0D13]/95 backdrop-blur-md border-b border-[#1E2538]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            {/* Zone 1: Brand Wordmark */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => navigate(role === 'student' ? '/student/home' : '/instructor/dashboard')}
                className="flex items-center gap-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded-md cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-orange-500 flex items-center justify-center shadow-md shadow-purple-900/30">
                  <Sparkles className="w-4 h-4 text-white" aria-hidden="true" />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold tracking-tight text-white font-display whitespace-nowrap">
                    Vizogramm
                  </span>
                </div>
              </button>
            </div>

            {/* Zone 2: Role-Specific Single-Line Navigation (Desktop) */}
            <nav
              aria-label="Primary navigation"
              className="hidden md:flex items-center gap-1 lg:gap-2 text-xs font-medium text-[#94A3B8]"
            >
              {navItems.map((item) => {
                const isActive = currentPath === item.path;
                return (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => handleNavClick(item.path)}
                    className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 ${
                      isActive
                        ? 'bg-[#191E2E] text-[#F8FAFC] border border-[#2B344D]'
                        : 'hover:text-[#F8FAFC] hover:bg-[#161B29] border border-transparent'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Zone 3: Demo Tools, Account Switcher & Role CTA */}
            <div className="flex items-center gap-2 shrink-0">
              {/* AI Diagnostic Engine Shortcut */}
              <button
                type="button"
                onClick={() => navigate('/admin/ai-config')}
                title="System Administrator: Configure Gemini AI API Key & Models"
                className={`inline-flex items-center gap-1.5 h-8 px-2.5 text-[11px] font-medium rounded-lg border transition-colors cursor-pointer ${
                  currentPath === '/admin/ai-config'
                    ? 'border-sky-400 bg-sky-500/20 text-sky-200 ring-1 ring-sky-400'
                    : 'border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300'
                }`}
              >
                <Cpu className="w-3.5 h-3.5 text-sky-400" />
                <span className="hidden sm:inline">AI Engine API</span>
              </button>

              {/* Scenarios Guide Button */}
              <button
                type="button"
                onClick={() => setDemoGuideOpen(true)}
                title="Open Live Demonstration Scenarios Guide"
                className="hidden lg:inline-flex items-center gap-1.5 h-8 px-2.5 text-[11px] font-medium rounded-lg border border-purple-500/40 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 transition-colors cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Demo Scenarios</span>
              </button>

              {/* Reset Demo Data Button */}
              <button
                type="button"
                onClick={() => setResetConfirmOpen(true)}
                title="Reset all demo data to baseline state"
                className="hidden xl:inline-flex items-center gap-1 h-8 px-2 text-[11px] font-medium rounded-lg border border-[#2B344D] bg-[#121520] hover:bg-[#191E2E] text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>

              {/* Persona Quick Switcher Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setAccountMenuOpen((prev) => !prev)}
                  className="inline-flex items-center gap-2 h-9 px-3 text-xs font-medium rounded-lg border border-[#2B344D] bg-[#121520] hover:bg-[#191E2E] text-[#F8FAFC] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
                  aria-expanded={accountMenuOpen}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      role === 'instructor'
                        ? 'bg-purple-900 text-purple-300 border border-purple-400'
                        : role === 'admin'
                        ? 'bg-emerald-900 text-emerald-300 border border-emerald-400'
                        : 'bg-orange-900 text-orange-300 border border-orange-400'
                    }`}
                  >
                    {user.avatarInitials}
                  </div>
                  <span className="max-w-[110px] truncate hidden sm:inline">
                    {user.name.split(' ')[0]} {user.name.split(' ')[1] || ''}
                  </span>
                  <ChevronDown className="w-3 h-3 text-[#94A3B8]" />
                </button>

                {accountMenuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-72 rounded-xl bg-[#121520] border border-[#2B344D] shadow-2xl z-50 p-2 space-y-1 animate-in fade-in duration-100"
                  >
                    <div className="px-2.5 py-1.5 border-b border-[#1E2538] text-[11px] text-[#94A3B8]">
                      <span>Active: <strong className="text-white">{user.name}</strong></span>
                      <span className="block text-[#64748B] font-mono">{user.email}</span>
                    </div>

                    <div className="pt-1 text-[10px] font-bold text-[#64748B] px-2.5 uppercase tracking-wider">
                      Switch Demo Persona
                    </div>

                    {DEMO_USERS.map((demoUser) => {
                      const isSelected = demoUser.id === user.id;
                      return (
                        <button
                          key={demoUser.id}
                          type="button"
                          onClick={() => handleSwitchAccount(demoUser.id)}
                          className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-[#191E2E] text-white border border-[#3A4565]'
                              : 'text-[#94A3B8] hover:bg-[#161B29] hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span
                              className={`w-4 h-4 rounded text-[9px] font-bold flex items-center justify-center shrink-0 ${
                                demoUser.role === 'instructor'
                                  ? 'bg-purple-950 text-purple-300'
                                  : demoUser.role === 'admin'
                                  ? 'bg-emerald-950 text-emerald-300'
                                  : 'bg-orange-950 text-orange-300'
                              }`}
                            >
                              {demoUser.avatarInitials}
                            </span>
                            <span className="truncate">{demoUser.name}</span>
                          </div>
                          <span className="text-[10px] font-mono text-[#64748B] capitalize ml-1 shrink-0">
                            {demoUser.role}
                          </span>
                        </button>
                      );
                    })}

                    <div className="pt-2 border-t border-[#1E2538] space-y-1">
                      <button
                        type="button"
                        onClick={() => {
                          setAccountMenuOpen(false);
                          setDemoGuideOpen(true);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-purple-300 hover:bg-[#161B29] flex items-center gap-1.5 cursor-pointer"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>View All 8 Demo Scenarios</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAccountMenuOpen(false);
                          navigate('/login');
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-[#94A3B8] hover:bg-[#161B29] cursor-pointer"
                      >
                        Sign Out / Custom Login
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                aria-label="Toggle navigation"
                className="md:hidden p-1.5 rounded-lg border border-[#2B344D] bg-[#121520] text-[#94A3B8] hover:text-white cursor-pointer"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#1E2538] bg-[#0E111B] px-4 py-3 space-y-2">
            <div className="pb-2 border-b border-[#1E2538] text-xs text-[#94A3B8] flex items-center justify-between">
              <span>Persona: <strong className="text-white capitalize">{user.name}</strong></span>
              <button
                type="button"
                onClick={() => setDemoGuideOpen(true)}
                className="text-purple-400 font-medium"
              >
                Demo Scenarios
              </button>
            </div>
            {navItems.map((item) => {
              const isActive = currentPath === item.path;
              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => handleNavClick(item.path)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#191E2E] text-white border border-[#2B344D]'
                      : 'text-[#94A3B8] hover:bg-[#161B29] hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* Demo Scenarios Modal */}
      <Dialog
        isOpen={demoGuideOpen}
        onClose={() => setDemoGuideOpen(false)}
        title="Vizogramm Live Demonstration Scenarios Guide"
        description="Jump directly into preconfigured real-world assessment, diagnostic, and pacing workflows."
        maxWidth="lg"
        footer={
          <Button variant="secondary" size="sm" onClick={() => setDemoGuideOpen(false)}>
            Close Guide
          </Button>
        }
      >
        <div className="space-y-3 text-xs">
          <p className="text-[#94A3B8] leading-relaxed">
            All scenarios operate on the same connected data model. Use the one-click jump buttons below to demonstrate different real-world conditions:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-xl border border-[#2B344D] bg-[#161B29] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">Scenario A: Strong Mastery</span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">90% Mastered</span>
              </div>
              <p className="text-[#94A3B8]">
                Student Demo 003 (Maya Patel) scored 90% across 5 CS competencies.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => {
                  handleSwitchAccount('user-stu-003');
                  setDemoGuideOpen(false);
                  navigate('/student/submission');
                }}
              >
                Inspect Maya's Report →
              </Button>
            </div>

            <div className="p-3 rounded-xl border border-[#2B344D] bg-[#161B29] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">Scenario B: Repeated Misconception</span>
                <span className="text-[10px] font-mono text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded">Critical Gap</span>
              </div>
              <p className="text-[#94A3B8]">
                Student Demo 001 (Alex Chen) repeatedly failed conditional boundaries & De Morgan rules.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => {
                  handleSwitchAccount('user-stu-001');
                  setDemoGuideOpen(false);
                  navigate('/student/submission');
                }}
              >
                Inspect Alex's Misconceptions →
              </Button>
            </div>

            <div className="p-3 rounded-xl border border-[#2B344D] bg-[#161B29] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">Scenario C: Careless Slip</span>
                <span className="text-[10px] font-mono text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded">80% Solid</span>
              </div>
              <p className="text-[#94A3B8]">
                Student Demo 004 (Elena Rostova) has strong adjacent mastery, with 1 isolated modulo slip.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => {
                  handleSwitchAccount('user-stu-004');
                  setDemoGuideOpen(false);
                  navigate('/student/submission');
                }}
              >
                Inspect Elena's Report →
              </Button>
            </div>

            <div className="p-3 rounded-xl border border-[#2B344D] bg-[#161B29] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">Scenario D: Unanswered Questions</span>
                <span className="text-[10px] font-mono text-zinc-400 bg-zinc-500/10 px-1.5 py-0.5 rounded">Insufficient Evidence</span>
              </div>
              <p className="text-[#94A3B8]">
                Student Demo 005 (Jordan Lee) left 3 loop items blank. System refuses to assume misunderstanding.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => {
                  handleSwitchAccount('user-stu-005');
                  setDemoGuideOpen(false);
                  navigate('/student/submission');
                }}
              >
                Inspect Insufficient Evidence →
              </Button>
            </div>

            <div className="p-3 rounded-xl border border-[#2B344D] bg-[#161B29] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">Scenario E & F: Pacing Interventions</span>
                <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">Instructor Decisions</span>
              </div>
              <p className="text-[#94A3B8]">
                View AI pacing recommendations awaiting review, plus modified and approved decisions.
              </p>
              <Button
                variant="primary"
                size="sm"
                className="w-full text-xs"
                onClick={() => {
                  handleSwitchAccount('user-inst-vance');
                  setDemoGuideOpen(false);
                  navigate('/instructor/recommendations');
                }}
              >
                Review Pacing Recommendations →
              </Button>
            </div>

            <div className="p-3 rounded-xl border border-red-500/30 bg-[#1A1215] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-rose-300">Scenario H: Failed AI & Retry</span>
                <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded">Gateway Error</span>
              </div>
              <p className="text-[#94A3B8]">
                Student Demo 002 (Marcus Vance) analysis failed with preserved submission. Instructor can click Retry!
              </p>
              <Button
                variant="destructive"
                size="sm"
                className="w-full text-xs"
                onClick={() => {
                  handleSwitchAccount('user-inst-vance');
                  setDemoGuideOpen(false);
                  navigate('/instructor/students');
                }}
              >
                Go to Roster & Retry Marcus →
              </Button>
            </div>
          </div>
        </div>
      </Dialog>

      {/* Reset Confirmation Dialog */}
      <Dialog
        isOpen={resetConfirmOpen}
        onClose={() => setResetConfirmOpen(false)}
        title="Reset All Demonstration Records?"
        description="This will restore all student assessment submissions, diagnostic analyses, and instructor pacing decisions to the initial baseline demo state."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setResetConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={handleConfirmReset}>
              Confirm Reset Data
            </Button>
          </>
        }
      >
        <p className="text-xs text-[#94A3B8] leading-relaxed">
          Are you sure you want to restore the demo dataset? Any assessments submitted or recommendations modified during the current presentation session will be reverted to the seed state.
        </p>
      </Dialog>
    </>
  );
}
