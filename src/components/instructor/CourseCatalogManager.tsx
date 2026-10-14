import React, { useState } from 'react';
import { ClusterName, Course, CourseDifficulty, CourseLesson } from '../../types';
import { Storage } from '../../utils/storage';
import { interpretPythonCode, InterpretationResult } from '../../utils/pythonInterpreter';
import {
  BookOpen,
  Plus,
  Trash2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Code,
  Tag,
  ChevronDown,
  ChevronUp,
  Save,
  X,
  Layers,
  Edit2,
} from 'lucide-react';

interface CourseCatalogManagerProps {
  onCatalogUpdated?: () => void;
}

const ALL_SKILL_AREAS: ClusterName[] = [
  'Verbal Comprehension',
  'Verbal Reasoning',
  'Figural Reasoning',
  'Quantitative Reasoning',
];

export const SAMPLE_COURSES: Course[] = [
  {
    id: 'course_vc_01',
    title: 'Code Comprehension & Semantic Vocabulary',
    description: 'Build fluency in reading variable names, syntax tokens, and string expressions.',
    skillTags: ['Verbal Comprehension'],
    difficulty: 'Starter',
    createdAt: new Date().toISOString(),
    lessons: [
      {
        id: 'cl_vc_01',
        title: 'String Formatting & Concatenation',
        description: 'Trace how text fragments combine to form meaningful output messages.',
        code: `greeting = "Hello"
name = "Coder"
message = greeting + ", " + name + "!"
print(message)`,
        bugLineNumber: 3,
        correctBlock: `message = greeting + ", " + name + "!"`,
        wrongBlocks: [`message = greeting + name`, `message = greeting`],
        hint: 'Remember to include the comma and space separator between words.',
      },
    ],
  },
  {
    id: 'course_vr_01',
    title: 'Conditional Branching & Deduction',
    description: 'Practice deductive reasoning with boolean truth conditions and decision branches.',
    skillTags: ['Verbal Reasoning'],
    difficulty: 'Starter',
    createdAt: new Date().toISOString(),
    lessons: [
      {
        id: 'cl_vr_01',
        title: 'Boolean Guard Conditions',
        description: 'Evaluate multiple compound conditions to determine program branch path.',
        code: `has_key = True
door_locked = False
if has_key and not door_locked:
    result = "Open"
else:
    result = "Locked"
print(result)`,
        bugLineNumber: 3,
        correctBlock: `if has_key and not door_locked:`,
        wrongBlocks: [`if has_key or door_locked:`, `if not has_key:`],
        hint: 'Both conditions must be satisfied for the door to open.',
      },
    ],
  },
  {
    id: 'course_fr_01',
    title: 'Visual Loops & Spatial Patterns',
    description: 'Connect visual pattern recognition and cyclic symmetry with loop variables.',
    skillTags: ['Figural Reasoning'],
    difficulty: 'Starter',
    createdAt: new Date().toISOString(),
    lessons: [
      {
        id: 'cl_fr_01',
        title: 'Alternating Grid Pattern',
        description: 'Generate repeating structural alternating tiles based on index parity.',
        code: `pattern = ""
for i in range(1, 5):
    if i % 2 == 1:
        pattern = pattern + "X"
    else:
        pattern = pattern + "O"
print(pattern)`,
        bugLineNumber: 3,
        correctBlock: `if i % 2 == 1:`,
        wrongBlocks: [`if i == 1:`, `if i % 2 == 0:`],
        hint: 'Odd numbers produce X and even numbers produce O.',
      },
    ],
  },
  {
    id: 'course_qr_01',
    title: 'Step Counting & Number Series',
    description: 'Develop intuition for arithmetic progression and loop accumulator invariants.',
    skillTags: ['Quantitative Reasoning'],
    difficulty: 'Starter',
    createdAt: new Date().toISOString(),
    lessons: [
      {
        id: 'cl_qr_01',
        title: 'Even Number Accumulator',
        description: 'Sum consecutive even numbers across a fixed range step.',
        code: `total = 0
for n in range(2, 7, 2):
    total = total + n
print(total)`,
        bugLineNumber: 3,
        correctBlock: `total = total + n`,
        wrongBlocks: [`total = total + 1`, `total = n`],
        hint: 'The running total should accumulate the value of n at each step.',
      },
    ],
  },
];

export const CourseCatalogManager: React.FC<CourseCatalogManagerProps> = ({ onCatalogUpdated }) => {
  const [courses, setCourses] = useState<Course[]>(() => Storage.getCourses());
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);

  // Unsaved drafts state for "Load example courses"
  const [draftCourses, setDraftCourses] = useState<Course[] | null>(null);

  // Add/Edit Course Modal State
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDesc, setCourseDesc] = useState('');
  const [selectedTags, setSelectedTags] = useState<ClusterName[]>([]);
  const [courseDifficulty, setCourseDifficulty] = useState<CourseDifficulty>('Starter');
  const [courseLessons, setCourseLessons] = useState<CourseLesson[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  // Lesson sub-form state (inside course modal)
  const [showLessonSubForm, setShowLessonSubForm] = useState(false);
  const [editingLessonIndex, setEditingLessonIndex] = useState<number | null>(null);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDesc, setLessonDesc] = useState('');
  const [lessonCode, setLessonCode] = useState('');
  const [lessonBugLine, setLessonBugLine] = useState<number | ''>('');
  const [lessonCorrectBlock, setLessonCorrectBlock] = useState('');
  const [lessonWrong1, setLessonWrong1] = useState('');
  const [lessonWrong2, setLessonWrong2] = useState('');
  const [lessonWrong3, setLessonWrong3] = useState('');
  const [lessonHint, setLessonHint] = useState('');
  const [lessonValidation, setLessonValidation] = useState<InterpretationResult | null>(null);
  const [lessonError, setLessonError] = useState<string | null>(null);

  const refreshCourses = () => {
    const updated = Storage.getCourses();
    setCourses(updated);
    onCatalogUpdated?.();
  };

  // Click "Load example courses"
  const handleLoadExamples = () => {
    // Fill 4 sample courses into draft staging state. The instructor must still press Save!
    setDraftCourses(SAMPLE_COURSES);
  };

  // Save all draft courses from staging
  const handleSaveDraftCourses = () => {
    if (!draftCourses) return;
    Storage.saveCourses(draftCourses);
    setDraftCourses(null);
    refreshCourses();
  };

  // Open Add Course Modal
  const handleOpenAddModal = () => {
    setEditingCourseId(null);
    setCourseTitle('');
    setCourseDesc('');
    setSelectedTags(['Verbal Reasoning']);
    setCourseDifficulty('Starter');
    setCourseLessons([]);
    setFormError(null);
    setShowLessonSubForm(false);
    setShowCourseModal(true);
  };

  // Open Edit Course Modal
  const handleOpenEditModal = (c: Course) => {
    setEditingCourseId(c.id);
    setCourseTitle(c.title);
    setCourseDesc(c.description);
    setSelectedTags([...c.skillTags]);
    setCourseDifficulty(c.difficulty);
    setCourseLessons([...c.lessons]);
    setFormError(null);
    setShowLessonSubForm(false);
    setShowCourseModal(true);
  };

  // Delete Course
  const handleDeleteCourse = (id: string) => {
    Storage.deleteCourse(id);
    refreshCourses();
  };

  // Toggle Skill Tag in Form
  const handleToggleTag = (tag: ClusterName) => {
    if (selectedTags.includes(tag)) {
      if (selectedTags.length > 1) {
        setSelectedTags(selectedTags.filter((t) => t !== tag));
      }
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // Open Lesson sub-form to add a new lesson
  const handleOpenNewLessonForm = () => {
    setEditingLessonIndex(null);
    setLessonTitle('');
    setLessonDesc('');
    setLessonCode(`total = 0\nfor i in range(1, 5):\n    total += i\nprint(total)`);
    setLessonBugLine('');
    setLessonCorrectBlock('');
    setLessonWrong1('');
    setLessonWrong2('');
    setLessonWrong3('');
    setLessonHint('');
    setLessonValidation(null);
    setLessonError(null);
    setShowLessonSubForm(true);
  };

  // Validate Lesson Code
  const handleValidateLessonCode = () => {
    setLessonError(null);
    if (!lessonCode.trim()) {
      setLessonError('Please enter Python code (max 12 lines).');
      return;
    }
    const res = interpretPythonCode(lessonCode);
    setLessonValidation(res);
    if (!res.valid) {
      setLessonError(res.error || 'Code validation failed');
    }
  };

  // Save Lesson into Course Lessons array
  const handleSaveLessonSubForm = () => {
    setLessonError(null);
    if (!lessonTitle.trim() || !lessonDesc.trim() || !lessonCode.trim()) {
      setLessonError('Please fill in title, description, and code.');
      return;
    }

    const res = interpretPythonCode(lessonCode);
    if (!res.valid) {
      setLessonError(res.error || "This lesson can't be visualized yet.");
      setLessonValidation(res);
      return;
    }

    const wrongBlocks = [lessonWrong1, lessonWrong2, lessonWrong3].filter((w) => w.trim());

    const newLesson: CourseLesson = {
      id: editingLessonIndex !== null ? courseLessons[editingLessonIndex].id : 'cl_' + Math.random().toString(36).substring(2, 9),
      title: lessonTitle.trim(),
      description: lessonDesc.trim(),
      code: lessonCode.trim(),
      bugLineNumber: lessonBugLine ? Number(lessonBugLine) : undefined,
      correctBlock: lessonCorrectBlock.trim() || undefined,
      wrongBlocks: wrongBlocks.length > 0 ? wrongBlocks : undefined,
      hint: lessonHint.trim() || undefined,
    };

    if (editingLessonIndex !== null) {
      const updated = [...courseLessons];
      updated[editingLessonIndex] = newLesson;
      setCourseLessons(updated);
    } else {
      setCourseLessons([...courseLessons, newLesson]);
    }

    setShowLessonSubForm(false);
  };

  // Save entire Course
  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!courseTitle.trim() || !courseDesc.trim()) {
      setFormError('Please enter course title and one-line description.');
      return;
    }
    if (selectedTags.length === 0) {
      setFormError('Please select at least one skill tag.');
      return;
    }
    if (courseLessons.length === 0) {
      setFormError('Please add at least one lesson to this course.');
      return;
    }

    const courseToSave: Course = {
      id: editingCourseId || 'course_' + Math.random().toString(36).substring(2, 9),
      title: courseTitle.trim(),
      description: courseDesc.trim(),
      skillTags: selectedTags,
      difficulty: courseDifficulty,
      lessons: courseLessons,
      createdAt: new Date().toISOString(),
    };

    Storage.saveCourse(courseToSave);
    setShowCourseModal(false);
    refreshCourses();
  };

  const getDifficultyBadge = (diff: CourseDifficulty) => {
    if (diff === 'Starter') return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    if (diff === 'Core') return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
    return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#242430]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white">Course Catalog</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#9d62ff]/20 text-[#caa3ff] border border-[#9d62ff]/30 font-semibold">
              {courses.length} {courses.length === 1 ? 'Course' : 'Courses'}
            </span>
          </div>
          <p className="text-xs text-[#94a3b8] mt-1">
            Modular courses mapped to the 4 cognitive reasoning skill areas. Used by the Course Recommender to suggest personalized learning.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleLoadExamples}
            className="btn-ghost px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-[#3b2060] text-[#caa3ff] hover:text-white cursor-pointer"
            title="Pre-fills 4 sample courses mapped to the 4 skill areas. You must still press Save."
          >
            <Sparkles className="w-3.5 h-3.5 text-[#a855f7]" />
            Load example courses
          </button>
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="btn-purple px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add course
          </button>
        </div>
      </div>

      {/* Draft Staging Banner when 'Load example courses' is clicked */}
      {draftCourses && (
        <div className="p-4 rounded-2xl bg-[#1b1429] border border-[#9d62ff]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#9d62ff]/20 text-[#caa3ff] flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-[#caa3ff]" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>4 Example Courses Loaded as Drafts</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold">
                  Unsaved
                </span>
              </div>
              <p className="text-[11px] text-[#cbd5e1] mt-0.5">
                Review below. You must press <strong>Save Courses</strong> to add them to your official catalog.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setDraftCourses(null)}
              className="px-3 py-1.5 rounded-xl text-xs text-[#94a3b8] hover:text-white border border-[#2d2d3e] cursor-pointer"
            >
              Discard
            </button>
            <button
              type="button"
              onClick={handleSaveDraftCourses}
              className="btn-purple px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(157,98,255,0.4)]"
            >
              <Save className="w-3.5 h-3.5" />
              Save Courses
            </button>
          </div>
        </div>
      )}

      {/* Preview Draft Courses if loaded */}
      {draftCourses && (
        <div className="space-y-3">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#a78bfa] flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            <span>Draft Example Courses Ready to Save (4)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {draftCourses.map((c) => (
              <div
                key={c.id}
                className="brilliant-card rounded-2xl p-5 border border-[#4c2882] bg-[#120a1f] space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${getDifficultyBadge(c.difficulty)}`}>
                      {c.difficulty}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-1.5">{c.title}</h3>
                  </div>
                  <span className="text-[11px] text-[#caa3ff] bg-[#221338] px-2 py-0.5 rounded border border-[#3b2060]">
                    1 lesson
                  </span>
                </div>
                <p className="text-xs text-[#94a3b8] leading-relaxed">{c.description}</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {c.skillTags.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-[#1e172e] text-[#caa3ff] border border-[#362354]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {courses.length === 0 && !draftCourses && (
        <div className="brilliant-card rounded-2xl p-12 text-center border border-[#242430] space-y-4 max-w-xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-[#1e1e2c] border border-[#2d2d3e] flex items-center justify-center mx-auto text-[#caa3ff]">
            <BookOpen className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Course Catalog is Empty</h3>
            <p className="text-xs text-[#94a3b8] max-w-md mx-auto">
              No courses yet. Add a course so the recommender has something to suggest.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleLoadExamples}
              className="btn-ghost px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-[#3b2060] text-[#caa3ff] hover:text-white cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#a855f7]" />
              Load example courses
            </button>
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="btn-purple px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add course
            </button>
          </div>
        </div>
      )}

      {/* Existing Courses List */}
      {courses.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.map((c) => {
              const isExpanded = expandedCourseId === c.id;
              return (
                <div
                  key={c.id}
                  className="brilliant-card rounded-2xl p-5 border border-[#252535] hover:border-[#38384e] transition-all space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${getDifficultyBadge(c.difficulty)}`}>
                          {c.difficulty}
                        </span>
                        <span className="text-[10px] text-[#94a3b8]">
                          {c.lessons.length} {c.lessons.length === 1 ? 'lesson' : 'lessons'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(c)}
                          className="p-1.5 rounded-lg text-[#94a3b8] hover:text-white hover:bg-[#1f1f2e] transition-colors cursor-pointer"
                          title="Edit Course"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCourse(c.id)}
                          className="p-1.5 rounded-lg text-[#94a3b8] hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Delete Course"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-white">{c.title}</h3>
                    <p className="text-xs text-[#94a3b8] leading-relaxed">{c.description}</p>

                    {/* Skill Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {c.skillTags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-[#1a1426] text-[#caa3ff] border border-[#2e2047] font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Lessons Preview Accordion */}
                  <div className="pt-2 border-t border-[#1e1e2c]">
                    <button
                      type="button"
                      onClick={() => setExpandedCourseId(isExpanded ? null : c.id)}
                      className="w-full flex items-center justify-between text-xs text-[#a78bfa] hover:text-white font-semibold py-1 cursor-pointer"
                    >
                      <span>Course Lessons ({c.lessons.length})</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {isExpanded && (
                      <div className="mt-2.5 space-y-2">
                        {c.lessons.map((les, idx) => (
                          <div
                            key={les.id || idx}
                            className="p-3 rounded-xl bg-[#0c0c12] border border-[#222230] text-xs space-y-1.5"
                          >
                            <div className="font-semibold text-white flex items-center justify-between">
                              <span>
                                {idx + 1}. {les.title}
                              </span>
                              {les.bugLineNumber && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                                  Interactive Bug (Line {les.bugLineNumber})
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-[#94a3b8]">{les.description}</div>
                            <pre className="p-2 rounded bg-black/60 border border-[#1b1b24] font-mono text-[10px] text-[#38bdf8] overflow-x-auto">
                              {les.code}
                            </pre>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add / Edit Course Modal */}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="brilliant-card rounded-2xl border border-[#3b2060] bg-[#120b1e] w-full max-w-2xl p-6 space-y-5 my-8 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#2d1b4a]">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#caa3ff]" />
                <h3 className="text-base font-bold text-white">
                  {editingCourseId ? 'Edit Course' : 'Add Course to Catalog'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCourseModal(false)}
                className="text-[#94a3b8] hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveCourse} className="space-y-4 text-xs">
              {/* Course Title */}
              <div className="space-y-1">
                <label className="text-white font-semibold block">Course Title *</label>
                <input
                  type="text"
                  required
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  placeholder="e.g. Conditional Branching & Deduction"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1b102b] border border-[#3b2060] text-white text-xs focus:outline-none focus:border-[#a855f7]"
                />
              </div>

              {/* One-line Description */}
              <div className="space-y-1">
                <label className="text-white font-semibold block">One-line Description *</label>
                <input
                  type="text"
                  required
                  value={courseDesc}
                  onChange={(e) => setCourseDesc(e.target.value)}
                  placeholder="e.g. Master variable naming, semantics, and condition tracing in code."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1b102b] border border-[#3b2060] text-white text-xs focus:outline-none focus:border-[#a855f7]"
                />
              </div>

              {/* Skill Tags */}
              <div className="space-y-1.5">
                <label className="text-white font-semibold block">
                  Skill Tags (One or more of the 4 skill areas) *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {ALL_SKILL_AREAS.map((tag) => {
                    const isChecked = selectedTags.includes(tag);
                    return (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => handleToggleTag(tag)}
                        className={`px-3 py-2 rounded-xl text-left font-medium transition-all flex items-center justify-between border cursor-pointer ${
                          isChecked
                            ? 'bg-[#9d62ff]/20 border-[#9d62ff] text-white shadow-sm'
                            : 'bg-[#1b102b] border-[#3b2060] text-[#94a3b8] hover:text-white'
                        }`}
                      >
                        <span>{tag}</span>
                        {isChecked && <CheckCircle2 className="w-3.5 h-3.5 text-[#caa3ff]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Difficulty */}
              <div className="space-y-1.5">
                <label className="text-white font-semibold block">Difficulty *</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Starter', 'Core', 'Challenge'] as CourseDifficulty[]).map((diff) => (
                    <button
                      type="button"
                      key={diff}
                      onClick={() => setCourseDifficulty(diff)}
                      className={`py-2 rounded-xl text-center font-bold text-xs border transition-all cursor-pointer ${
                        courseDifficulty === diff
                          ? 'bg-[#9d62ff]/25 border-[#9d62ff] text-white'
                          : 'bg-[#1b102b] border-[#3b2060] text-[#94a3b8] hover:text-white'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lessons inside course */}
              <div className="pt-2 border-t border-[#2d1b4a] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-white font-bold block">Lessons inside this Course *</span>
                    <span className="text-[11px] text-[#94a3b8]">
                      Reuses the logic visualizer lesson format (max 12 lines Python).
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenNewLessonForm}
                    className="px-3 py-1.5 rounded-xl bg-[#27153d] hover:bg-[#381e57] text-[#caa3ff] hover:text-white border border-[#44236e] font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Lesson
                  </button>
                </div>

                {/* Lesson Sub-Form */}
                {showLessonSubForm && (
                  <div className="p-4 rounded-xl bg-[#0e0717] border border-[#522987] space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">
                        {editingLessonIndex !== null ? 'Edit Lesson' : 'New Lesson'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowLessonSubForm(false)}
                        className="text-[#94a3b8] hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {lessonError && (
                      <div className="p-2 rounded bg-rose-500/20 text-rose-300 text-[11px]">
                        {lessonError}
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="text-[#caa3ff] font-medium block">Lesson Title</label>
                      <input
                        type="text"
                        value={lessonTitle}
                        onChange={(e) => setLessonTitle(e.target.value)}
                        placeholder="e.g. Trace Variable Values"
                        className="w-full px-3 py-1.5 rounded-lg bg-[#1a0f29] border border-[#3b2060] text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[#caa3ff] font-medium block">Description</label>
                      <input
                        type="text"
                        value={lessonDesc}
                        onChange={(e) => setLessonDesc(e.target.value)}
                        placeholder="e.g. Follow variable total as it changes"
                        className="w-full px-3 py-1.5 rounded-lg bg-[#1a0f29] border border-[#3b2060] text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[#caa3ff] font-medium">Python Code (Max 12 lines)</label>
                        <button
                          type="button"
                          onClick={handleValidateLessonCode}
                          className="text-[10px] text-[#caa3ff] hover:underline cursor-pointer"
                        >
                          Test / Validate Code
                        </button>
                      </div>
                      <textarea
                        rows={4}
                        value={lessonCode}
                        onChange={(e) => setLessonCode(e.target.value)}
                        className="w-full p-2.5 rounded-lg bg-black/70 border border-[#3b2060] font-mono text-[11px] text-[#38bdf8] focus:outline-none focus:border-[#a855f7]"
                      />
                    </div>

                    {lessonValidation && (
                      <div className={`p-2 rounded text-[11px] ${lessonValidation.valid ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'}`}>
                        {lessonValidation.valid
                          ? `Code valid! Trace generated ${lessonValidation.steps.length} execution steps.`
                          : lessonValidation.error}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[#caa3ff] font-medium block">Bug Line # (optional)</label>
                        <input
                          type="number"
                          value={lessonBugLine}
                          onChange={(e) => setLessonBugLine(e.target.value ? Number(e.target.value) : '')}
                          placeholder="e.g. 3"
                          className="w-full px-3 py-1.5 rounded-lg bg-[#1a0f29] border border-[#3b2060] text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[#caa3ff] font-medium block">Correct Block</label>
                        <input
                          type="text"
                          value={lessonCorrectBlock}
                          onChange={(e) => setLessonCorrectBlock(e.target.value)}
                          placeholder="e.g. total = total + i"
                          className="w-full px-3 py-1.5 rounded-lg bg-[#1a0f29] border border-[#3b2060] text-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[#caa3ff] font-medium block">Wrong Blocks (Distractors)</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={lessonWrong1}
                          onChange={(e) => setLessonWrong1(e.target.value)}
                          placeholder="Distractor 1"
                          className="w-full px-3 py-1 rounded bg-[#1a0f29] border border-[#3b2060] text-white text-[11px]"
                        />
                        <input
                          type="text"
                          value={lessonWrong2}
                          onChange={(e) => setLessonWrong2(e.target.value)}
                          placeholder="Distractor 2"
                          className="w-full px-3 py-1 rounded bg-[#1a0f29] border border-[#3b2060] text-white text-[11px]"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowLessonSubForm(false)}
                        className="px-3 py-1 rounded-lg text-xs text-[#94a3b8] hover:text-white cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveLessonSubForm}
                        className="btn-purple px-3 py-1 rounded-lg text-xs font-bold cursor-pointer"
                      >
                        Save Lesson to Course
                      </button>
                    </div>
                  </div>
                )}

                {/* Lessons List in Modal */}
                {courseLessons.length === 0 ? (
                  <div className="p-4 rounded-xl bg-[#1b102b] border border-dashed border-[#3b2060] text-center text-[#94a3b8]">
                    No lessons in this course yet. Click <strong>Add Lesson</strong> above.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {courseLessons.map((les, idx) => (
                      <div
                        key={les.id || idx}
                        className="p-2.5 rounded-xl bg-[#1a0f29] border border-[#3b2060] flex items-center justify-between"
                      >
                        <div>
                          <div className="font-semibold text-white">
                            {idx + 1}. {les.title}
                          </div>
                          <div className="text-[11px] text-[#94a3b8]">{les.description}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCourseLessons(courseLessons.filter((_, i) => i !== idx))}
                          className="p-1 rounded text-rose-400 hover:text-rose-300 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2d1b4a]">
                <button
                  type="button"
                  onClick={() => setShowCourseModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#94a3b8] hover:text-white border border-[#3b2060] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-purple px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
