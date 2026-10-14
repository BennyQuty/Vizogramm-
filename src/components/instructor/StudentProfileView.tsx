import React, { useState } from 'react';
import {
  AssessmentItem,
  ClusterCategoryBreakdown,
  ClusterDiagnosis,
  ClusterScoreBreakdown,
  StudentProfileData,
  StudentSubmission,
} from '../../types';
import { ITEM_BANK } from '../../data/itemBank';
import { computeScores } from '../../utils/scoring';
import { runCourseRecommendation, runStudentDiagnosis } from '../../utils/aiClient';
import { Storage } from '../../utils/storage';
import {
  ArrowLeft,
  RotateCcw,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Brain,
  Edit3,
  Save,
  Clock,
  Layers,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Users,
  Check,
  X,
} from 'lucide-react';

interface StudentProfileViewProps {
  studentProfile: StudentProfileData;
  submission: StudentSubmission | null;
  onBack: () => void;
  onSubmissionUpdated: (sub: StudentSubmission) => void;
}

export const StudentProfileView: React.FC<StudentProfileViewProps> = ({
  studentProfile,
  submission,
  onBack,
  onSubmissionUpdated,
}) => {
  const [isReRunning, setIsReRunning] = useState(false);
  const [editableAnswers, setEditableAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D' | 'E'>>(
    submission?.answers || {}
  );
  const [editedItemId, setEditedItemId] = useState<string | null>(null);
  const [activeReasoningCluster, setActiveReasoningCluster] = useState<string>('all');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Course Recommendations State & Handlers
  const [, setRecsVersion] = useState(0);
  const [isGeneratingRecs, setIsGeneratingRecs] = useState(false);
  const [recsActionNotice, setRecsActionNotice] = useState<string | null>(null);

  const studentRecs = Storage.getStudentCourseRecommendation(studentProfile.userId);

  const handleRegenerateRecommendations = async () => {
    if (!submission) return;
    setIsGeneratingRecs(true);
    setErrorMessage(null);
    const catalog = Storage.getCourses();

    Storage.saveStudentCourseRecommendation({
      studentId: studentProfile.userId,
      studentName: `${studentProfile.firstName} ${studentProfile.lastName}`,
      sectionId: studentProfile.sectionId,
      recommended_courses: [],
      no_match_skills: [],
      suggested_topics_to_create: [],
      status: 'thinking',
    });
    setRecsVersion((v) => v + 1);

    const res = await runCourseRecommendation(submission, catalog);
    setIsGeneratingRecs(false);

    if (res.success && res.data) {
      Storage.saveStudentCourseRecommendation({
        studentId: studentProfile.userId,
        studentName: `${studentProfile.firstName} ${studentProfile.lastName}`,
        sectionId: studentProfile.sectionId,
        recommended_courses: res.data.recommended_courses,
        no_match_skills: res.data.no_match_skills,
        suggested_topics_to_create: res.data.suggested_topics_to_create,
        status: 'ready',
        generatedAt: new Date().toISOString(),
      });
      setRecsActionNotice('Recommendations updated successfully.');
      setTimeout(() => setRecsActionNotice(null), 3000);
    } else {
      Storage.saveStudentCourseRecommendation({
        studentId: studentProfile.userId,
        studentName: `${studentProfile.firstName} ${studentProfile.lastName}`,
        sectionId: studentProfile.sectionId,
        recommended_courses: [],
        no_match_skills: [],
        suggested_topics_to_create: [],
        status: 'error',
        error: res.error || 'Recommendations are unavailable right now',
      });
    }
    setRecsVersion((v) => v + 1);
  };

  const handleAcceptCourse = (courseId: string) => {
    Storage.addCourseToRoadmap(studentProfile.sectionId, courseId, studentProfile.userId, false);
    setRecsActionNotice('Accepted! Added course lessons to student roadmap as Available.');
    setTimeout(() => setRecsActionNotice(null), 3000);
    setRecsVersion((v) => v + 1);
  };

  const handleDismissCourse = (courseId: string) => {
    Storage.updateInstructorRecommendationStatus(studentProfile.userId, courseId, 'dismissed');
    setRecsActionNotice('Recommendation marked as dismissed.');
    setTimeout(() => setRecsActionNotice(null), 3000);
    setRecsVersion((v) => v + 1);
  };

  const handleAssignToClass = (courseId: string) => {
    Storage.addCourseToRoadmap(studentProfile.sectionId, courseId, studentProfile.userId, true);
    setRecsActionNotice('Assigned course to whole class roadmap as Available.');
    setTimeout(() => setRecsActionNotice(null), 3000);
    setRecsVersion((v) => v + 1);
  };

  if (!submission) {
    return (
      <div className="space-y-6">
        <button
          onClick={onBack}
          className="btn-ghost px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Students
        </button>
        <div className="brilliant-card rounded-2xl p-8 text-center border border-[#2b2b3a]">
          <h2 className="text-lg font-bold text-white mb-2">{studentProfile.firstName} {studentProfile.lastName}</h2>
          <p className="text-xs text-[#94a3b8]">Student has not started or submitted their assessment yet.</p>
        </div>
      </div>
    );
  }

  const { scores, categories, diagnosis } = submission;

  const handleEditAnswer = (itemId: string, newOption: 'A' | 'B' | 'C' | 'D' | 'E') => {
    const updated = { ...editableAnswers, [itemId]: newOption };
    setEditableAnswers(updated);
    setEditedItemId(null);

    // Recompute scores immediately
    const recomputed = computeScores(updated);
    const updatedSub: StudentSubmission = {
      ...submission,
      answers: updated,
      scores: recomputed.scores,
      categories: recomputed.categories,
    };
    Storage.saveSubmission(updatedSub);
    onSubmissionUpdated(updatedSub);
  };

  const handleReRunDiagnosis = async () => {
    setIsReRunning(true);
    setErrorMessage(null);

    const recomputed = computeScores(editableAnswers);
    const result = await runStudentDiagnosis(
      `${studentProfile.firstName} ${studentProfile.lastName}`,
      editableAnswers,
      recomputed.scores,
      recomputed.categories
    );

    setIsReRunning(false);

    if (result.success && result.data) {
      const updatedSub: StudentSubmission = {
        ...submission,
        answers: editableAnswers,
        scores: recomputed.scores,
        categories: recomputed.categories,
        status: 'submitted',
        analysisStatus: 'ready',
        diagnosis: result.data,
        analyzedAt: new Date().toISOString(),
        analysisModelUsed: result.model,
        analysisLatencyMs: result.latencyMs,
      };
      Storage.saveSubmission(updatedSub);
      onSubmissionUpdated(updatedSub);
    } else {
      setErrorMessage(result.error || 'Failed to complete AI diagnostic call');
      const updatedSub: StudentSubmission = {
        ...submission,
        analysisStatus: 'error',
        analysisError: result.error,
      };
      Storage.saveSubmission(updatedSub);
      onSubmissionUpdated(updatedSub);
    }
  };

  // Badge helpers
  const getCategoryBadge = (cat: string) => {
    if (cat === 'Below Average') return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
    if (cat === 'Average') return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
    return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
  };

  const getStatusBadge = (status?: string) => {
    if (status === 'mastered') return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    if (status === 'shaky') return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
  };

  const getCauseBadge = (cause?: string) => {
    switch (cause) {
      case 'careless_slip':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'misconception':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'never_learned':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      default:
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
    }
  };

  const clusterItems = ITEM_BANK.filter((item) => {
    if (activeReasoningCluster === 'all') return true;
    return item.cluster === activeReasoningCluster;
  });

  const aiConfig = Storage.getAIModelConfig();
  const isAiConnected = aiConfig.status === 'connected';

  return (
    <div className="space-y-6">
      {/* No AI model configured banner */}
      {!isAiConnected && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
          <span>No AI model configured. Contact the System Administrator.</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#242432]">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="btn-ghost px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Students
          </button>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              {studentProfile.lastName}, {studentProfile.firstName}
              <span className="text-xs font-mono font-normal text-[#94a3b8] px-2 py-0.5 rounded bg-[#161622] border border-[#2a2a3a]">
                {studentProfile.studentNumber}
              </span>
            </h1>
            <p className="text-xs text-[#94a3b8]">
              {studentProfile.school ? `${studentProfile.school} • ` : ''}Section: {studentProfile.classCode} • Submitted on{' '}
              {submission.submittedAt ? new Date(submission.submittedAt).toLocaleDateString() : '—'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={isReRunning}
            onClick={handleReRunDiagnosis}
            className="btn-purple px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isReRunning ? 'animate-spin' : ''}`} />
            {isReRunning ? 'Re-running Diagnosis...' : 'Re-run AI Analysis'}
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Grid: Left Column Profile & Scores; Right Column AI Diagnosis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1 Col: Student Info & Cluster Scores */}
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="brilliant-card rounded-2xl p-5 border border-[#2a2a3a]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#9d62ff] mb-3">
              Student Record
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-[#64748b] uppercase block">Grade / Year</span>
                <span className="text-white font-medium">{studentProfile.gradeYearLevel}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#64748b] uppercase block">Date of Birth</span>
                <span className="text-white font-medium">{studentProfile.dob}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#64748b] uppercase block">Exam Form & Level</span>
                <span className="text-white font-medium">Level {studentProfile.level}, Form {studentProfile.form}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#64748b] uppercase block">Test Date</span>
                <span className="text-white font-medium">{studentProfile.testDate}</span>
              </div>
            </div>
          </div>

          {/* 7 Cluster Scores Card */}
          <div className="brilliant-card rounded-2xl p-5 border border-[#2a2a3a] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#456dff]">
                Deterministic Scores (7 Clusters)
              </h3>
              <span className="text-[10px] text-[#64748b]">Provisional Bands</span>
            </div>

            <div className="space-y-2 text-xs">
              {/* Total */}
              <div className="p-2.5 rounded-xl bg-[#14141c] border border-[#2b2b3b] flex items-center justify-between font-bold">
                <div>
                  <span className="text-white">Total Raw Score</span>
                  <div className="text-[10px] font-normal text-[#94a3b8]">{scores.total} of 24 items</div>
                </div>
                <span className={`px-2 py-0.5 rounded border text-[11px] ${getCategoryBadge(categories.total)}`}>
                  {categories.total}
                </span>
              </div>

              {/* Verbal Rollup */}
              <div className="p-2.5 rounded-xl bg-[#121217] border border-[#252535] flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white">Verbal Total</span>
                  <div className="text-[10px] text-[#64748b]">{scores.verbal} / 12</div>
                </div>
                <span className={`px-2 py-0.5 rounded border text-[10px] ${getCategoryBadge(categories.verbal)}`}>
                  {categories.verbal}
                </span>
              </div>

              {/* VC */}
              <div className="pl-4 pr-2.5 py-1.5 flex items-center justify-between text-[#cbd5e1]">
                <span>• Verbal Comprehension ({scores.verbalComprehension}/4)</span>
                <span className={`px-1.5 py-0.5 rounded border text-[10px] ${getCategoryBadge(categories.verbalComprehension)}`}>
                  {categories.verbalComprehension}
                </span>
              </div>

              {/* VR */}
              <div className="pl-4 pr-2.5 py-1.5 flex items-center justify-between text-[#cbd5e1]">
                <span>• Verbal Reasoning ({scores.verbalReasoning}/8)</span>
                <span className={`px-1.5 py-0.5 rounded border text-[10px] ${getCategoryBadge(categories.verbalReasoning)}`}>
                  {categories.verbalReasoning}
                </span>
              </div>

              {/* Nonverbal Rollup */}
              <div className="p-2.5 rounded-xl bg-[#121217] border border-[#252535] flex items-center justify-between mt-1">
                <div>
                  <span className="font-semibold text-white">Nonverbal Total</span>
                  <div className="text-[10px] text-[#64748b]">{scores.nonverbal} / 12</div>
                </div>
                <span className={`px-2 py-0.5 rounded border text-[10px] ${getCategoryBadge(categories.nonverbal)}`}>
                  {categories.nonverbal}
                </span>
              </div>

              {/* FR */}
              <div className="pl-4 pr-2.5 py-1.5 flex items-center justify-between text-[#cbd5e1]">
                <span>• Figural Reasoning ({scores.figuralReasoning}/6)</span>
                <span className={`px-1.5 py-0.5 rounded border text-[10px] ${getCategoryBadge(categories.figuralReasoning)}`}>
                  {categories.figuralReasoning}
                </span>
              </div>

              {/* QR */}
              <div className="pl-4 pr-2.5 py-1.5 flex items-center justify-between text-[#cbd5e1]">
                <span>• Quantitative Reasoning ({scores.quantitativeReasoning}/6)</span>
                <span className={`px-1.5 py-0.5 rounded border text-[10px] ${getCategoryBadge(categories.quantitativeReasoning)}`}>
                  {categories.quantitativeReasoning}
                </span>
              </div>
            </div>

            <p className="text-[10px] text-[#64748b] pt-1">
              *Provisional bands, for demonstration; not official norms.
            </p>
          </div>
        </div>

        {/* Right 2 Cols: AI Diagnosis & Interactive Reasoning Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Diagnosis Summary Card */}
          <div className="brilliant-card rounded-2xl p-6 border border-[#2e2e3e] shadow-[0_4px_0_0_#874de5]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-[#caa3ff]" />
                <h2 className="text-base font-bold text-white">Live AI Diagnostic Hypotheses</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#9d62ff]/15 text-[#caa3ff] border border-[#9d62ff]/30">
                  {submission.analysisModelUsed || 'Gemini 3.8 Flash'}
                </span>
                {submission.analysisLatencyMs && (
                  <span className="text-[10px] text-[#64748b]">
                    {submission.analysisLatencyMs}ms
                  </span>
                )}
              </div>
            </div>

            {diagnosis ? (
              <div className="space-y-4">
                {/* 2-Sentence Overall Summary */}
                <div className="p-4 rounded-xl bg-[#14141e] border border-[#2e2e42] text-sm text-[#e2e8f0] leading-relaxed italic">
                  "{diagnosis.overall_summary}"
                </div>

                {/* Per-Cluster Diagnosis Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  {Object.entries(diagnosis.clusters).map(([key, diag]) => {
                    if (!diag) return null;
                    const formattedKey = key
                      .replace(/_/g, ' ')
                      .replace(/\b\w/g, (l) => l.toUpperCase());

                    return (
                      <div
                        key={key}
                        className="p-3.5 rounded-xl bg-[#111118] border border-[#252535] space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{formattedKey}</span>
                          <div className="flex items-center gap-1.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getStatusBadge(diag.status)}`}>
                              {diag.status}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getCauseBadge(diag.cause)}`}>
                              {diag.cause?.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                        <p className="text-[11px] text-[#94a3b8] leading-normal">
                          {diag.reason}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : submission.analysisStatus === 'analyzing' ? (
              <div className="p-8 text-center text-[#94a3b8] text-xs">
                <div className="animate-spin w-6 h-6 border-2 border-[#9d62ff] border-t-transparent rounded-full mx-auto mb-2" />
                <span>Generating live AI diagnostic synthesis...</span>
              </div>
            ) : !isAiConnected ? (
              <div className="p-6 text-center text-amber-300 text-xs flex flex-col items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-400" />
                <span>No AI model configured. Contact the System Administrator.</span>
              </div>
            ) : (
              <div className="p-6 text-center text-[#94a3b8] text-xs">
                No diagnostic analysis available yet. Click "Re-run AI Analysis" above.
              </div>
            )}
          </div>

          {/* ========================================================= */}
          {/* COURSE RECOMMENDER: RECOMMENDED COURSES ("RECOMMENDED TO TEACH") */}
          {/* ========================================================= */}
          <div className="brilliant-card rounded-2xl p-6 border border-[#2e2e3e] shadow-[0_4px_0_0_#9d62ff]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#caa3ff]" />
                  <h3 className="text-sm font-bold text-white">
                    Recommended Courses to Teach
                  </h3>
                </div>
                <p className="text-xs text-[#94a3b8] mt-0.5">
                  Suggested courses based on weak reasoning skills. The AI only suggests. You decide.
                </p>
              </div>

              <button
                type="button"
                disabled={isGeneratingRecs}
                onClick={handleRegenerateRecommendations}
                className="btn-ghost px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-[#3b2060] text-[#caa3ff] hover:text-white cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isGeneratingRecs ? 'animate-spin' : ''}`} />
                <span>{isGeneratingRecs ? 'Thinking...' : 'Regenerate'}</span>
              </button>
            </div>

            {recsActionNotice && (
              <div className="p-3 mb-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{recsActionNotice}</span>
              </div>
            )}

            {isGeneratingRecs || studentRecs?.status === 'thinking' ? (
              <div className="p-8 text-center text-xs text-[#caa3ff] space-y-2">
                <div className="w-5 h-5 border-2 border-[#a855f7] border-t-transparent rounded-full animate-spin mx-auto" />
                <span>Thinking... Analyzing skill areas and matching against course catalog.</span>
              </div>
            ) : studentRecs?.status === 'error' ? (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
                <span>Recommendations are unavailable right now.</span>
                <button
                  type="button"
                  onClick={handleRegenerateRecommendations}
                  className="btn-purple px-3 py-1 rounded-lg text-xs font-bold cursor-pointer"
                >
                  Retry
                </button>
              </div>
            ) : Storage.getCourses().length === 0 ? (
              <div className="p-6 text-center text-xs text-[#94a3b8] space-y-2">
                <p>No courses in the catalog yet.</p>
                <p className="text-[11px] text-[#64748b]">
                  Add courses in the "Courses" tab so the recommender has something to suggest.
                </p>
              </div>
            ) : !studentRecs || studentRecs.recommended_courses.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#94a3b8] space-y-2">
                <p>No course recommendations generated for this student's profile.</p>
                <button
                  type="button"
                  onClick={handleRegenerateRecommendations}
                  className="btn-purple px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Generate Recommendations
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {studentRecs.recommended_courses.map((rec) => {
                  const course = Storage.getCourse(rec.course_id);
                  const isAccepted = rec.addedToRoadmap || rec.statusForInstructor === 'accepted';
                  const isClassAssigned = rec.statusForInstructor === 'assigned_to_class';
                  const isDismissed = rec.statusForInstructor === 'dismissed';

                  return (
                    <div
                      key={rec.course_id}
                      className={`p-4 rounded-xl border transition-all space-y-3 ${
                        isDismissed
                          ? 'bg-[#121217] border-[#22222e] opacity-60'
                          : isAccepted || isClassAssigned
                          ? 'bg-[#101913] border-emerald-900/40'
                          : 'bg-[#130b20] border-[#341d54]'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#9d62ff]/20 text-[#caa3ff] border border-[#9d62ff]/30">
                              {rec.target_skill}
                            </span>
                            {course?.difficulty && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#1e1e2c] text-[#94a3b8]">
                                {course.difficulty}
                              </span>
                            )}
                            {isClassAssigned && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                Assigned to Class
                              </span>
                            )}
                            {isAccepted && !isClassAssigned && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                Added to Roadmap
                              </span>
                            )}
                            {isDismissed && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-500/20 text-slate-400">
                                Dismissed
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-bold text-white mt-1.5">
                            {course?.title || rec.course_id}
                          </h4>
                        </div>
                      </div>

                      {/* Instructor Evidence Line */}
                      <div className="p-2.5 rounded-lg bg-black/40 border border-[#221833] text-xs text-[#cbd5e1]">
                        <span className="text-[10px] text-[#a78bfa] font-bold uppercase tracking-wider block mb-0.5">
                          Evidence:
                        </span>
                        <span>{rec.reason_for_instructor}</span>
                      </div>

                      {/* Action Buttons: Accept, Dismiss, Assign to whole class */}
                      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#26153d]">
                        <button
                          type="button"
                          onClick={() => handleAcceptCourse(rec.course_id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                            isAccepted && !isClassAssigned
                              ? 'bg-emerald-600 text-white'
                              : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Accept (Add to Roadmap)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleAssignToClass(rec.course_id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                            isClassAssigned
                              ? 'bg-purple-600 text-white'
                              : 'btn-purple'
                          }`}
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>Assign to Whole Class</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDismissCourse(rec.course_id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all ${
                            isDismissed
                              ? 'text-slate-500'
                              : 'text-[#94a3b8] hover:text-white border border-[#2d2d3e]'
                          }`}
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Dismiss</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ========================================================= */}
          {/* FEATURE 5: AI REASONING PANEL (LIVE ANSWER MODIFICATION)  */}
          {/* ========================================================= */}
          <div className="brilliant-card rounded-2xl p-6 border border-[#2e2e3e]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-[#ff8d23]" />
                  <h3 className="text-sm font-bold text-white">
                    Interactive AI Reasoning Panel
                  </h3>
                </div>
                <p className="text-xs text-[#94a3b8]">
                  Student's responses beside model reasoning. <strong>Presenter tip:</strong> Click "Edit Choice" on any answer and click "Re-run AI Analysis" to watch the output change live!
                </p>
              </div>

              {/* Cluster Filter */}
              <select
                value={activeReasoningCluster}
                onChange={(e) => setActiveReasoningCluster(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-[#14141c] border border-[#303040] text-xs text-white focus:outline-none focus:border-[#9d62ff]"
              >
                <option value="all">All 24 Questions</option>
                <option value="Verbal Comprehension">Verbal Comprehension (4)</option>
                <option value="Verbal Reasoning">Verbal Reasoning (8)</option>
                <option value="Figural Reasoning">Figural Reasoning (6)</option>
                <option value="Quantitative Reasoning">Quantitative Reasoning (6)</option>
              </select>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {clusterItems.map((item) => {
                const studentChoice = editableAnswers[item.id];
                const isCorrect = studentChoice === item.key;
                const wrongTag = !isCorrect && studentChoice ? item.wrongTags[studentChoice] : null;
                const isEditing = editedItemId === item.id;

                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isCorrect
                        ? 'bg-[#101512] border-emerald-900/40'
                        : 'bg-[#171216] border-rose-900/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-white">
                            {item.id}
                          </span>
                          <span className="text-[11px] text-[#64748b]">
                            {item.cluster} • {item.type}
                          </span>
                          {isCorrect ? (
                            <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Correct
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold text-rose-400">
                              Incorrect {wrongTag ? `(${wrongTag})` : ''}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-[#cbd5e1] line-clamp-2">
                          {item.stem}
                        </p>
                      </div>

                      {/* Right side: Choice controls */}
                      <div className="shrink-0 flex items-center gap-2">
                        <div className="text-right">
                          <span className="text-[10px] text-[#64748b] block">Student Choice</span>
                          <span
                            className={`font-mono text-sm font-bold ${
                              isCorrect ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {studentChoice || 'None'}
                          </span>
                          <span className="text-[10px] text-[#64748b] ml-1">(Key: {item.key})</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => setEditedItemId(isEditing ? null : item.id)}
                          className="px-2 py-1 rounded bg-[#20202c] hover:bg-[#2b2b3c] border border-[#37374a] text-[11px] text-[#caa3ff] cursor-pointer"
                        >
                          {isEditing ? 'Cancel' : 'Edit'}
                        </button>
                      </div>
                    </div>

                    {/* Inline Editor if active */}
                    {isEditing && (
                      <div className="mt-3 pt-3 border-t border-[#29293b] flex items-center gap-2">
                        <span className="text-xs text-[#94a3b8]">Select new student response:</span>
                        {(['A', 'B', 'C', 'D', 'E'] as const).map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => handleEditAnswer(item.id, opt)}
                            className={`w-7 h-7 rounded text-xs font-bold font-mono transition-all cursor-pointer ${
                              studentChoice === opt
                                ? 'bg-[#9d62ff] text-white ring-2 ring-white/40'
                                : 'bg-[#1e1e28] text-[#94a3b8] hover:bg-[#2c2c3b] hover:text-white'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Rationale snippet */}
                    <div className="mt-2 text-[11px] text-[#64748b] border-t border-[#22222e] pt-1.5 flex items-center justify-between">
                      <span>Key Rationale: {item.rationale}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
