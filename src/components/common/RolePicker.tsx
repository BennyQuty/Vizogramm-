import React from 'react';
import { Logo } from '../Logo';
import { AIModelConfig, Section, UserRole } from '../../types';
import {
  GraduationCap,
  Users,
  Shield,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface RolePickerProps {
  sections: Section[];
  aiConfig: AIModelConfig;
  onSelectRole: (role: UserRole) => void;
}

export const RolePicker: React.FC<RolePickerProps> = ({
  sections,
  aiConfig,
  onSelectRole,
}) => {
  const isAiConnected = aiConfig.status === 'connected';
  const isAiError = aiConfig.status === 'error';
  const hasSections = sections.length > 0;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center p-6 relative">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#9d62ff]/10 via-transparent to-transparent" />

      <div className="max-w-4xl w-full z-10 space-y-10 my-auto">
        {/* App Logo & Heading */}
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-2">
            <Logo size="lg" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
            Select Your Role
          </h1>
          <p className="text-sm text-[#94a3b8] max-w-lg mx-auto">
            Computing baseline readiness diagnostic and cohort pacing platform. One tap enters that role — no password required.
          </p>
        </div>

        {/* Three Large Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Student */}
          <button
            type="button"
            onClick={() => onSelectRole('student')}
            className="brilliant-card text-left p-6 rounded-2xl border border-[#2c2c3d] hover:border-[#456dff] transition-all flex flex-col justify-between group cursor-pointer shadow-[0_4px_0_0_#3152c9] hover:-translate-y-1"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-[#456dff]/15 text-[#85a3ff] flex items-center justify-center border border-[#456dff]/30 group-hover:scale-105 transition-transform">
                  <Users className="w-6 h-6" />
                </div>

                {/* Status chip */}
                {hasSections ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                    <CheckCircle2 className="w-3 h-3" /> Test available
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1e1e28] text-[#94a3b8] border border-[#303042] text-[11px] font-semibold">
                    <Clock className="w-3 h-3" /> Not available yet
                  </span>
                )}
              </div>

              <div>
                <h2 className="text-xl font-bold text-white group-hover:text-[#85a3ff] transition-colors">
                  Student
                </h2>
                <p className="text-xs text-[#94a3b8] mt-2 leading-relaxed">
                  Take the school's OLSAT-style baseline entrance assessment. Confidentially view your personal readiness summary upon submission.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#232332] flex items-center justify-between text-xs font-bold text-[#85a3ff] group-hover:text-white">
              <span>Enter Student Portal</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Card 2: Instructor */}
          <button
            type="button"
            onClick={() => onSelectRole('instructor')}
            className="brilliant-card text-left p-6 rounded-2xl border border-[#2c2c3d] hover:border-[#9d62ff] transition-all flex flex-col justify-between group cursor-pointer shadow-[0_4px_0_0_#874de5] hover:-translate-y-1"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-[#9d62ff]/15 text-[#caa3ff] flex items-center justify-center border border-[#9d62ff]/30 group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-6 h-6" />
                </div>

                {/* Status chip */}
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#9d62ff]/15 text-[#caa3ff] border border-[#9d62ff]/30 text-[11px] font-bold">
                  Sections: {sections.length}
                </span>
              </div>

              <div>
                <h2 className="text-xl font-bold text-white group-hover:text-[#caa3ff] transition-colors">
                  Instructor
                </h2>
                <p className="text-xs text-[#94a3b8] mt-2 leading-relaxed">
                  Review student baseline readiness, analyze the class heatmap, test reasoning hypotheses live, and decide cohort pacing adjustments.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#232332] flex items-center justify-between text-xs font-bold text-[#caa3ff] group-hover:text-white">
              <span>Open Instructor Dashboard</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Card 3: System Administrator */}
          <button
            type="button"
            onClick={() => onSelectRole('admin')}
            className="brilliant-card text-left p-6 rounded-2xl border border-[#2c2c3d] hover:border-[#ff8d23] transition-all flex flex-col justify-between group cursor-pointer shadow-[0_4px_0_0_#e77a16] hover:-translate-y-1"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-[#ff8d23]/15 text-[#ffb066] flex items-center justify-center border border-[#ff8d23]/30 group-hover:scale-105 transition-transform">
                  <Shield className="w-6 h-6" />
                </div>

                {/* Status chip */}
                {isAiConnected ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                    <CheckCircle2 className="w-3 h-3" /> AI model: Connected
                  </span>
                ) : isAiError ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 text-[11px] font-bold">
                    <AlertCircle className="w-3 h-3" /> AI model: Error
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[11px] font-bold">
                    <Clock className="w-3 h-3" /> AI model: Not configured
                  </span>
                )}
              </div>

              <div>
                <h2 className="text-xl font-bold text-white group-hover:text-[#ffb066] transition-colors">
                  System Administrator
                </h2>
                <p className="text-xs text-[#94a3b8] mt-2 leading-relaxed">
                  Configure live generative AI endpoints (Gemini / OpenRouter / Custom), test connection latency, tune system prompts, and reset demo data.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#232332] flex items-center justify-between text-xs font-bold text-[#ffb066] group-hover:text-white">
              <span>AI Configuration & System</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>

        {/* Guided setup banner */}
        <div className="p-4 rounded-xl bg-[#111116] border border-[#232330] flex items-center justify-between text-xs text-[#94a3b8]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#9d62ff] shrink-0" />
            <span>
              <strong>60-Second Demo Flow:</strong> Setup AI Model & Instructor Section → Switch to Student to take test → Switch back to Instructor to inspect live AI analysis!
            </span>
          </div>
          <span className="text-[11px] text-[#64748b]">Click any card above to proceed</span>
        </div>
      </div>
    </div>
  );
};
