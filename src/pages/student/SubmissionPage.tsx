import { useState } from 'react';
import { useRouter } from '../../context/RouterContext';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  Sparkles,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  RotateCcw,
  Code2,
  HelpCircle,
  Smile,
  CheckCircle,
  XCircle,
  Lightbulb,
} from 'lucide-react';

export function SubmissionPage() {
  const { navigate } = useRouter();
  const { user } = useAuth();
  const {
    assessments,
    questions,
    competencies,
    getSubmissionByStudent,
    getStudentProfile,
  } = useData();

  const [activeTab, setActiveTab] = useState<'feedback' | 'questions'>('feedback');

  const assessment = assessments[0];
  const submission = getSubmissionByStudent(user.id, assessment.id);
  const profile = getStudentProfile(user.id);

  // If no submission yet
  if (!submission) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-6">
        <div className="w-14 h-14 rounded-2xl bg-[#121520] border border-[#2B344D] flex items-center justify-center mx-auto text-[#94A3B8]">
          <BookOpen className="w-7 h-7" />
        </div>
        <div className="space-y-1.5">
          <h1 className="text-xl sm:text-2xl font-bold text-white font-display">
            No Assessment Submitted Yet
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] max-w-md mx-auto leading-relaxed">
            Take the baseline assessment to receive personalized learning feedback showing what you know and what to practice next.
          </p>
        </div>
        <div>
          <Button
            variant="primary"
            size="md"
            rightIcon={<ArrowRight className="w-4 h-4" />}
            onClick={() => navigate('/student/assessment')}
          >
            Start Baseline Assessment
          </Button>
        </div>
      </div>
    );
  }

  // Calculate friendly categories from real competency profile
  const understoodWell: { name: string; message: string }[] = [];
  const canPractice: { name: string; message: string; isUncertain?: boolean }[] = [];

  if (profile) {
    competencies.forEach((comp) => {
      const detail = profile.competencies[comp.id];
      if (!detail) return;

      if (detail.status === 'Mastered') {
        understoodWell.push({
          name: comp.name,
          message: `You showed solid understanding of ${comp.name.toLowerCase()} (${detail.questionsCorrect} of ${detail.questionsAttempted} correct). Keep up the great work!`,
        });
      } else if (detail.status === 'Insufficient Evidence') {
        canPractice.push({
          name: comp.name,
          message: `We need a little more information before we can give complete feedback on ${comp.name.toLowerCase()}. You can review this topic with your instructor or try a practice example.`,
          isUncertain: true,
        });
      } else {
        // Shaky or Critical Gap
        canPractice.push({
          name: comp.name,
          message: `${comp.name} may need a little extra practice. Working through a few simple examples will help build your confidence before the next lesson.`,
        });
      }
    });
  }

  const scorePct = submission.scorePercentage;

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-2">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1E2538]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white font-display">
              My Learning Feedback
            </h1>
            <Smile className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Personal feedback for {submission.studentName} on {assessment.title}.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          onClick={() => navigate('/student/assessment')}
          className="self-start sm:self-auto text-xs"
        >
          Retake Assessment
        </Button>
      </div>

      {/* Encouraging Score Card */}
      <div className="p-5 rounded-2xl bg-[#121520] border border-[#2B344D] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider block">
            Assessment Complete
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-white">
            {scorePct >= 80
              ? 'Awesome Job! You have a great foundation.'
              : scorePct >= 60
              ? 'Good Effort! A few topics will be fun to practice.'
              : 'Thank you for finishing! Here is where we can help you grow.'}
          </h2>
          <p className="text-xs text-[#94A3B8]">
            Score: <strong className="text-white font-mono">{scorePct}%</strong> ({submission.rawScore} of {submission.maxScore} points).
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Feedback Ready</span>
          </span>
        </div>
      </div>

      {/* Simple Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#1E2538] pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('feedback')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            activeTab === 'feedback'
              ? 'bg-[#191E2E] text-white border border-[#3A4565]'
              : 'text-[#94A3B8] hover:text-white'
          }`}
        >
          Learning Summary & Practice
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('questions')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            activeTab === 'questions'
              ? 'bg-[#191E2E] text-white border border-[#3A4565]'
              : 'text-[#94A3B8] hover:text-white'
          }`}
        >
          Review Questions & Answers (10 Items)
        </button>
      </div>

      {/* TAB 1: 3 SIMPLE STUDENT-FRIENDLY SECTIONS */}
      {activeTab === 'feedback' && (
        <div className="space-y-6">
          {/* SECTION A: What You Understand Well */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-300">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <h3>What You Understand Well</h3>
            </div>

            {understoodWell.length > 0 ? (
              <div className="space-y-2.5">
                {understoodWell.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1 text-xs"
                  >
                    <span className="font-semibold text-emerald-200 block text-xs sm:text-sm">
                      {item.name}
                    </span>
                    <p className="text-[#94A3B8] leading-relaxed">
                      {item.message}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[#121520] border border-[#2B344D] text-xs text-[#94A3B8]">
                Every programmer starts somewhere! Review the practice topics below to start building your foundation.
              </div>
            )}
          </div>

          {/* SECTION B: What You Can Practice */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-amber-300">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <h3>What You Can Practice</h3>
            </div>

            {canPractice.length > 0 ? (
              <div className="space-y-2.5">
                {canPractice.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-amber-200 block text-xs sm:text-sm">
                        {item.name}
                      </span>
                      {item.isUncertain && (
                        <span className="text-[10px] text-[#94A3B8] font-mono">
                          More Practice Needed
                        </span>
                      )}
                    </div>
                    <p className="text-[#94A3B8] leading-relaxed">
                      {item.message}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[#121520] border border-[#2B344D] text-xs text-[#94A3B8]">
                You answered almost everything correctly! You are ready to move on to next week's lesson.
              </div>
            )}
          </div>

          {/* SECTION C: Your Next Steps */}
          <div className="p-5 rounded-2xl bg-[#161B29] border border-purple-500/30 space-y-3 text-xs">
            <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h3>Your Next Steps</h3>
            </div>

            <ul className="space-y-2 text-[#DCE3EE] list-disc list-inside">
              <li>
                Take a look at the questions below to see how each answer was explained.
              </li>
              {canPractice.length > 0 && (
                <li>
                  Review simple examples for <strong>{canPractice[0].name}</strong> before next class.
                </li>
              )}
              <li>
                If you have questions, ask Dr. Rebecca Vance or your TAs during lab time. They are always happy to help!
              </li>
            </ul>

            <div className="pt-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setActiveTab('questions')}
                className="text-xs"
              >
                Review My 10 Questions Now →
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: QUESTION BY QUESTION REVIEW (Simple & Non-Intimidating) */}
      {activeTab === 'questions' && (
        <div className="space-y-3.5">
          <p className="text-xs text-[#94A3B8]">
            Here is what you selected for each question, along with a helpful explanation:
          </p>

          {questions
            .filter((q) => assessment.questionIds.includes(q.id))
            .map((q) => {
              const resp = submission.responses[q.id];
              const isAnswered = !!resp && resp.isAnswered;
              const isCorrect = isAnswered && resp.selectedOptionId === q.correctOptionId;
              const selectedOpt = q.options.find((o) => o.id === resp?.selectedOptionId);
              const correctOpt = q.options.find((o) => o.id === q.correctOptionId);

              return (
                <div
                  key={q.id}
                  className={`p-4 rounded-xl border transition-all text-xs space-y-2.5 ${
                    isCorrect
                      ? 'bg-emerald-950/15 border-emerald-500/30'
                      : !isAnswered
                      ? 'bg-[#151720] border-zinc-500/30'
                      : 'bg-amber-950/15 border-amber-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white">
                          Question {q.questionNumber}
                        </span>
                        <span className="text-[#94A3B8]">·</span>
                        <span className="text-white font-medium">{q.title}</span>
                      </div>
                      <p className="text-[#94A3B8]">{q.prompt}</p>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold shrink-0 ${
                        isCorrect
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : !isAnswered
                          ? 'bg-zinc-500/20 text-zinc-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {isCorrect ? 'Correct ✓' : !isAnswered ? 'Unanswered' : 'Review this'}
                    </span>
                  </div>

                  {q.codeSnippet && (
                    <pre className="p-2.5 bg-black/40 rounded-lg text-xs font-mono text-white/90 overflow-x-auto whitespace-pre">
                      <code>{q.codeSnippet}</code>
                    </pre>
                  )}

                  <div className="space-y-1 pt-1 border-t border-white/5">
                    <div className="flex items-start gap-2">
                      <span className="text-[#94A3B8] font-medium w-24 shrink-0">Your Answer:</span>
                      <span className={isCorrect ? 'text-emerald-300' : 'text-amber-300'}>
                        {selectedOpt ? selectedOpt.text : 'Left Unanswered'}
                      </span>
                    </div>

                    {!isCorrect && (
                      <div className="flex items-start gap-2">
                        <span className="text-[#94A3B8] font-medium w-24 shrink-0">Best Answer:</span>
                        <span className="text-emerald-300 font-medium">
                          {correctOpt?.text}
                        </span>
                      </div>
                    )}

                    <div className="flex items-start gap-2 pt-1 text-[11px] text-[#94A3B8]">
                      <span className="font-medium text-white w-24 shrink-0">Why:</span>
                      <span className="leading-relaxed">{q.explanation}</span>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
