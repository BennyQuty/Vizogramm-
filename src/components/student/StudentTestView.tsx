import React, { useState } from 'react';
import { AssessmentItem, StudentProfileData, StudentSubmission } from '../../types';
import { ITEM_BANK } from '../../data/itemBank';
import { computeScores } from '../../utils/scoring';
import { Storage } from '../../utils/storage';
import { runCourseRecommendation, runStudentDiagnosis } from '../../utils/aiClient';
import { Logo } from '../Logo';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  HelpCircle,
  Send,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Info,
} from 'lucide-react';

interface StudentTestViewProps {
  profile: StudentProfileData;
  onDone: () => void;
  onSwitchRole: () => void;
}

export const StudentTestView: React.FC<StudentTestViewProps> = ({
  profile,
  onDone,
  onSwitchRole,
}) => {
  const [testStarted, setTestStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D' | 'E'>>({});
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const currentItem = ITEM_BANK[currentIndex];
  const totalItems = ITEM_BANK.length;
  const answeredCount = Object.keys(answers).length;

  const handleSelectOption = (key: 'A' | 'B' | 'C' | 'D' | 'E') => {
    setAnswers((prev) => ({ ...prev, [currentItem.id]: key }));
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    const { scores, categories } = computeScores(answers);

    const submissionId = 'sub_' + Math.random().toString(36).substring(2, 9);
    const completedSubmission: StudentSubmission = {
      id: submissionId,
      studentId: profile.userId,
      studentName: `${profile.firstName} ${profile.lastName}`,
      studentNumber: profile.studentNumber,
      sectionId: profile.sectionId,
      classCode: profile.classCode,
      status: 'submitted',
      currentQuestionIndex: currentIndex,
      answers,
      submittedAt: new Date().toISOString(),
      scores,
      categories,
      analysisStatus: 'analyzing', // diagnosed in background
    };

    Storage.saveSubmission(completedSubmission);

    // Background AI diagnosis trigger (non-blocking!)
    runStudentDiagnosis(
      completedSubmission.studentName,
      answers,
      scores,
      categories
    ).then((res) => {
      const latestSub = Storage.getSubmissions().find((s) => s.id === submissionId);
      if (latestSub) {
        if (res.success && res.data) {
          latestSub.analysisStatus = 'ready';
          latestSub.diagnosis = res.data;
          latestSub.analyzedAt = new Date().toISOString();
          latestSub.analysisModelUsed = res.model;
          latestSub.analysisLatencyMs = res.latencyMs;
        } else {
          latestSub.analysisStatus = 'error';
          latestSub.analysisError = res.error || 'Diagnostic evaluation failed';
        }
        Storage.saveSubmission(latestSub);
      }
    });

    // Automatic Course Recommender Trigger
    const courseCatalog = Storage.getCourses();
    Storage.saveStudentCourseRecommendation({
      studentId: profile.userId,
      studentName: `${profile.firstName} ${profile.lastName}`,
      sectionId: profile.sectionId,
      recommended_courses: [],
      no_match_skills: [],
      suggested_topics_to_create: [],
      status: 'thinking',
    });

    runCourseRecommendation(completedSubmission, courseCatalog).then((recRes) => {
      if (recRes.success && recRes.data) {
        Storage.saveStudentCourseRecommendation({
          studentId: profile.userId,
          studentName: `${profile.firstName} ${profile.lastName}`,
          sectionId: profile.sectionId,
          recommended_courses: recRes.data.recommended_courses,
          no_match_skills: recRes.data.no_match_skills,
          suggested_topics_to_create: recRes.data.suggested_topics_to_create,
          status: 'ready',
          generatedAt: new Date().toISOString(),
        });
      } else {
        Storage.saveStudentCourseRecommendation({
          studentId: profile.userId,
          studentName: `${profile.firstName} ${profile.lastName}`,
          sectionId: profile.sectionId,
          recommended_courses: [],
          no_match_skills: [],
          suggested_topics_to_create: [],
          status: 'error',
          error: recRes.error || 'Recommendations are unavailable right now',
        });
      }
    });

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  // POST-SUBMISSION DESCRIPTIVE CONFIRMATION SCREEN
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative">
        <div className="max-w-xl w-full z-10 space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-[0_0_24px_rgba(16,185,129,0.2)]">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white">Assessment Submitted</h1>
            <p className="text-xs text-[#94a3b8]">
              Thank you, <strong className="text-white">{profile.firstName} {profile.lastName}</strong> ({profile.studentNumber}).
            </p>
          </div>

          {/* Descriptive result only: no numbers, no categories */}
          <div className="brilliant-card rounded-2xl p-6 border border-[#2b2b3a] text-left space-y-4 shadow-[0_4px_0_0_#3152c9]">
            <div className="flex items-center gap-2 text-xs font-bold text-[#caa3ff] uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Descriptive Baseline Result</span>
            </div>

            <p className="text-sm text-[#cbd5e1] leading-relaxed">
              Your baseline reasoning assessment responses have been securely recorded. Your course instructor (<strong>{profile.instructor}</strong>) will analyze cohort-wide patterns to personalize lecture pacing and programming lab preparation.
            </p>

            <div className="p-3.5 rounded-xl bg-[#0f0f15] border border-[#22222e] text-[11px] text-[#64748b] flex items-center gap-2">
              <Info className="w-4 h-4 text-[#456dff] shrink-0" />
              <span>
                Assessment results are confidential and visible only to your instructor. Individual numerical scores and categorical rankings are withheld from student view.
              </span>
            </div>
          </div>

          {/* Done button: returns to Roadmap */}
          <div>
            <button
              type="button"
              onClick={onDone}
              className="w-full py-4 rounded-2xl bg-[#9333ea] hover:bg-[#a855f7] text-white font-bold text-sm cursor-pointer shadow-[0_4px_0_0_#6b21a8]"
            >
              Done (Return to Roadmap)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // TEST INSTRUCTION SCREEN (Before starting item 1)
  if (!testStarted) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        {/* Header */}
        <header className="border-b border-[#242430] bg-[#0c0c10] px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Logo size="sm" />
            <button
              onClick={onSwitchRole}
              className="btn-ghost px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Switch Role
            </button>
          </div>
        </header>

        <main className="flex-1 max-w-2xl w-full mx-auto p-6 md:p-8 my-auto flex flex-col justify-center">
          <div className="brilliant-card rounded-2xl p-8 border border-[#2e2e3e] shadow-[0_4px_0_0_#3152c9] space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#85a3ff] px-2.5 py-1 rounded bg-[#456dff]/15 border border-[#456dff]/30 inline-block">
                OLSAT-Style Adaptation (Short Form)
              </span>
              <h1 className="text-2xl font-bold text-white">
                Entrance Diagnostic Assessment
              </h1>
              <p className="text-xs text-[#94a3b8] leading-relaxed">
                This diagnostic helps your instructor plan coursework pacing based on baseline reasoning patterns. It is not an exam grade and will not impact your academic standing.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#14141d] border border-[#262635] space-y-3 text-xs text-[#cbd5e1]">
              <h3 className="font-bold text-white text-xs uppercase tracking-wider">Test Instructions:</h3>
              <ul className="list-disc list-inside space-y-1.5 text-[11px] text-[#94a3b8]">
                <li><strong>24 Questions:</strong> Verbal Comprehension, Verbal Reasoning, Figural Reasoning, and Quantitative Reasoning.</li>
                <li><strong>5 Choices per question:</strong> Select the best single answer (A, B, C, D, or E).</li>
                <li><strong>Pacing:</strong> Proceed at a steady, thoughtful pace. You can navigate between questions freely and review before submitting.</li>
                <li><strong>Figures:</strong> Figural reasoning questions feature inline geometric diagrams.</li>
              </ul>
            </div>

            <div className="p-3 rounded-xl bg-[#0f0f15] border border-[#22222e] text-xs text-[#64748b]">
              Student: <strong className="text-white">{profile.firstName} {profile.lastName}</strong> • Section: <strong className="text-white">{profile.classCode}</strong>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setTestStarted(true)}
                className="btn-blue w-full py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_0_0_#3152c9]"
              >
                <span>Start Assessment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ACTIVE TEST VIEW (Item by Item)
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Top Bar with Progress */}
      <header className="sticky top-0 z-20 bg-[#0d0d12]/90 backdrop-blur-md border-b border-[#242430] px-6 py-3.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onSwitchRole}
              className="px-2.5 py-1.5 rounded-lg bg-[#171720] border border-[#2e2e3e] text-xs text-[#94a3b8] hover:text-white transition-colors"
            >
              Switch Role
            </button>
            <div className="text-xs text-[#94a3b8]">
              Item <span className="font-bold text-white">{currentIndex + 1}</span> of{' '}
              <span className="font-bold text-white">{totalItems}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#94a3b8]">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>{answeredCount} answered</span>
            </div>
            <button
              onClick={() => setShowReviewModal(true)}
              className="btn-purple px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              Review & Submit
            </button>
          </div>
        </div>

        {/* Linear Progress Bar */}
        <div className="max-w-4xl mx-auto mt-2 w-full bg-[#1c1c26] h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-[#456dff] to-[#9d62ff] h-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / totalItems) * 100}%` }}
          />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-8 flex flex-col justify-between">
        <div>
          {/* Item Category pill */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-[#1f1f2e] text-[#85a3ff] border border-[#35354d]">
              {currentItem.cluster}
            </span>
            <span className="text-xs text-[#64748b]">• {currentItem.type}</span>
          </div>

          {/* Item Stem */}
          <div className="mb-6">
            <h2 className="text-lg md:text-xl font-semibold leading-relaxed text-white whitespace-pre-line">
              {currentItem.stem}
            </h2>

            {/* Stem SVG for Figural Questions */}
            {currentItem.stemSvg && (
              <div
                className="mt-5 p-4 rounded-xl bg-[#0f0f15] border border-[#2a2a38] flex justify-center items-center shadow-inner"
                dangerouslySetInnerHTML={{ __html: currentItem.stemSvg }}
              />
            )}
          </div>

          {/* Options List */}
          <div className="space-y-3">
            {currentItem.options.map((opt) => {
              const isSelected = answers[currentItem.id] === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => handleSelectOption(opt.key)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-4 cursor-pointer ${
                    isSelected
                      ? 'bg-[#1b1b2a] border-[#9d62ff] shadow-[0_3px_0_0_#874de5]'
                      : 'bg-[#121217] border-[#272733] hover:border-[#3d3d52] hover:bg-[#161620]'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-[#9d62ff] text-white shadow-sm'
                        : 'bg-[#1f1f28] text-[#94a3b8] border border-[#333345]'
                    }`}
                  >
                    {opt.key}
                  </div>

                  <div className="flex-1 text-sm text-[#e2e8f0]">
                    {opt.text && <span>{opt.text}</span>}
                    {opt.svg && (
                      <div
                        className="py-1 flex justify-center"
                        dangerouslySetInnerHTML={{ __html: opt.svg }}
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Pagination Controls */}
        <div className="mt-10 pt-6 border-t border-[#23232f] flex items-center justify-between">
          <button
            type="button"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            className="btn-ghost px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </button>

          {/* Quick Palette Mini Grid */}
          <div className="hidden md:flex items-center gap-1">
            {ITEM_BANK.map((item, idx) => {
              const answered = Boolean(answers[item.id]);
              const isCurrent = idx === currentIndex;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-5 h-5 rounded text-[10px] font-bold transition-all ${
                    isCurrent
                      ? 'bg-[#9d62ff] text-white ring-2 ring-white/50'
                      : answered
                      ? 'bg-[#456dff] text-white'
                      : 'bg-[#1e1e28] text-[#64748b] hover:bg-[#282836]'
                  }`}
                  title={`Question ${idx + 1}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {currentIndex < totalItems - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentIndex((prev) => Math.min(totalItems - 1, prev + 1))}
              className="btn-purple px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowReviewModal(true)}
              className="btn-orange px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer"
            >
              Finish & Review
              <Send className="w-4 h-4" />
            </button>
          )}
        </div>
      </main>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="brilliant-card w-full max-w-lg rounded-2xl p-6 border border-[#343446] shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Review Your Answers</h3>
            <p className="text-xs text-[#94a3b8] mb-4">
              You have answered <strong className="text-white">{answeredCount}</strong> of{' '}
              <strong className="text-white">{totalItems}</strong> questions.
            </p>

            {answeredCount < totalItems && (
              <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                  You have {totalItems - answeredCount} unanswered question(s). You may still submit, but unanswered items will count as unattempted.
                </span>
              </div>
            )}

            {/* Answered item grid */}
            <div className="grid grid-cols-6 gap-2 mb-6 max-h-48 overflow-y-auto p-2 bg-[#0e0e13] rounded-xl border border-[#23232e]">
              {ITEM_BANK.map((item, idx) => {
                const choice = answers[item.id];
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setShowReviewModal(false);
                    }}
                    className={`p-2 rounded-lg text-xs font-mono font-bold flex flex-col items-center justify-center border transition-colors ${
                      choice
                        ? 'bg-[#456dff]/20 border-[#456dff]/40 text-white'
                        : 'bg-[#181822] border-[#2c2c3c] text-[#64748b]'
                    }`}
                  >
                    <span className="text-[10px] text-[#94a3b8]">Q{idx + 1}</span>
                    <span>{choice || '—'}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="btn-ghost px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Continue Answering
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleFinalSubmit}
                className="btn-purple px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Confirm Final Submission'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
