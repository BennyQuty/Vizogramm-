import React, { useState } from 'react';
import {
  ClusterCategoryBreakdown,
  PacingRecommendation,
  ScoreCategory,
  Section,
  StudentProfileData,
  StudentSubmission,
  User,
} from '../../types';
import { Logo } from '../Logo';
import { ClassHeatmap } from './ClassHeatmap';
import { StudentsList } from './StudentsList';
import { StudentProfileView } from './StudentProfileView';
import { PacingRecommendationsView } from './PacingRecommendationsView';
import { SectionsManager } from './SectionsManager';
import { ScoreInterpretationGuide } from './ScoreInterpretationGuide';
import { InstructorRoadmapEditor } from './InstructorRoadmapEditor';
import { CourseCatalogManager } from './CourseCatalogManager';
import { Storage } from '../../utils/storage';
import {
  LayoutDashboard,
  Grid,
  Users,
  Sparkles,
  BookOpen,
  FolderKanban,
  ArrowRight,
  TrendingDown,
  CheckCircle2,
  Clock,
  Layers,
  GitBranch,
} from 'lucide-react';

interface InstructorDashboardProps {
  currentUser: User;
  sections: Section[];
  profiles: Record<string, StudentProfileData>;
  submissions: StudentSubmission[];
  recommendations: PacingRecommendation[];
  onSubmissionUpdated: (sub: StudentSubmission) => void;
  onRecommendationsUpdated: (recs: PacingRecommendation[]) => void;
  onSectionCreated: (sec: Section) => void;
  onLogout: () => void;
}

export const InstructorDashboard: React.FC<InstructorDashboardProps> = ({
  currentUser,
  sections,
  profiles,
  submissions,
  recommendations,
  onSubmissionUpdated,
  onRecommendationsUpdated,
  onSectionCreated,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'heatmap' | 'students' | 'recommendations' | 'courses' | 'roadmap' | 'sections' | 'interpretation'
  >('overview');

  const [coursesCount, setCoursesCount] = useState<number>(() => Storage.getCourses().length);
  const [selectedSectionId, setSelectedSectionId] = useState<string>('all');
  const [activeCellFilter, setActiveCellFilter] = useState<{
    clusterKey: keyof ClusterCategoryBreakdown;
    category: ScoreCategory;
  } | null>(null);

  const [viewingStudentId, setViewingStudentId] = useState<string | null>(null);

  // Compute top gaps
  const submittedSubs = submissions.filter((s) => s.status === 'submitted');
  const totalSubmissions = submittedSubs.length;

  const clusterBelowCounts: Record<string, number> = {
    'Verbal Comprehension': submittedSubs.filter((s) => s.categories.verbalComprehension === 'Below Average').length,
    'Verbal Reasoning': submittedSubs.filter((s) => s.categories.verbalReasoning === 'Below Average').length,
    'Figural Reasoning': submittedSubs.filter((s) => s.categories.figuralReasoning === 'Below Average').length,
    'Quantitative Reasoning': submittedSubs.filter((s) => s.categories.quantitativeReasoning === 'Below Average').length,
  };

  const topGaps = Object.entries(clusterBelowCounts)
    .sort((a, b) => b[1] - a[1])
    .filter((entry) => entry[1] > 0);

  const pendingRecs = recommendations.filter((r) => r.status === 'pending');

  // Compute "Recommended to teach" panel (up to 5 items grouped across students)
  const allStudentRecs = Storage.getCourseRecommendations();
  const allCourses = Storage.getCourses();

  const courseCountMap: Record<
    string,
    {
      courseId: string;
      courseTitle: string;
      targetSkill: string;
      studentIds: Set<string>;
      evidence: string;
    }
  > = {};

  Object.values(allStudentRecs).forEach((sRec) => {
    sRec.recommended_courses.forEach((item) => {
      if (!courseCountMap[item.course_id]) {
        const c = allCourses.find((x) => x.id === item.course_id);
        courseCountMap[item.course_id] = {
          courseId: item.course_id,
          courseTitle: c?.title || item.course_id,
          targetSkill: item.target_skill,
          studentIds: new Set(),
          evidence: item.reason_for_instructor,
        };
      }
      courseCountMap[item.course_id].studentIds.add(sRec.studentId);
    });
  });

  const enrolledStudentCount = Object.keys(profiles).length || totalSubmissions || 1;
  const recommendedToTeachItems = Object.values(courseCountMap)
    .map((g) => ({
      courseId: g.courseId,
      courseTitle: g.courseTitle,
      targetSkill: g.targetSkill,
      count: g.studentIds.size,
      totalActiveStudents: enrolledStudentCount,
      evidence: g.evidence,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const handleCellClick = (clusterKey: keyof ClusterCategoryBreakdown, category: ScoreCategory) => {
    setActiveCellFilter({ clusterKey, category });
    setActiveTab('students');
  };

  const currentStudentProfile = viewingStudentId ? profiles[viewingStudentId] : null;
  const currentStudentSubmission = viewingStudentId
    ? submissions.find((s) => s.studentId === viewingStudentId) || null
    : null;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Top Header */}
      <header className="border-b border-[#242430] bg-[#0c0c10] px-6 py-4 sticky top-0 z-20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Logo size="sm" />
            <nav className="hidden md:flex items-center gap-1 text-xs">
              <button
                onClick={() => {
                  setViewingStudentId(null);
                  setActiveTab('overview');
                }}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  activeTab === 'overview' && !viewingStudentId
                    ? 'bg-[#1e1e2c] text-white shadow-sm'
                    : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => {
                  setViewingStudentId(null);
                  setActiveTab('heatmap');
                }}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  activeTab === 'heatmap' && !viewingStudentId
                    ? 'bg-[#1e1e2c] text-white shadow-sm'
                    : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                Heatmap
              </button>
              <button
                onClick={() => {
                  setViewingStudentId(null);
                  setActiveTab('students');
                }}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  activeTab === 'students' && !viewingStudentId
                    ? 'bg-[#1e1e2c] text-white shadow-sm'
                    : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                Students ({Object.keys(profiles).length})
              </button>
              <button
                onClick={() => {
                  setViewingStudentId(null);
                  setActiveTab('recommendations');
                }}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'recommendations' && !viewingStudentId
                    ? 'bg-[#1e1e2c] text-white shadow-sm'
                    : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                <span>Pacing Recs</span>
                {pendingRecs.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-[#ff8d23] text-black text-[10px] font-bold flex items-center justify-center">
                    {pendingRecs.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => {
                  setViewingStudentId(null);
                  setActiveTab('courses');
                }}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'courses' && !viewingStudentId
                    ? 'bg-[#1e1e2c] text-white shadow-sm'
                    : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-[#caa3ff]" />
                <span>Courses ({coursesCount})</span>
              </button>
              <button
                onClick={() => {
                  setViewingStudentId(null);
                  setActiveTab('roadmap');
                }}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'roadmap' && !viewingStudentId
                    ? 'bg-[#1e1e2c] text-white shadow-sm'
                    : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                <GitBranch className="w-3.5 h-3.5 text-[#c084fc]" />
                <span>Roadmap & Lessons</span>
              </button>
              <button
                onClick={() => {
                  setViewingStudentId(null);
                  setActiveTab('sections');
                }}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  activeTab === 'sections' && !viewingStudentId
                    ? 'bg-[#1e1e2c] text-white shadow-sm'
                    : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                Sections ({sections.length})
              </button>
              <button
                onClick={() => {
                  setViewingStudentId(null);
                  setActiveTab('interpretation');
                }}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  activeTab === 'interpretation' && !viewingStudentId
                    ? 'bg-[#1e1e2c] text-white shadow-sm'
                    : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                Norms Guide
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#161622] border border-[#2d2d3e]">
              <span className="w-2 h-2 rounded-full bg-[#9d62ff]"></span>
              <span className="text-xs font-semibold text-white">{currentUser.name}</span>
              <span className="text-[10px] text-[#caa3ff] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#9d62ff]/15">
                Instructor
              </span>
            </div>
            <button
              onClick={onLogout}
              className="btn-ghost px-3 py-1.5 rounded-xl text-xs font-semibold text-[#caa3ff] hover:text-white cursor-pointer"
            >
              Switch Role
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
        {viewingStudentId && currentStudentProfile ? (
          <StudentProfileView
            studentProfile={currentStudentProfile}
            submission={currentStudentSubmission}
            onBack={() => setViewingStudentId(null)}
            onSubmissionUpdated={onSubmissionUpdated}
          />
        ) : activeTab === 'overview' ? (
          /* ========================================================= */
          /* INSTRUCTOR DASHBOARD OVERVIEW                             */
          /* ========================================================= */
          <div className="space-y-8">
            {/* Hero Welcome & Quick Stats */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#22222e]">
              <div>
                <h1 className="text-2xl font-bold text-white">Instructor Diagnostic Command</h1>
                <p className="text-xs text-[#94a3b8] mt-1">
                  Baseline readiness overview before computing instruction commences.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('heatmap')}
                  className="btn-ghost px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Grid className="w-3.5 h-3.5 text-[#9d62ff]" />
                  Open Heatmap
                </button>
                <button
                  onClick={() => setActiveTab('recommendations')}
                  className="btn-purple px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  View Pacing Recs
                </button>
              </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="brilliant-card rounded-2xl p-5 border border-[#2b2b3a] space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#64748b]">Total Submissions</span>
                <div className="text-2xl font-extrabold text-white">{totalSubmissions}</div>
                <div className="text-xs text-[#94a3b8]">Across {sections.length} course sections</div>
              </div>

              <div className="brilliant-card rounded-2xl p-5 border border-[#2b2b3a] space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#64748b]">Enrolled Students</span>
                <div className="text-2xl font-extrabold text-[#456dff]">{Object.keys(profiles).length}</div>
                <div className="text-xs text-[#94a3b8]">Active student profiles</div>
              </div>

              <div className="brilliant-card rounded-2xl p-5 border border-[#2b2b3a] space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#64748b]">Pending Decisions</span>
                <div className="text-2xl font-extrabold text-[#ff8d23]">{pendingRecs.length}</div>
                <div className="text-xs text-[#94a3b8]">Awaiting instructor review</div>
              </div>

              <div className="brilliant-card rounded-2xl p-5 border border-[#2b2b3a] space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#64748b]">Active Course Sections</span>
                <div className="text-2xl font-extrabold text-[#9d62ff]">{sections.length}</div>
                <div className="text-xs text-[#94a3b8]">OLSAT Form 5 & 6</div>
              </div>
            </div>

            {/* Grid: Submission Progress per Section + Top Class Gaps */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Submission Progress per Section */}
              <div className="brilliant-card rounded-2xl p-6 border border-[#2b2b3a] space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <FolderKanban className="w-4 h-4 text-[#456dff]" />
                    Submission Progress per Section
                  </h3>
                  <button
                    onClick={() => setActiveTab('sections')}
                    className="text-xs text-[#caa3ff] hover:text-white"
                  >
                    Manage Sections →
                  </button>
                </div>

                {sections.length === 0 ? (
                  <p className="text-xs text-[#64748b] py-6 text-center">
                    No sections created yet. Create a section to get started.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {sections.map((sec) => {
                      const enrolled = Object.values(profiles).filter((p) => p.sectionId === sec.id).length;
                      const submitted = submissions.filter(
                        (s) => s.sectionId === sec.id && s.status === 'submitted'
                      ).length;
                      const pct = enrolled > 0 ? Math.round((submitted / enrolled) * 100) : 0;

                      return (
                        <div key={sec.id} className="p-3.5 rounded-xl bg-[#121219] border border-[#232332] space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <div>
                              <strong className="text-white">{sec.name}</strong>
                              <span className="text-[#64748b] ml-1.5 text-[11px] font-semibold text-[#85a3ff]">
                                • {sec.course}
                              </span>
                            </div>
                            <span className="font-semibold text-[#cbd5e1]">
                              {submitted} of {enrolled} completed ({pct}%)
                            </span>
                          </div>

                          <div className="w-full bg-[#1e1e2a] h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-[#456dff] to-[#9d62ff] h-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Top Class Gaps */}
              <div className="brilliant-card rounded-2xl p-6 border border-[#2b2b3a] space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-rose-400" />
                    Top Cohort Readiness Gaps
                  </h3>
                  <button
                    onClick={() => setActiveTab('heatmap')}
                    className="text-xs text-[#caa3ff] hover:text-white"
                  >
                    View Full Matrix →
                  </button>
                </div>

                {totalSubmissions === 0 ? (
                  <p className="text-xs text-[#64748b] py-6 text-center">
                    Gaps will automatically rank here once students submit baseline tests.
                  </p>
                ) : topGaps.length === 0 ? (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Cohort performs at or above normative averages across all reasoning clusters.</span>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {topGaps.map(([cluster, count]) => {
                      const pct = Math.round((count / totalSubmissions) * 100);
                      return (
                        <div
                          key={cluster}
                          className="p-3.5 rounded-xl bg-[#141014] border border-rose-900/30 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-bold text-white">{cluster}</span>
                            <div className="text-[11px] text-[#94a3b8]">
                              {count} student{count === 1 ? '' : 's'} flagged in Below Average band
                            </div>
                          </div>
                          <span className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40">
                            {pct}% of cohort
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Pending Pacing Recommendations Preview */}
            <div className="brilliant-card rounded-2xl p-6 border border-[#2b2b3a] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#ff8d23]" />
                    AI Cohort Pacing Proposals
                  </h3>
                  <p className="text-xs text-[#94a3b8] mt-0.5">
                    Pre-instruction curricular adjustments tailored to your cohort's verified gaps.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('recommendations')}
                  className="btn-purple px-3.5 py-1.5 rounded-xl text-xs font-bold"
                >
                  Evaluate All ({recommendations.length})
                </button>
              </div>

              {recommendations.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#64748b]">
                  {totalSubmissions === 0
                    ? 'Recommendations unlock after your first student submission.'
                    : 'Click "Evaluate All" to generate cohort recommendations.'}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {recommendations.slice(0, 3).map((rec) => (
                    <div
                      key={rec.id}
                      className="p-4 rounded-xl bg-[#12121a] border border-[#262635] space-y-2 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono text-[10px] text-[#caa3ff] font-bold">{rec.id}</span>
                          <span
                            className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                              rec.status === 'approved'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : rec.status === 'pending'
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-purple-500/20 text-purple-300'
                            }`}
                          >
                            {rec.status}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-white line-clamp-1">{rec.concept}</h4>
                        <p className="text-[11px] text-[#94a3b8] line-clamp-2 mt-1">
                          {rec.suggested_action}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-[#22222f] text-[10px] text-[#ff8d23] font-semibold">
                        AI suggestion. Instructor decides.
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ========================================================= */}
            {/* COURSE RECOMMENDER: RECOMMENDED TO TEACH PANEL             */}
            {/* ========================================================= */}
            <div className="brilliant-card rounded-2xl p-6 border border-[#2b2b3a] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#a855f7]" />
                    Recommended to teach
                  </h3>
                  <p className="text-xs text-[#94a3b8] mt-0.5">
                    Up to 5 course modules grouped across students based on shared weak reasoning areas.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('courses')}
                  className="text-xs text-[#caa3ff] hover:text-white flex items-center gap-1 font-semibold cursor-pointer"
                >
                  Manage Courses Catalog ({coursesCount}) →
                </button>
              </div>

              {recommendedToTeachItems.length === 0 ? (
                <div className="p-8 rounded-xl bg-[#121219] border border-[#232332] text-center text-xs text-[#94a3b8] space-y-2">
                  <p>No grouped recommendations yet.</p>
                  <p className="text-[11px] text-[#64748b]">
                    As students complete their Baseline Check and courses exist in the catalog, suggestions matching cohort gaps will automatically appear here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {recommendedToTeachItems.map((item) => (
                    <div
                      key={item.courseId}
                      className="p-4 rounded-xl bg-[#130d22] border border-[#3b2060] space-y-2.5 flex flex-col justify-between"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#9d62ff]/20 text-[#caa3ff] border border-[#9d62ff]/30">
                            {item.targetSkill}
                          </span>
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-200 border border-purple-500/40">
                            {item.count} of {item.totalActiveStudents} students
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white">{item.courseTitle}</h4>
                      </div>

                      <div className="p-2.5 rounded-lg bg-black/50 border border-[#2a1745] text-[11px] text-[#cbd5e1] leading-relaxed">
                        <span className="text-[10px] text-[#a78bfa] font-bold block uppercase tracking-wider mb-0.5">
                          Evidence:
                        </span>
                        <span>{item.evidence}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'heatmap' ? (
          <ClassHeatmap
            sections={sections}
            submissions={submissions}
            selectedSectionId={selectedSectionId}
            onSelectSection={setSelectedSectionId}
            onCellClick={handleCellClick}
          />
        ) : activeTab === 'students' ? (
          <StudentsList
            sections={sections}
            profiles={profiles}
            submissions={submissions}
            selectedSectionId={selectedSectionId}
            onSelectSection={setSelectedSectionId}
            activeCellFilter={activeCellFilter}
            onClearCellFilter={() => setActiveCellFilter(null)}
            onSelectStudent={(id) => setViewingStudentId(id)}
          />
        ) : activeTab === 'recommendations' ? (
          <PacingRecommendationsView
            currentUser={currentUser}
            submissions={submissions}
            recommendations={recommendations}
            onRecommendationsUpdated={onRecommendationsUpdated}
          />
        ) : activeTab === 'courses' ? (
          <CourseCatalogManager
            onCatalogUpdated={() => setCoursesCount(Storage.getCourses().length)}
          />
        ) : activeTab === 'roadmap' ? (
          <InstructorRoadmapEditor
            currentUser={currentUser}
            sections={sections}
            onRoadmapUpdated={() => {}}
          />
        ) : activeTab === 'sections' ? (
          <SectionsManager
            currentUser={currentUser}
            sections={sections}
            submissions={submissions}
            onSectionCreated={onSectionCreated}
          />
        ) : (
          <ScoreInterpretationGuide />
        )}
      </main>
    </div>
  );
};
