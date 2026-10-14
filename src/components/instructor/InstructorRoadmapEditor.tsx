import React, { useState } from 'react';
import { Announcement, Lesson, Section, User } from '../../types';
import { Storage } from '../../utils/storage';
import { interpretPythonCode, InterpretationResult } from '../../utils/pythonInterpreter';
import {
  GitBranch,
  Plus,
  Trash2,
  Copy,
  Check,
  Send,
  BookOpen,
  Sparkles,
  ArrowDown,
  Play,
  AlertCircle,
  CheckCircle2,
  Terminal,
} from 'lucide-react';

interface InstructorRoadmapEditorProps {
  currentUser: User;
  sections: Section[];
  onRoadmapUpdated?: () => void;
}

export const InstructorRoadmapEditor: React.FC<InstructorRoadmapEditorProps> = ({
  currentUser,
  sections,
  onRoadmapUpdated,
}) => {
  const [selectedSectionId, setSelectedSectionId] = useState<string>(
    sections[0]?.id || ''
  );

  const selectedSection = sections.find((s) => s.id === selectedSectionId) || sections[0];

  // Lessons and announcements state
  const [lessons, setLessons] = useState<Lesson[]>(() =>
    selectedSection ? Storage.getLessons(selectedSection.id) : []
  );
  const [announcements, setAnnouncements] = useState<Announcement[]>(() =>
    selectedSection ? Storage.getAnnouncements(selectedSection.id) : []
  );

  // New announcement text box
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementSuccess, setAnnouncementSuccess] = useState(false);

  // Add lesson modal state
  const [showAddLessonModal, setShowAddLessonModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [code, setCode] = useState('');
  const [bugLineNumber, setBugLineNumber] = useState<number | ''>('');
  const [correctBlock, setCorrectBlock] = useState('');
  const [wrongBlock1, setWrongBlock1] = useState('');
  const [wrongBlock2, setWrongBlock2] = useState('');
  const [wrongBlock3, setWrongBlock3] = useState('');
  const [positionTarget, setPositionTarget] = useState<string>('end');
  const [isBranch, setIsBranch] = useState(false);
  const [branchFromId, setBranchFromId] = useState<string>('');
  const [openToAll, setOpenToAll] = useState(false);

  // Code validation / trace preview state
  const [validationResult, setValidationResult] = useState<InterpretationResult | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Copy code feedback
  const [copiedCode, setCopiedCode] = useState(false);

  const refreshData = () => {
    if (selectedSection) {
      setLessons(Storage.getLessons(selectedSection.id));
      setAnnouncements(Storage.getAnnouncements(selectedSection.id));
      onRoadmapUpdated?.();
    }
  };

  const handleCopyCode = (codeText: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Switch section
  const handleSelectSection = (secId: string) => {
    setSelectedSectionId(secId);
    setLessons(Storage.getLessons(secId));
    setAnnouncements(Storage.getAnnouncements(secId));
  };

  // Post announcement
  const handlePostAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSection || !announcementText.trim()) return;

    const newAnnouncement: Announcement = {
      id: 'ann_' + Math.random().toString(36).substring(2, 9),
      sectionId: selectedSection.id,
      text: announcementText.trim(),
      instructorName: currentUser.name,
      createdAt: new Date().toISOString(),
    };

    Storage.saveAnnouncement(newAnnouncement);
    setAnnouncementText('');
    setAnnouncementSuccess(true);
    setTimeout(() => setAnnouncementSuccess(false), 2500);
    refreshData();
  };

  // Load example lesson (as specified in user requirements)
  const handleLoadExample = () => {
    setTitle('Sum of 1 to 5');
    setDescription('Calculate the sum of numbers from 1 to 5 using an accumulator pattern.');
    setCode(`total = 0
for i in range(1, 5 + 1):
    total += total
print(total)`);
    setBugLineNumber(3);
    setCorrectBlock('total = total + i');
    setWrongBlock1('total = i');
    setWrongBlock2('total = total + 1');
    setWrongBlock3('');
    setFormError(null);

    // Validate immediately
    const res = interpretPythonCode(`total = 0
for i in range(1, 5 + 1):
    total += total
print(total)`);
    setValidationResult(res);
  };

  // Validate code in form
  const handleValidateCode = () => {
    setFormError(null);
    if (!code.trim()) {
      setFormError('Please enter Python code (max 12 lines).');
      return;
    }
    const res = interpretPythonCode(code);
    setValidationResult(res);
    if (!res.valid) {
      setFormError(res.error || 'Code validation failed');
    }
  };

  // Save lesson
  const handleSaveLesson = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!selectedSection) return;
    if (!title.trim() || !description.trim() || !code.trim()) {
      setFormError('Please fill in title, description, and code.');
      return;
    }

    // Validate with interpreter
    const res = interpretPythonCode(code);
    if (!res.valid) {
      setFormError(res.error || "This lesson can't be visualized yet.");
      setValidationResult(res);
      return;
    }

    const wrongBlocks = [wrongBlock1, wrongBlock2, wrongBlock3].filter((b) => b.trim());

    // Compute position
    const currentLessons = Storage.getLessons(selectedSection.id);
    let newPosition = currentLessons.length + 1;
    if (positionTarget !== 'end') {
      const idx = currentLessons.findIndex((l) => l.id === positionTarget);
      if (idx >= 0) newPosition = idx + 2;
    }

    const newLesson: Lesson = {
      id: 'les_' + Math.random().toString(36).substring(2, 9),
      sectionId: selectedSection.id,
      title: title.trim(),
      description: description.trim(),
      code: code.trim(),
      bugLineNumber: bugLineNumber ? Number(bugLineNumber) : undefined,
      correctBlock: correctBlock.trim() || undefined,
      wrongBlocks: wrongBlocks.length > 0 ? wrongBlocks : undefined,
      hint: 'Think about how the variable accumulates on each iteration.',
      position: newPosition,
      branchFromId: isBranch && branchFromId ? branchFromId : undefined,
      openToAll,
      createdAt: new Date().toISOString(),
    };

    Storage.saveLesson(newLesson);
    setShowAddLessonModal(false);
    resetForm();
    refreshData();
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCode('');
    setBugLineNumber('');
    setCorrectBlock('');
    setWrongBlock1('');
    setWrongBlock2('');
    setWrongBlock3('');
    setValidationResult(null);
    setFormError(null);
    setIsBranch(false);
    setBranchFromId('');
    setOpenToAll(false);
  };

  const handleDeleteLesson = (lessonId: string) => {
    Storage.deleteLesson(lessonId);
    refreshData();
  };

  if (!selectedSection) {
    return (
      <div className="p-8 text-center text-[#94a3b8] text-xs">
        No sections available. Please create a section first.
      </div>
    );
  }

  const classCode = selectedSection.classCode || selectedSection.name;

  return (
    <div className="space-y-8">
      {/* Header bar & Class code display */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#26153d]">
        <div>
          <h2 className="text-xl font-extrabold text-white">Classroom Roadmap & Lessons</h2>
          <p className="text-xs text-[#a78bfa] mt-1">
            Build and sequence interactive logic visualizer lessons. Students view these as a connected skill tree.
          </p>
        </div>

        {/* Section switcher & Class Code Badge */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedSectionId}
            onChange={(e) => handleSelectSection(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-[#160c24] border border-[#3b2060] text-xs text-white focus:outline-none focus:border-[#a855f7]"
          >
            {sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.course})
              </option>
            ))}
          </select>

          {/* Generated Class Code chip with copy button */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#221338] border border-[#3d1f60]">
            <span className="text-[10px] text-[#a78bfa] uppercase font-bold">Class Code:</span>
            <span className="font-mono text-xs font-bold text-white">{classCode}</span>
            <button
              type="button"
              onClick={() => handleCopyCode(classCode)}
              className="text-[#c084fc] hover:text-white p-1 rounded hover:bg-[#311750] transition-colors cursor-pointer"
              title="Copy code to share with students"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ========================================================= */}
        {/* LEFT 2 COLS: TREE ROADMAP EDITOR                          */}
        {/* ========================================================= */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#c084fc]">
              Roadmap Flow ({1 + lessons.length} Nodes)
            </h3>
            <button
              type="button"
              onClick={() => {
                resetForm();
                setShowAddLessonModal(true);
              }}
              className="px-4 py-2 rounded-xl bg-[#9333ea] hover:bg-[#a855f7] text-white text-xs font-bold flex items-center gap-1.5 shadow-[0_3px_0_0_#6b21a8] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Lesson</span>
            </button>
          </div>

          {/* Skill tree representation */}
          <div className="p-8 rounded-3xl bg-[#140b20] border border-[#2c1748] relative flex flex-col items-center">
            {/* Trunk line */}
            <div className="absolute top-14 bottom-14 w-1.5 bg-[#2a1444] rounded-full" />

            {/* NODE 1: BASELINE CHECK (Always first) */}
            <div className="relative z-10 flex flex-col items-center mb-8 w-full max-w-sm">
              <div className="w-14 h-14 rounded-full bg-[#1b0e2d] border-4 border-[#9333ea] text-white flex items-center justify-center font-bold text-sm shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                1
              </div>
              <div className="mt-2 text-center p-3 rounded-2xl bg-[#1d1030] border border-[#3b2060] w-full">
                <span className="text-xs font-bold text-white block">Baseline Check (OLSAT Assessment)</span>
                <span className="text-[10px] text-[#a78bfa] block">
                  Mandatory entrance diagnostic baseline (Built-in, always Node 1)
                </span>
              </div>
            </div>

            {/* PLUS BUTTON BETWEEN NODE 1 AND 2 */}
            <div className="relative z-10 mb-8">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setPositionTarget('baseline');
                  setShowAddLessonModal(true);
                }}
                className="w-8 h-8 rounded-full bg-[#271440] hover:bg-[#9333ea] text-[#c084fc] hover:text-white border border-[#44236b] flex items-center justify-center transition-all cursor-pointer shadow-md"
                title="Insert lesson here"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* LESSON NODES */}
            {lessons.length === 0 ? (
              <div className="relative z-10 p-6 rounded-2xl bg-[#1b0f2c] border border-[#301a4c] text-center max-w-xs">
                <p className="text-xs text-[#a78bfa] mb-3">
                  No instructor lessons added yet.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    handleLoadExample();
                    setShowAddLessonModal(true);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-[#281442] hover:bg-[#371b5a] text-[#c084fc] text-xs font-semibold cursor-pointer"
                >
                  Load Example Lesson
                </button>
              </div>
            ) : (
              lessons.map((lesson, idx) => (
                <React.Fragment key={lesson.id}>
                  <div
                    className={`relative z-10 flex flex-col items-center mb-8 w-full max-w-sm ${
                      lesson.branchFromId ? 'translate-x-12' : ''
                    }`}
                  >
                    <div className="w-14 h-14 rounded-full bg-[#1b0e2d] border-4 border-[#c084fc] text-white flex items-center justify-center font-bold text-sm shadow-[0_0_15px_rgba(192,132,252,0.3)]">
                      {idx + 2}
                    </div>

                    <div className="mt-2 p-3.5 rounded-2xl bg-[#1d1030] border border-[#3b2060] w-full space-y-1 relative group">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <strong className="text-xs text-white block">{lesson.title}</strong>
                          <p className="text-[11px] text-[#a78bfa] line-clamp-1">{lesson.description}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteLesson(lesson.id)}
                          className="text-[#6b4c8f] hover:text-rose-400 p-1 rounded transition-colors"
                          title="Delete lesson"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 pt-1 text-[10px] text-[#6b4c8f]">
                        <span className="font-mono">{lesson.code.split('\n').length} lines</span>
                        {lesson.bugLineNumber && (
                          <span className="text-[#ef4444] font-semibold">
                            • Bug on line {lesson.bugLineNumber}
                          </span>
                        )}
                        {lesson.branchFromId && (
                          <span className="text-[#c084fc] font-semibold flex items-center gap-0.5">
                            <GitBranch className="w-2.5 h-2.5" /> Branch
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Plus between nodes */}
                  <div className="relative z-10 mb-8">
                    <button
                      type="button"
                      onClick={() => {
                        resetForm();
                        setPositionTarget(lesson.id);
                        setShowAddLessonModal(true);
                      }}
                      className="w-8 h-8 rounded-full bg-[#271440] hover:bg-[#9333ea] text-[#c084fc] hover:text-white border border-[#44236b] flex items-center justify-center transition-all cursor-pointer shadow-md"
                      title="Insert lesson here"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </React.Fragment>
              ))
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT 1 COL: ANNOUNCEMENTS POSTER                         */}
        {/* ========================================================= */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-[#140b20] border border-[#2c1748] space-y-4">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Post Announcement
              </h3>
              <p className="text-xs text-[#a78bfa] mt-1">
                Share a plain text note directly with students in this classroom.
              </p>
            </div>

            {announcementSuccess && (
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-[#22c55e] text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Announcement posted to classroom!</span>
              </div>
            )}

            <form onSubmit={handlePostAnnouncement} className="space-y-3">
              <textarea
                required
                rows={3}
                placeholder="e.g. Welcome everyone! Please complete the Baseline Check before our first lab."
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#0e0717] border border-[#3b2060] text-white text-xs leading-relaxed focus:outline-none focus:border-[#a855f7]"
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#9333ea] hover:bg-[#a855f7] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-[0_3px_0_0_#6b21a8] cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post Announcement</span>
              </button>
            </form>

            {/* List of existing announcements */}
            <div className="pt-3 border-t border-[#26133f] space-y-2.5">
              <span className="text-[11px] font-bold text-[#a78bfa] uppercase block">
                Classroom Feed ({announcements.length})
              </span>
              {announcements.length === 0 ? (
                <p className="text-[11px] text-[#6b4c8f] italic">No announcements posted yet.</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {announcements.map((a) => (
                    <div
                      key={a.id}
                      className="p-3 rounded-xl bg-[#1b0e2b] border border-[#2f1847] text-xs space-y-1"
                    >
                      <span className="text-[10px] text-[#6b4c8f] block">
                        {new Date(a.createdAt).toLocaleDateString()}
                      </span>
                      <p className="text-[#cbd5e1] leading-relaxed whitespace-pre-wrap">{a.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* ADD LESSON MODAL WITH CODE VALIDATION & PREVIEW           */}
      {/* ========================================================= */}
      {showAddLessonModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#160c24] border border-[#3b2060] p-7 shadow-2xl space-y-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-extrabold text-white">Add Visualizer Lesson</h3>
                <p className="text-xs text-[#a78bfa] mt-0.5">
                  Code will be parsed and verified by the deterministic interpreter.
                </p>
              </div>

              {/* Load Example Lesson button */}
              <button
                type="button"
                onClick={handleLoadExample}
                className="px-3.5 py-1.5 rounded-xl bg-[#2b1446] hover:bg-[#3b1c60] text-[#c084fc] border border-[#482375] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Load example lesson</span>
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveLesson} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#c084fc] mb-1">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sum of 1 to 5"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0f0718] border border-[#381c5a] text-white text-xs focus:outline-none focus:border-[#a855f7]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#c084fc] mb-1">
                  One-line Description *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Calculate the sum of 1..5 with an accumulator"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0f0718] border border-[#381c5a] text-white text-xs focus:outline-none focus:border-[#a855f7]"
                />
              </div>

              {/* Code text area (max 12 lines) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[#c084fc]">
                    Code (Max 12 lines, Python subset) *
                  </label>
                  <button
                    type="button"
                    onClick={handleValidateCode}
                    className="text-[11px] text-[#c084fc] hover:text-white underline cursor-pointer"
                  >
                    Check syntax
                  </button>
                </div>
                <textarea
                  required
                  rows={6}
                  placeholder={`total = 0\nfor i in range(1, 5 + 1):\n    total += total\nprint(total)`}
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    setValidationResult(null);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0f0718] border border-[#381c5a] text-white font-mono text-xs leading-relaxed focus:outline-none focus:border-[#a855f7]"
                />
                <span className="text-[10px] text-[#6b4c8f]">
                  {code.split('\n').length} / 12 lines used
                </span>
              </div>

              {/* Trace Preview Box if validated */}
              {validationResult && validationResult.valid && (
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-1.5">
                  <span className="font-bold text-[#22c55e] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Code verified! {validationResult.steps.length} trace steps generated
                  </span>
                  <div className="text-[11px] text-[#cbd5e1] font-mono">
                    Output: {validationResult.finalOutput || '(no print output)'}
                  </div>
                </div>
              )}

              {/* Bug line & blocks */}
              <div className="p-4 rounded-2xl bg-[#1b0e2b] border border-[#341b52] space-y-3">
                <span className="text-xs font-bold text-white block uppercase tracking-wider">
                  Block Challenge Configuration (Optional)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-[#a78bfa] mb-1">
                      Bug Line Number (1-indexed)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      placeholder="e.g. 3"
                      value={bugLineNumber}
                      onChange={(e) =>
                        setBugLineNumber(e.target.value ? parseInt(e.target.value) : '')
                      }
                      className="w-full px-3 py-1.5 rounded-xl bg-[#0f0718] border border-[#381c5a] text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#a78bfa] mb-1">
                      Correct Block (Drop into blank)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. total = total + i"
                      value={correctBlock}
                      onChange={(e) => setCorrectBlock(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-[#0f0718] border border-[#381c5a] text-white font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  <div>
                    <label className="block text-[10px] text-[#6b4c8f] mb-0.5">Wrong Block 1</label>
                    <input
                      type="text"
                      placeholder="total = i"
                      value={wrongBlock1}
                      onChange={(e) => setWrongBlock1(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#0f0718] border border-[#381c5a] text-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#6b4c8f] mb-0.5">Wrong Block 2</label>
                    <input
                      type="text"
                      placeholder="total = 1"
                      value={wrongBlock2}
                      onChange={(e) => setWrongBlock2(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#0f0718] border border-[#381c5a] text-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#6b4c8f] mb-0.5">Wrong Block 3</label>
                    <input
                      type="text"
                      placeholder="Optional"
                      value={wrongBlock3}
                      onChange={(e) => setWrongBlock3(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#0f0718] border border-[#381c5a] text-white font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Roadmap placement & options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <label className="flex items-center gap-2 p-3 rounded-xl bg-[#1b0e2b] border border-[#341b52] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isBranch}
                    onChange={(e) => setIsBranch(e.target.checked)}
                    className="accent-[#a855f7]"
                  />
                  <span className="text-xs text-[#cbd5e1]">Set as roadmap branch</span>
                </label>

                <label className="flex items-center gap-2 p-3 rounded-xl bg-[#1b0e2b] border border-[#341b52] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={openToAll}
                    onChange={(e) => setOpenToAll(e.target.checked)}
                    className="accent-[#a855f7]"
                  />
                  <span className="text-xs text-[#cbd5e1]">Mark "Open to all" (skip prerequisite)</span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#26133f]">
                <button
                  type="button"
                  onClick={() => setShowAddLessonModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs text-[#94a3b8] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#9333ea] hover:bg-[#a855f7] text-white font-bold text-xs shadow-[0_3px_0_0_#6b21a8] cursor-pointer"
                >
                  Publish Lesson to Roadmap
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
