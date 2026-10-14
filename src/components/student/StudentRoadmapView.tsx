import React, { useState, useEffect } from 'react';
import { Announcement, Course, Lesson, Section, StudentCourseRecommendations, StudentSubmission } from '../../types';
import { Storage } from '../../utils/storage';
import { runCourseRecommendation } from '../../utils/aiClient';
import {
  ArrowLeft,
  Bell,
  Check,
  Lock,
  Play,
  Sparkles,
  X,
  GitBranch,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

interface StudentRoadmapViewProps {
  section: Section;
  submissions: StudentSubmission[];
  onBack: () => void;
  onOpenBaselineCheck: () => void;
  onOpenLesson: (lesson: Lesson) => void;
}

export const StudentRoadmapView: React.FC<StudentRoadmapViewProps> = ({
  section,
  submissions,
  onBack,
  onOpenBaselineCheck,
  onOpenLesson,
}) => {
  const [selectedNode, setSelectedNode] = useState<{
    type: 'baseline' | 'lesson';
    id: string;
    title: string;
    description: string;
    status: 'locked' | 'available' | 'in_progress' | 'completed';
    prevTitle?: string;
    lessonData?: Lesson;
  } | null>(null);

  const [showAnnouncements, setShowAnnouncements] = useState(false);

  // Load lessons and progress
  const lessons = Storage.getLessons(section.id);
  const announcements = Storage.getAnnouncements(section.id);
  const progress = Storage.getStudentProgress(section.id);

  // Baseline check status
  const baselineSub = submissions.find(
    (s) => s.sectionId === section.id && s.status === 'submitted'
  );
  const isBaselineComplete =
    !!baselineSub || progress.completedLessonIds.includes('baseline');
  const isBaselineInProgress =
    !isBaselineComplete && progress.inProgressLessonIds.includes('baseline');

  const baselineStatus: 'locked' | 'available' | 'in_progress' | 'completed' =
    isBaselineComplete
      ? 'completed'
      : isBaselineInProgress
      ? 'in_progress'
      : 'available';

  // Student identification & recommendations state
  const studentProfiles = Storage.getStudentProfiles();
  const currentStudent = Object.values(studentProfiles).find((p) => p.sectionId === section.id);
  const studentId = baselineSub?.studentId || currentStudent?.userId || 'student_local';

  const [, setRecsVersion] = useState(0);
  const [isRetryingRecs, setIsRetryingRecs] = useState(false);
  const [startNotice, setStartNotice] = useState<string | null>(null);

  const studentRecs = Storage.getStudentCourseRecommendation(studentId);

  // Auto-generate recommendations if baseline is complete and catalog exists but no recs yet
  useEffect(() => {
    if (isBaselineComplete && baselineSub && !studentRecs && !isRetryingRecs) {
      const catalog = Storage.getCourses();
      if (catalog.length > 0) {
        setIsRetryingRecs(true);
        runCourseRecommendation(baselineSub, catalog).then((res) => {
          setIsRetryingRecs(false);
          if (res.success && res.data) {
            Storage.saveStudentCourseRecommendation({
              studentId,
              studentName: baselineSub.studentName,
              sectionId: section.id,
              recommended_courses: res.data.recommended_courses,
              no_match_skills: res.data.no_match_skills,
              suggested_topics_to_create: res.data.suggested_topics_to_create,
              status: 'ready',
              generatedAt: new Date().toISOString(),
            });
          } else {
            Storage.saveStudentCourseRecommendation({
              studentId,
              studentName: baselineSub.studentName,
              sectionId: section.id,
              recommended_courses: [],
              no_match_skills: [],
              suggested_topics_to_create: [],
              status: 'error',
              error: res.error || 'Recommendations are unavailable right now',
            });
          }
          setRecsVersion((v) => v + 1);
        });
      }
    }
  }, [isBaselineComplete, baselineSub, studentRecs, isRetryingRecs, studentId, section.id]);

  const handleRetryRecommendations = async () => {
    if (!baselineSub) return;
    setIsRetryingRecs(true);
    const catalog = Storage.getCourses();
    const res = await runCourseRecommendation(baselineSub, catalog);
    setIsRetryingRecs(false);
    if (res.success && res.data) {
      Storage.saveStudentCourseRecommendation({
        studentId,
        studentName: baselineSub.studentName,
        sectionId: section.id,
        recommended_courses: res.data.recommended_courses,
        no_match_skills: res.data.no_match_skills,
        suggested_topics_to_create: res.data.suggested_topics_to_create,
        status: 'ready',
        generatedAt: new Date().toISOString(),
      });
    } else {
      Storage.saveStudentCourseRecommendation({
        studentId,
        studentName: baselineSub.studentName,
        sectionId: section.id,
        recommended_courses: [],
        no_match_skills: [],
        suggested_topics_to_create: [],
        status: 'error',
        error: res.error || 'Recommendations are unavailable right now',
      });
    }
    setRecsVersion((v) => v + 1);
  };

  const handleStartRecommendedCourse = (courseId: string) => {
    const success = Storage.addCourseToRoadmap(section.id, courseId, studentId);
    if (success) {
      const course = Storage.getCourse(courseId);
      setStartNotice(`"${course?.title || 'Course'}" added to your roadmap as Available!`);
      setTimeout(() => setStartNotice(null), 3500);
      setRecsVersion((v) => v + 1);
      const updatedLessons = Storage.getLessons(section.id);
      const firstCourseLesson = updatedLessons.find((l) => l.title.startsWith(course?.title || '___'));
      if (firstCourseLesson) {
        onOpenLesson(firstCourseLesson);
      }
    }
  };

  const handleDismissRecommendedCourse = (courseId: string) => {
    Storage.dismissStudentRecommendation(studentId, courseId);
    setRecsVersion((v) => v + 1);
  };

  const activeRecTiles = (studentRecs?.recommended_courses || [])
    .filter((r) => !r.dismissedByStudent)
    .slice(0, 3);

  // Compute status for each lesson node
  // Rule: Node unlocks when previous node is completed, or if marked openToAll
  interface RoadmapNode {
    id: string;
    title: string;
    description: string;
    status: 'locked' | 'available' | 'in_progress' | 'completed';
    prevTitle: string;
    isBranch: boolean;
    lesson?: Lesson;
  }

  const computedLessonNodes: RoadmapNode[] = [];
  let prevNodeCompleted = isBaselineComplete;
  let prevTitle = 'Baseline Check';

  lessons.forEach((lesson) => {
    const isCompleted = progress.completedLessonIds.includes(lesson.id);
    const isInProgress = progress.inProgressLessonIds.includes(lesson.id);
    const isUnlocked = prevNodeCompleted || !!lesson.openToAll;

    let status: 'locked' | 'available' | 'in_progress' | 'completed' = 'locked';
    if (isCompleted) {
      status = 'completed';
    } else if (isInProgress) {
      status = 'in_progress';
    } else if (isUnlocked) {
      status = 'available';
    }

    computedLessonNodes.push({
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      status,
      prevTitle,
      isBranch: !!lesson.branchFromId,
      lesson,
    });

    // Next linear node looks at this node's completion status
    prevNodeCompleted = isCompleted;
    prevTitle = lesson.title;
  });

  return (
    <div className="min-h-screen bg-[#0d0814] text-white flex flex-col font-sans relative">
      {/* Top Bar */}
      <header className="border-b border-[#26153d] bg-[#130b20]/90 backdrop-blur-md px-6 py-4 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="w-10 h-10 rounded-2xl bg-[#22133a] hover:bg-[#301b50] text-[#c084fc] hover:text-white border border-[#3b2060] flex items-center justify-center transition-colors cursor-pointer"
              title="Back to Classrooms"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base md:text-lg font-extrabold text-white leading-tight">
                {section.name}
              </h1>
              <div className="text-[11px] text-[#a78bfa]">{section.course}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Announcements Bell */}
            <button
              type="button"
              onClick={() => setShowAnnouncements(!showAnnouncements)}
              className="relative w-10 h-10 rounded-2xl bg-[#22133a] hover:bg-[#301b50] text-[#c084fc] hover:text-white border border-[#3b2060] flex items-center justify-center transition-colors cursor-pointer"
              title="Class Announcements"
            >
              <Bell className="w-5 h-5" />
              {announcements.length > 0 && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-[#f59e0b] ring-2 ring-[#130b20]" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Roadmap Area */}
      <main className="flex-1 max-w-xl w-full mx-auto p-6 md:p-8 flex flex-col items-center">
        {/* Recommended for you Card */}
        <div className="w-full mb-6">
          {!isBaselineComplete ? (
            <div className="rounded-2xl bg-[#170e26] border border-[#3b2060] p-5 shadow-lg space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#caa3ff]">
                <Sparkles className="w-4 h-4 text-[#a855f7]" />
                <span>Recommended for you</span>
              </div>
              <p className="text-xs text-[#cbd5e1] leading-relaxed">
                Finish your Baseline Check to get recommendations.
              </p>
              <button
                type="button"
                onClick={onOpenBaselineCheck}
                className="btn-purple px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-[0_2px_10px_rgba(168,85,247,0.3)]"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                Start Baseline Check
              </button>
            </div>
          ) : studentRecs?.status === 'thinking' || isRetryingRecs ? (
            <div className="rounded-2xl bg-[#170e26] border border-[#3b2060] p-5 shadow-lg space-y-3 animate-pulse">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#caa3ff]">
                <Sparkles className="w-4 h-4 text-[#a855f7] animate-spin" />
                <span>Recommended for you</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-[#a78bfa] py-2">
                <div className="w-4 h-4 border-2 border-[#a855f7] border-t-transparent rounded-full animate-spin shrink-0" />
                <span>Thinking... tailoring module suggestions to your reasoning style.</span>
              </div>
            </div>
          ) : studentRecs?.status === 'error' ? (
            <div className="rounded-2xl bg-[#170e26] border border-[#3b2060] p-5 shadow-lg space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#caa3ff]">
                <Sparkles className="w-4 h-4 text-[#a855f7]" />
                <span>Recommended for you</span>
              </div>
              <p className="text-xs text-[#cbd5e1]">
                Recommendations are unavailable right now.
              </p>
              <button
                type="button"
                onClick={handleRetryRecommendations}
                className="btn-purple px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Retry
              </button>
            </div>
          ) : activeRecTiles.length > 0 ? (
            <div className="rounded-2xl bg-[#170e26] border border-[#3b2060] p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#caa3ff]">
                  <Sparkles className="w-4 h-4 text-[#a855f7]" />
                  <span>Recommended for you</span>
                </div>
                <span className="text-[10px] text-[#a78bfa] font-medium">
                  {activeRecTiles.length} suggested {activeRecTiles.length === 1 ? 'course' : 'courses'}
                </span>
              </div>

              {startNotice && (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{startNotice}</span>
                </div>
              )}

              <div className="grid grid-cols-1 gap-3">
                {activeRecTiles.map((rec) => {
                  const course = Storage.getCourse(rec.course_id);
                  const diff = course?.difficulty || 'Starter';
                  const diffColor =
                    diff === 'Starter'
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : diff === 'Core'
                      ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                      : 'bg-purple-500/15 text-purple-300 border-purple-500/30';

                  return (
                    <div
                      key={rec.course_id}
                      className="p-4 rounded-xl bg-[#120a1f] border border-[#2e194d] hover:border-[#4d2882] transition-all space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${diffColor}`}>
                              {diff}
                            </span>
                            <span className="text-[10px] text-[#a78bfa]">
                              {course?.lessons.length || 1} {course?.lessons.length === 1 ? 'lesson' : 'lessons'}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-white">{course?.title || rec.course_id}</h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDismissRecommendedCourse(rec.course_id)}
                          className="text-[#94a3b8] hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
                          title="Dismiss"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="text-xs text-[#cbd5e1] leading-relaxed">
                        {rec.reason_for_student}
                      </p>

                      <div className="pt-1 flex items-center justify-between">
                        <span className="text-[10px] text-[#94a3b8]">Interactive logic visualizer</span>
                        <button
                          type="button"
                          onClick={() => handleStartRecommendedCourse(rec.course_id)}
                          className="btn-purple px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>Start</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-[#170e26] border border-[#3b2060] p-4 text-center space-y-2">
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#caa3ff]">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>All caught up!</span>
              </div>
              <p className="text-xs text-[#94a3b8]">
                You've reviewed all recommended learning modules. Keep exploring your roadmap below!
              </p>
            </div>
          )}
        </div>

        {/* Roadmap Path */}
        <div className="relative w-full flex flex-col items-center py-6">
          {/* Vertical trunk line */}
          <div className="absolute top-12 bottom-12 w-1.5 bg-[#25133c] rounded-full" />

          {/* NODE 1: BASELINE CHECK (Always First) */}
          <div className="relative z-10 flex flex-col items-center mb-12">
            <button
              type="button"
              onClick={() =>
                setSelectedNode({
                  type: 'baseline',
                  id: 'baseline',
                  title: 'Baseline Check',
                  description:
                    "Take the school's OLSAT-style baseline entrance diagnostic. Confidential to your instructor.",
                  status: baselineStatus,
                })
              }
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                baselineStatus === 'completed'
                  ? 'bg-[#15803d] text-white border-4 border-[#22c55e] shadow-[0_0_20px_rgba(34,197,94,0.4)]'
                  : baselineStatus === 'in_progress'
                  ? 'bg-[#2a1348] text-[#c084fc] border-4 border-[#a855f7] ring-4 ring-[#a855f7]/30'
                  : 'bg-[#9333ea] text-white border-4 border-[#c084fc] shadow-[0_0_25px_rgba(168,85,247,0.7)] animate-pulse'
              }`}
            >
              {baselineStatus === 'completed' ? (
                <Check className="w-8 h-8 stroke-[3]" />
              ) : (
                <Play className="w-7 h-7 fill-white ml-0.5" />
              )}
            </button>
            <div className="mt-3 text-center">
              <span className="text-xs font-bold text-white block">Baseline Check</span>
              <span className="text-[10px] text-[#a78bfa] block">
                {baselineStatus === 'completed'
                  ? 'Completed'
                  : baselineStatus === 'in_progress'
                  ? 'In Progress'
                  : 'Start Here'}
              </span>
            </div>
          </div>

          {/* SUBSEQUENT LESSON NODES */}
          {computedLessonNodes.length === 0 ? (
            <div className="relative z-10 p-6 rounded-3xl bg-[#170e26] border border-[#2d1748] text-center max-w-sm mt-4">
              <p className="text-xs text-[#a78bfa] leading-relaxed">
                Your instructor hasn't added lessons yet.
              </p>
            </div>
          ) : (
            computedLessonNodes.map((node, index) => {
              const isLocked = node.status === 'locked';
              const isCompleted = node.status === 'completed';
              const isInProgress = node.status === 'in_progress';
              const isAvailable = node.status === 'available';

              return (
                <div
                  key={node.id}
                  className={`relative z-10 flex flex-col items-center mb-12 ${
                    node.isBranch ? 'translate-x-14' : ''
                  }`}
                >
                  {/* Branch connector line if branching */}
                  {node.isBranch && (
                    <div className="absolute -left-14 top-8 w-14 h-1 bg-[#4a2675] border-t-2 border-dashed border-[#a855f7]" />
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedNode({
                        type: 'lesson',
                        id: node.id,
                        title: node.title,
                        description: node.description,
                        status: node.status,
                        prevTitle: node.prevTitle,
                        lessonData: node.lesson,
                      })
                    }
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                      isCompleted
                        ? 'bg-[#15803d] text-white border-4 border-[#22c55e] shadow-[0_0_20px_rgba(34,197,94,0.4)]'
                        : isInProgress
                        ? 'bg-[#2a1348] text-[#c084fc] border-4 border-[#a855f7] ring-4 ring-[#a855f7]/30'
                        : isAvailable
                        ? 'bg-[#9333ea] text-white border-4 border-[#c084fc] shadow-[0_0_25px_rgba(168,85,247,0.7)] hover:scale-105'
                        : 'bg-[#190f26] text-[#5c4279] border-2 border-[#2b1842] opacity-75'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-8 h-8 stroke-[3]" />
                    ) : isLocked ? (
                      <Lock className="w-6 h-6 text-[#6b4c8f]" />
                    ) : isInProgress ? (
                      <div className="w-6 h-6 rounded-full border-3 border-t-transparent border-[#c084fc] animate-spin" />
                    ) : (
                      <Play className="w-7 h-7 fill-white ml-0.5" />
                    )}
                  </button>

                  <div className="mt-3 text-center max-w-[160px]">
                    <span className="text-xs font-bold text-white block truncate">
                      {node.title}
                    </span>
                    <span className="text-[10px] text-[#a78bfa] block flex items-center justify-center gap-1">
                      {node.isBranch && <GitBranch className="w-3 h-3 text-[#c084fc]" />}
                      {isCompleted
                        ? 'Completed'
                        : isInProgress
                        ? 'In Progress'
                        : isAvailable
                        ? 'Available'
                        : 'Locked'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* NODE DETAIL BOTTOM CARD MODAL */}
      {selectedNode && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#170e26] border border-[#3b2060] p-6 shadow-2xl space-y-4 animate-in fade-in slide-in-from-bottom duration-200">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#c084fc] px-2 py-0.5 rounded bg-[#2a1444] border border-[#402066]">
                  {selectedNode.type === 'baseline' ? 'Baseline Assessment' : 'Lesson'}
                </span>
                <h2 className="text-xl font-extrabold text-white mt-1.5">
                  {selectedNode.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedNode(null)}
                className="w-8 h-8 rounded-full bg-[#24133c] hover:bg-[#341b56] text-[#a78bfa] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#cbd5e1] leading-relaxed">
              {selectedNode.description}
            </p>

            {/* Status & Action */}
            <div className="pt-2">
              {selectedNode.status === 'locked' ? (
                <div className="p-3.5 rounded-2xl bg-[#201036] border border-[#351a56] text-xs text-[#a78bfa] flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#ef4444] shrink-0" />
                  <span>
                    Finish <strong>{selectedNode.prevTitle || 'previous lesson'}</strong> first
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    const node = selectedNode;
                    setSelectedNode(null);
                    if (node.type === 'baseline') {
                      onOpenBaselineCheck();
                    } else if (node.lessonData) {
                      onOpenLesson(node.lessonData);
                    }
                  }}
                  className="w-full py-3.5 rounded-2xl bg-[#9333ea] hover:bg-[#a855f7] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_4px_0_0_#6b21a8] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>
                    {selectedNode.status === 'completed'
                      ? 'Review Lesson'
                      : selectedNode.status === 'in_progress'
                      ? 'Resume'
                      : 'Start'}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ANNOUNCEMENTS SLIDEOVER/MODAL */}
      {showAnnouncements && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#170e26] border border-[#3b2060] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#2a1544]">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#f59e0b]" />
                <h2 className="text-base font-bold text-white">Teacher Announcements</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowAnnouncements(false)}
                className="w-7 h-7 rounded-full bg-[#24133c] hover:bg-[#341b56] text-[#a78bfa] flex items-center justify-center cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {announcements.length === 0 ? (
              <p className="text-xs text-[#94a3b8] py-8 text-center">
                No announcements posted for this classroom yet.
              </p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {announcements.map((a) => (
                  <div
                    key={a.id}
                    className="p-4 rounded-2xl bg-[#1f1134] border border-[#361c59] space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[11px] text-[#a78bfa]">
                      <span className="font-semibold text-white">{a.instructorName}</span>
                      <span>{new Date(a.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-[#cbd5e1] leading-relaxed whitespace-pre-wrap">
                      {a.text}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
