import { useState, useEffect } from 'react';
import { useRouter } from '../../context/RouterContext';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContext';
import { StudentResponse } from '../../types/domain';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/Progress';
import {
  ArrowLeft,
  ArrowRight,
  Send,
  Code2,
  Clock,
  CheckCircle2,
  FileText,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  BookOpen,
} from 'lucide-react';

export function AssessmentPage() {
  const { navigate } = useRouter();
  const { user } = useAuth();
  const {
    assessments,
    questions,
    competencies,
    submitAssessment,
    getSubmissionByStudent,
  } = useData();
  const { notify } = useNotification();

  const assessment = assessments[0]; // Baseline Assessment
  const assessmentQuestions = questions.filter((q) =>
    assessment.questionIds.includes(q.id)
  );

  const existingSubmission = getSubmissionByStudent(user.id, assessment.id);

  // Screen modes: 'question' | 'review' | 'submitted'
  const [screenMode, setScreenMode] = useState<'question' | 'review' | 'submitted'>(() => {
    return existingSubmission ? 'submitted' : 'question';
  });

  const [currentIdx, setCurrentIdx] = useState(0);
  const [responses, setResponses] = useState<Record<string, StudentResponse>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync existing or initialize
  useEffect(() => {
    if (existingSubmission) {
      setResponses(existingSubmission.responses);
    } else {
      const initial: Record<string, StudentResponse> = {};
      assessmentQuestions.forEach((q) => {
        initial[q.id] = { questionId: q.id, isAnswered: false };
      });
      setResponses(initial);
    }
  }, [existingSubmission, user.id]);

  const currentQ = assessmentQuestions[currentIdx] || assessmentQuestions[0];
  const isFirstQuestion = currentIdx === 0;
  const isLastQuestion = currentIdx === assessmentQuestions.length - 1;

  const answeredCount = Object.values(responses).filter((r) => r?.isAnswered).length;
  const unansweredCount = assessmentQuestions.length - answeredCount;
  const progressPct = Math.round((answeredCount / assessmentQuestions.length) * 100);

  const handleSelectOption = (optId: string) => {
    setResponses((prev) => ({
      ...prev,
      [currentQ.id]: {
        questionId: currentQ.id,
        selectedOptionId: optId,
        isAnswered: true,
      },
    }));
  };

  const handleClearOption = () => {
    setResponses((prev) => ({
      ...prev,
      [currentQ.id]: {
        questionId: currentQ.id,
        selectedOptionId: undefined,
        isAnswered: false,
      },
    }));
  };

  const handleSubmit = () => {
    setIsSubmitting(true);

    setTimeout(() => {
      const result = submitAssessment(user.id, assessment.id, responses);
      setIsSubmitting(false);
      setScreenMode('submitted');

      notify({
        type: 'success',
        title: 'Assessment Saved Successfully!',
        message: 'Your learning feedback is ready to view.',
      });
    }, 500);
  };

  // 1. SUBMITTED SCREEN (or already submitted view)
  if (screenMode === 'submitted' && existingSubmission) {
    return (
      <div className="max-w-2xl mx-auto py-8 space-y-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-emerald-500 flex items-center justify-center mx-auto shadow-xl shadow-purple-900/30">
          <CheckCircle2 className="w-9 h-9 text-white" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-display">
            Assessment Submitted!
          </h1>
          <p className="text-sm text-[#94A3B8] max-w-md mx-auto leading-relaxed">
            Great job! Your answers were saved safely on {existingSubmission.submittedAt}.
          </p>
        </div>

        {/* Score & Next Step Card */}
        <Card className="bg-[#121520] border-[#2B344D] p-6 text-left max-w-lg mx-auto space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1E2538]">
            <span className="text-xs text-[#94A3B8] font-medium">Your Score:</span>
            <span className="text-2xl font-bold font-mono text-white">
              {existingSubmission.scorePercentage}%
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold text-purple-300 block">
              What to do next:
            </span>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Open your personalized learning feedback to see the topics you understand well and the topics you can practice before the next lesson.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <Button
              variant="primary"
              size="md"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={() => navigate('/student/submission')}
              className="bg-gradient-to-r from-purple-600 to-emerald-600 hover:from-purple-500 hover:to-emerald-500 border-none font-semibold text-xs flex-1"
            >
              View Learning Feedback
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => setScreenMode('review')}
              className="text-xs flex-1"
            >
              Review My Answers
            </Button>
          </div>
        </Card>

        <div className="pt-2">
          <button
            type="button"
            onClick={() => {
              // Reset responses for retake
              const blank: Record<string, StudentResponse> = {};
              assessmentQuestions.forEach((q) => {
                blank[q.id] = { questionId: q.id, isAnswered: false };
              });
              setResponses(blank);
              setCurrentIdx(0);
              setScreenMode('question');
            }}
            className="text-xs text-[#94A3B8] hover:text-white underline cursor-pointer"
          >
            Want to take this assessment again? Click to start a new attempt
          </button>
        </div>
      </div>
    );
  }

  // 2. REVIEW ANSWERS SCREEN BEFORE FINAL SUBMISSION
  if (screenMode === 'review') {
    return (
      <div className="max-w-3xl mx-auto space-y-6 py-4">
        {/* Review Header */}
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => setScreenMode('question')}
            className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-medium cursor-pointer mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Questions</span>
          </button>
          <h1 className="text-2xl font-bold text-white font-display">
            Ready to Submit Your Assessment?
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
            Please check your answers before submitting. You have answered{' '}
            <strong className="text-white">{answeredCount} of {assessmentQuestions.length}</strong> questions.
            {unansweredCount > 0 && (
              <span className="text-amber-300 block mt-1">
                Notice: You still have {unansweredCount} unanswered question{unansweredCount > 1 ? 's' : ''}.
              </span>
            )}
          </p>
        </div>

        {/* Questions Overview List */}
        <div className="space-y-2.5">
          {assessmentQuestions.map((q, idx) => {
            const resp = responses[q.id];
            const isAnswered = !!resp?.isAnswered;
            const selectedOpt = q.options.find((o) => o.id === resp?.selectedOptionId);

            return (
              <div
                key={q.id}
                onClick={() => {
                  setCurrentIdx(idx);
                  setScreenMode('question');
                }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isAnswered
                    ? 'bg-[#121520] border-[#2B344D] hover:border-[#414E73]'
                    : 'bg-[#19151A] border-amber-500/30 hover:border-amber-500/50'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                      isAnswered
                        ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                        : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                    }`}
                  >
                    Q{q.questionNumber}
                  </span>
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-white block truncate">
                      {q.title}
                    </span>
                    <span className="text-[11px] text-[#94A3B8] block truncate">
                      {isAnswered ? `Answered: ${selectedOpt?.text}` : 'Not answered yet'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                      isAnswered
                        ? 'text-emerald-300 bg-emerald-500/10'
                        : 'text-amber-300 bg-amber-500/10'
                    }`}
                  >
                    {isAnswered ? 'Answered' : 'Unanswered'}
                  </span>
                  <span className="text-xs text-purple-400 font-medium">
                    Change →
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Submission Actions */}
        <div className="p-4 rounded-xl bg-[#121520] border border-[#2B344D] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4">
          <Button
            variant="outline"
            size="md"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => setScreenMode('question')}
            className="text-xs"
          >
            Review Question by Question
          </Button>

          <Button
            variant="primary"
            size="md"
            isLoading={isSubmitting}
            rightIcon={<Send className="w-4 h-4" />}
            onClick={handleSubmit}
            className="bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-500 hover:to-orange-500 border-none font-semibold text-xs"
          >
            Confirm & Submit Assessment
          </Button>
        </div>
      </div>
    );
  }

  // 3. MAIN QUESTION BY QUESTION SCREEN (One Question at a Time)
  const currentComp = competencies.find((c) => c.id === currentQ.competencyId);
  const selectedOptId = responses[currentQ.id]?.selectedOptionId;

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-2">
      {/* Top Header & Friendly Instructions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1E2538]">
        <div>
          <span className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider block">
            CS 101 · Baseline Assessment
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-white font-display">
            {assessment.title}
          </h1>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Choose the answer that seems best. You can change your answers anytime before submitting.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setScreenMode('review')}
          className="text-xs text-purple-300 hover:text-white px-3 py-1.5 rounded-lg bg-[#191E2E] border border-[#2B344D] self-start sm:self-auto cursor-pointer"
        >
          Review All Answers ({answeredCount}/{assessmentQuestions.length})
        </button>
      </div>

      {/* Progress Indicator */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-[#94A3B8]">
          <span className="font-semibold text-white">
            Question {currentQ.questionNumber} of {assessmentQuestions.length}
          </span>
          <span className="font-mono">
            {answeredCount} of {assessmentQuestions.length} answered ({progressPct}%)
          </span>
        </div>
        <ProgressBar
          value={progressPct}
          showPercent={false}
          size="sm"
          variant="purple"
        />
      </div>

      {/* Active Question Card */}
      <Card className="bg-[#121520] border-[#2B344D] p-5 sm:p-7 space-y-6 shadow-lg shadow-black/30">
        {/* Question Topic & Prompt */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
              Topic: {currentComp?.name || 'Computer Science'}
            </span>
            {selectedOptId && (
              <button
                type="button"
                onClick={handleClearOption}
                className="text-[11px] text-[#94A3B8] hover:text-white cursor-pointer"
              >
                Clear my answer
              </button>
            )}
          </div>

          <h2 className="text-base sm:text-lg font-bold text-white leading-snug">
            {currentQ.prompt}
          </h2>
        </div>

        {/* Code Snippet Box (if present) */}
        {currentQ.codeSnippet && (
          <div className="rounded-xl border border-[#2B344D] bg-[#0B0D13] overflow-hidden">
            <div className="flex items-center justify-between px-3.5 py-1.5 border-b border-[#1E2538] bg-[#0E111B] text-[11px] text-[#94A3B8] font-mono">
              <div className="flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-purple-400" />
                <span>Code Example</span>
              </div>
              <span>Java / C++</span>
            </div>
            <pre className="p-4 text-xs font-mono text-white leading-relaxed overflow-x-auto selection:bg-purple-600/30 whitespace-pre">
              <code>{currentQ.codeSnippet}</code>
            </pre>
          </div>
        )}

        {/* Large, Easy-to-Click Answer Choices */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
            Choose One Answer:
          </label>

          <div className="space-y-2.5">
            {currentQ.options.map((opt, optIdx) => {
              const letter = String.fromCharCode(65 + optIdx); // A, B, C, D
              const isSelected = selectedOptId === opt.id;

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectOption(opt.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 text-xs sm:text-sm leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 ${
                    isSelected
                      ? 'bg-purple-950/40 border-purple-500 shadow-md shadow-purple-900/20 text-white'
                      : 'bg-[#161B29] border-[#2B344D] hover:border-[#414E73] hover:bg-[#191E2E] text-[#DCE3EE]'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-purple-500 text-white'
                        : 'bg-[#1E2538] text-[#94A3B8]'
                    }`}
                  >
                    {letter}
                  </span>
                  <span className="flex-1 pt-0.5">{opt.text}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="pt-4 border-t border-[#1E2538] flex items-center justify-between gap-3">
          <Button
            variant="outline"
            size="md"
            disabled={isFirstQuestion}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
            className="text-xs"
          >
            Previous
          </Button>

          <div className="flex items-center gap-2.5">
            {!isLastQuestion ? (
              <Button
                variant="primary"
                size="md"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                onClick={() =>
                  setCurrentIdx((i) => Math.min(assessmentQuestions.length - 1, i + 1))
                }
                className="text-xs font-semibold"
              >
                Next Question
              </Button>
            ) : (
              <Button
                variant="primary"
                size="md"
                rightIcon={<Send className="w-4 h-4" />}
                onClick={() => setScreenMode('review')}
                className="bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-500 hover:to-orange-500 border-none font-semibold text-xs"
              >
                Review & Submit
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
