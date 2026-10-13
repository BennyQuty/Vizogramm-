import { useRouter } from '../../context/RouterContext';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  Sparkles,
  BookOpen,
  CheckCircle2,
  Clock,
  ArrowRight,
  HelpCircle,
  FileText,
  Smile,
  GraduationCap,
} from 'lucide-react';

export function StudentHomePage() {
  const { navigate } = useRouter();
  const { user } = useAuth();
  const { assessments, submissions, getSubmissionByStudent } = useData();

  const assessment = assessments[0]; // CS1 Baseline Assessment
  const submission = getSubmissionByStudent(user.id, assessment.id);

  // Student first name
  const firstName = user.name.split(' ')[0] || 'Student';

  // Derived status
  const isSubmitted = !!submission;
  const scorePct = submission?.scorePercentage ?? null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-2">
      {/* A. Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#191E2E] via-[#151928] to-[#121520] border border-[#2B344D]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-white font-display">
              Welcome back, {firstName}!
            </span>
            <Smile className="w-5 h-5 text-amber-400 shrink-0" />
          </div>
          <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
            Ready to learn something new? Here is what you need to do next in{' '}
            <span className="text-purple-300 font-medium">CS 101: Introduction to Computer Science</span>.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0B0D13]/70 border border-[#2B344D] text-xs text-[#94A3B8] shrink-0">
          <GraduationCap className="w-4 h-4 text-purple-400" />
          <span>{user.section || 'CS 101'}</span>
        </div>
      </div>

      {/* B. Main Action Card — "What do I need to do next?" */}
      <Card className="bg-[#121520] border-purple-500/40 p-6 sm:p-7 relative overflow-hidden shadow-lg shadow-black/40">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider block">
                Primary Activity
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                {isSubmitted
                  ? 'Your Learning Feedback Is Ready!'
                  : 'Your Baseline Assessment Is Ready'}
              </h2>
            </div>

            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border self-start sm:self-auto ${
                isSubmitted
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  : 'bg-purple-500/10 text-purple-300 border-purple-500/30'
              }`}
            >
              {isSubmitted ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Feedback Ready</span>
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5 text-purple-400" />
                  <span>Ready to Start</span>
                </>
              )}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed max-w-2xl">
            {isSubmitted
              ? `You finished the baseline assessment with a score of ${scorePct}%. We've prepared friendly feedback showing what you understand well and what you can practice next.`
              : 'This assessment has 10 friendly questions about variables, conditions, and loops. It helps your instructor understand what you already know before class begins.'}
          </p>

          {/* Quick Details Badges */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-[#94A3B8] pt-1">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#191E2E] border border-[#2B344D]">
              <FileText className="w-3.5 h-3.5 text-purple-400" />
              <span>{assessment.questionIds.length} Questions</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#191E2E] border border-[#2B344D]">
              <Clock className="w-3.5 h-3.5 text-orange-400" />
              <span>{assessment.durationMinutes} Minutes (No Rush)</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#191E2E] border border-[#2B344D]">
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span>{assessment.courseName}</span>
            </div>
          </div>

          {/* Single Clear Primary Action Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {isSubmitted ? (
              <>
                <Button
                  variant="primary"
                  size="lg"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  onClick={() => navigate('/student/submission')}
                  className="bg-gradient-to-r from-purple-600 to-emerald-600 hover:from-purple-500 hover:to-emerald-500 border-none font-semibold text-sm shadow-md"
                >
                  View My Learning Feedback
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/student/assessment')}
                  className="text-xs"
                >
                  Review My Answers
                </Button>
              </>
            ) : (
              <Button
                variant="primary"
                size="lg"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                onClick={() => navigate('/student/assessment')}
                className="bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-500 hover:to-orange-500 border-none font-semibold text-sm shadow-md"
              >
                Start Assessment
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* C. Progress Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Completed */}
        <div className="p-4 rounded-xl bg-[#121520] border border-[#2B344D] space-y-1">
          <span className="text-xs text-[#94A3B8] font-medium block">
            Assessments Completed
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-white">
              {isSubmitted ? '1' : '0'}
            </span>
            <span className="text-xs text-[#94A3B8]">of 1 total</span>
          </div>
          <p className="text-[11px] text-[#64748B]">
            {isSubmitted ? 'All caught up for this week!' : '1 ready to complete'}
          </p>
        </div>

        {/* Tasks Remaining */}
        <div className="p-4 rounded-xl bg-[#121520] border border-[#2B344D] space-y-1">
          <span className="text-xs text-[#94A3B8] font-medium block">
            Assessments Remaining
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-white">
              {isSubmitted ? '0' : '1'}
            </span>
            <span className="text-xs text-[#94A3B8]">to do</span>
          </div>
          <p className="text-[11px] text-[#64748B]">
            {isSubmitted ? 'No pending assessments' : 'Due Oct 20, 2026'}
          </p>
        </div>

        {/* Learning Feedback */}
        <div className="p-4 rounded-xl bg-[#121520] border border-[#2B344D] space-y-1">
          <span className="text-xs text-[#94A3B8] font-medium block">
            Learning Feedback
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-sm font-bold text-emerald-400">
              {isSubmitted ? 'Ready to View' : 'Available After Submission'}
            </span>
          </div>
          <p className="text-[11px] text-[#64748B]">
            {isSubmitted ? 'Click to see practice tips' : 'Personalized tips for you'}
          </p>
        </div>
      </div>

      {/* D. Clear Next Step Guidance Box */}
      <div className="p-4 rounded-xl bg-[#161B29] border border-[#2B344D] flex items-start gap-3 text-xs leading-relaxed">
        <Sparkles className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-white block">
            Your Next Step:
          </span>
          <p className="text-[#94A3B8]">
            {isSubmitted
              ? 'Check out "My Progress" to see topics you understand well and what you can practice next.'
              : 'Click "Start Assessment" when you have 30–45 minutes in a quiet place. Do your best and do not worry if you do not know every answer!'}
          </p>
        </div>
      </div>

      {/* Instructor Support Footnote */}
      <div className="p-4 rounded-xl bg-[#0B0D13] border border-[#1E2538] flex items-center justify-between text-xs text-[#94A3B8]">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-purple-400 shrink-0" />
          <span>Need help? Dr. Rebecca Vance and your course TAs are here to assist.</span>
        </div>
        <span className="text-[11px] font-mono text-[#64748B] hidden sm:inline">
          Office Hours: Mon/Wed 2–4 PM
        </span>
      </div>
    </div>
  );
}
