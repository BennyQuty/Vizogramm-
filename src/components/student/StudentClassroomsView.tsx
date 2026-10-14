import React, { useState } from 'react';
import { Section, StudentSubmission } from '../../types';
import { Storage } from '../../utils/storage';
import { Logo } from '../Logo';
import {
  Plus,
  ArrowRight,
  BookOpen,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Hash,
} from 'lucide-react';

interface StudentClassroomsViewProps {
  sections: Section[];
  submissions: StudentSubmission[];
  onSelectClassroom: (section: Section) => void;
  onSwitchRole: () => void;
}

export const StudentClassroomsView: React.FC<StudentClassroomsViewProps> = ({
  sections,
  submissions,
  onSelectClassroom,
  onSwitchRole,
}) => {
  const [classCodeInput, setClassCodeInput] = useState('');
  const [joinError, setJoinError] = useState<string | null>(null);
  const [showJoinModal, setShowJoinModal] = useState(false);

  // List of classroom IDs the student has joined
  const joinedSectionIds = Storage.getStudentJoinedClassrooms();

  // If a student took an assessment for a section, consider them joined
  submissions.forEach((sub) => {
    if (sub.sectionId && !joinedSectionIds.includes(sub.sectionId)) {
      Storage.joinClassroom(sub.sectionId);
    }
  });

  const refreshedJoinedIds = Storage.getStudentJoinedClassrooms();
  const joinedSections = sections.filter((s) => refreshedJoinedIds.includes(s.id));

  const handleJoinClassroom = (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError(null);
    const cleanCode = classCodeInput.trim().toUpperCase();
    if (!cleanCode) return;

    // Match code against existing sections (by classCode or name/id)
    const match = sections.find(
      (s) =>
        (s.classCode && s.classCode.toUpperCase() === cleanCode) ||
        s.name.toUpperCase() === cleanCode ||
        s.id.toUpperCase() === cleanCode
    );

    if (!match) {
      setJoinError('Classroom code not found. Please check with your instructor.');
      return;
    }

    Storage.joinClassroom(match.id);
    setClassCodeInput('');
    setShowJoinModal(false);
    onSelectClassroom(match);
  };

  return (
    <div className="min-h-screen bg-[#0d0814] text-white flex flex-col font-sans">
      {/* Top Bar: Minimal, one action (Switch role) */}
      <header className="border-b border-[#26153d] bg-[#130b20]/90 backdrop-blur-md px-6 py-4 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Logo size="sm" />
          <button
            type="button"
            onClick={onSwitchRole}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#22133a] hover:bg-[#301b50] text-[#c084fc] hover:text-white border border-[#3b2060] transition-colors cursor-pointer"
          >
            Switch role
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-8 space-y-8">
        {/* Title & Join button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              My Classrooms
            </h1>
            <p className="text-xs text-[#a78bfa] mt-1">
              Select your class to view the learning roadmap and interactive lessons.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setJoinError(null);
              setShowJoinModal(true);
            }}
            className="px-5 py-3 rounded-2xl bg-[#9333ea] hover:bg-[#a855f7] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-[0_4px_0_0_#6b21a8] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Join classroom</span>
          </button>
        </div>

        {/* Empty State */}
        {joinedSections.length === 0 ? (
          <div className="p-12 rounded-3xl bg-[#170e26] border border-[#2d1748] text-center space-y-5 shadow-[0_8px_30px_rgb(0,0,0,0.3)]">
            <div className="w-16 h-16 rounded-2xl bg-[#2a1644] text-[#c084fc] border border-[#3d1f60] flex items-center justify-center mx-auto">
              <BookOpen className="w-8 h-8" />
            </div>
            <div className="space-y-2 max-w-md mx-auto">
              <h2 className="text-lg font-bold text-white">No Classrooms Joined</h2>
              <p className="text-sm text-[#94a3b8] leading-relaxed">
                You haven't joined a classroom yet. Ask your instructor for a class code.
              </p>
            </div>
            <div>
              <button
                type="button"
                onClick={() => setShowJoinModal(true)}
                className="px-6 py-3 rounded-2xl bg-[#9333ea] hover:bg-[#a855f7] text-white font-bold text-xs inline-flex items-center gap-2 shadow-[0_4px_0_0_#6b21a8] cursor-pointer"
              >
                <Hash className="w-4 h-4" />
                <span>Enter Class Code</span>
              </button>
            </div>
          </div>
        ) : (
          /* Classroom Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {joinedSections.map((sec) => {
              const lessons = Storage.getLessons(sec.id);
              const progress = Storage.getStudentProgress(sec.id);
              const baselineSubmission = submissions.find(
                (s) => s.sectionId === sec.id && s.status === 'submitted'
              );

              // Steps: 1 baseline check + N lessons
              const totalSteps = 1 + lessons.length;
              let completedSteps = 0;
              if (baselineSubmission || progress.completedLessonIds.includes('baseline')) {
                completedSteps += 1;
              }
              lessons.forEach((l) => {
                if (progress.completedLessonIds.includes(l.id)) {
                  completedSteps += 1;
                }
              });

              const pct = Math.round((completedSteps / totalSteps) * 100);

              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => onSelectClassroom(sec)}
                  className="w-full text-left p-6 rounded-3xl bg-[#170e26] hover:bg-[#201235] border border-[#2f1b4c] hover:border-[#a855f7] transition-all flex flex-col justify-between group shadow-[0_4px_0_0_#381c5a] hover:shadow-[0_4px_0_0_#7e22ce] cursor-pointer"
                >
                  <div className="space-y-4 w-full">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-xl font-bold text-white group-hover:text-[#c084fc] transition-colors">
                          {sec.name}
                        </h2>
                        <div className="text-xs text-[#a78bfa] font-medium mt-0.5">
                          {sec.course}
                        </div>
                      </div>
                      <span className="text-[11px] font-mono text-[#c084fc] px-2.5 py-1 rounded-xl bg-[#281442] border border-[#3e1e66]">
                        {sec.classCode || sec.name}
                      </span>
                    </div>

                    <div className="text-xs text-[#94a3b8]">
                      Instructor: <strong className="text-white">{sec.instructorName}</strong>
                    </div>

                    {/* Path progress bar */}
                    <div className="space-y-1.5 pt-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#a78bfa] font-medium">Path progress</span>
                        <span className="text-white font-bold font-mono">
                          {completedSteps} of {totalSteps} steps
                        </span>
                      </div>
                      <div className="w-full bg-[#271440] h-2.5 rounded-full overflow-hidden border border-[#371b5a]">
                        <div
                          className="bg-gradient-to-r from-[#9333ea] to-[#22c55e] h-full rounded-full transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#26133f] flex items-center justify-between text-xs font-bold text-[#c084fc] group-hover:text-white">
                    <span>Open Roadmap</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>

      {/* Join Classroom Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#170e26] border border-[#3b2060] p-7 shadow-2xl space-y-5">
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-white">Join Classroom</h2>
              <p className="text-xs text-[#a78bfa]">
                Enter the class code provided by your instructor.
              </p>
            </div>

            {joinError && (
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{joinError}</span>
              </div>
            )}

            <form onSubmit={handleJoinClassroom} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#c084fc] uppercase tracking-wider mb-1.5">
                  Class Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VIZ-CS1-492"
                  value={classCodeInput}
                  onChange={(e) => setClassCodeInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-[#0f0818] border border-[#381c5a] text-white font-mono text-base uppercase tracking-wider focus:outline-none focus:border-[#a855f7]"
                  autoFocus
                />
              </div>

              {sections.length > 0 && (
                <div className="p-3 rounded-xl bg-[#221338] border border-[#381c5a] text-[11px] text-[#a78bfa]">
                  <span className="font-semibold text-white block mb-1">Available in this demo:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {sections.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setClassCodeInput(s.classCode || s.name)}
                        className="px-2 py-0.5 rounded bg-[#311750] text-[#c084fc] hover:text-white font-mono"
                      >
                        {s.classCode || s.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="px-4 py-2.5 rounded-2xl text-xs font-semibold text-[#94a3b8] hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-[#9333ea] hover:bg-[#a855f7] text-white font-bold text-xs shadow-[0_3px_0_0_#6b21a8] cursor-pointer"
                >
                  Join Classroom
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
