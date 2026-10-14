import React, { useState } from 'react';
import { Section, StudentSubmission, User } from '../../types';
import { Storage } from '../../utils/storage';
import { Plus, Copy, Check, BookOpen, Users, Calendar, ArrowRight } from 'lucide-react';

interface SectionsManagerProps {
  currentUser: User;
  sections: Section[];
  submissions: StudentSubmission[];
  onSectionCreated: (sec: Section) => void;
}

export const SectionsManager: React.FC<SectionsManagerProps> = ({
  currentUser,
  sections,
  submissions,
  onSectionCreated,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [course, setCourse] = useState('CS 101: Introduction to Computing');
  const [level, setLevel] = useState<'E' | 'F' | 'G'>('G');
  const [form, setForm] = useState<'5' | '6'>('5');
  const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const generateCode = (secName: string, crs: string) => {
    const letters = (crs.match(/[A-Z]/g) || ['C', 'S']).join('').slice(0, 3);
    const secLetter = (secName.match(/[A-Za-z0-9]/g) || ['A']).pop() || 'A';
    const rand = Math.floor(100 + Math.random() * 900);
    return `VIZ-${letters}${secLetter}-${rand}`.toUpperCase();
  };

  const handleCreateSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const classCode = generateCode(name, course);
    const newSection: Section = {
      id: 'sec_' + Math.random().toString(36).substring(2, 9),
      name: name.trim(),
      course: course.trim(),
      level,
      form,
      testDate,
      classCode,
      instructorId: currentUser.id,
      instructorName: currentUser.name,
      school: 'School of Computing',
    };

    Storage.saveSection(newSection);
    Storage.addAuditLog(
      'section_created',
      `Instructor created section "${newSection.name}" with code ${classCode}.`,
      currentUser.name
    );

    onSectionCreated(newSection);
    setShowCreateModal(false);
    setName('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Course Sections</h2>
          <p className="text-xs text-[#94a3b8] mt-1">
            Manage course sections. Students choose their section from the dropdown when entering the Student role.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="btn-purple px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create New Section
        </button>
      </div>

      {sections.length === 0 ? (
        <div className="brilliant-card rounded-2xl p-12 text-center border border-[#2b2b3a]">
          <BookOpen className="w-10 h-10 text-[#64748b] mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No class sections created</h3>
          <p className="text-xs text-[#94a3b8] max-w-sm mx-auto mb-4">
            Click "Create New Section" to add your first student cohort.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-purple px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
          >
            Create Your First Section
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sections.map((sec) => {
            const sectionSubs = submissions.filter((s) => s.sectionId === sec.id);
            const submittedCount = sectionSubs.filter((s) => s.status === 'submitted').length;

            return (
              <div
                key={sec.id}
                className="brilliant-card rounded-2xl p-5 border border-[#2e2e3e] flex flex-col justify-between shadow-[0_3px_0_0_rgba(255,255,255,0.04)]"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-white">{sec.name}</h3>
                      <div className="text-xs text-[#94a3b8]">{sec.course}</div>
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#1c1c28] text-[#caa3ff] border border-[#2e2e3e]">
                      Level {sec.level} • Form {sec.form}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#0e0e14] border border-[#262635] flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] uppercase text-[#64748b] font-bold block">
                        Target Evaluation Standard
                      </span>
                      <span className="font-semibold text-white">
                        Level {sec.level} (College Baseline) • Form {sec.form}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-[#85a3ff] px-2 py-1 rounded bg-[#181824] border border-[#2e2e42]">
                      Active Section
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-[#94a3b8] pt-1">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#9d62ff]" />
                      <span>{submittedCount} submitted test{submittedCount === 1 ? '' : 's'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#ff8d23]" />
                      <span>Admin: {sec.testDate}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Section Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="brilliant-card w-full max-w-md rounded-2xl p-6 border border-[#343446] shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Create New Class Section</h3>
            <p className="text-xs text-[#94a3b8] mb-5">
              Set the course and assessment parameters for this student cohort.
            </p>

            <form onSubmit={handleCreateSection} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">
                  Section Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Section B"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0e0e13] border border-[#30303e] text-white text-sm focus:outline-none focus:border-[#9d62ff]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">
                  Course Title
                </label>
                <input
                  type="text"
                  required
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0e0e13] border border-[#30303e] text-white text-sm focus:outline-none focus:border-[#9d62ff]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">OLSAT Level</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0e0e13] border border-[#30303e] text-white text-xs focus:outline-none focus:border-[#9d62ff]"
                  >
                    <option value="E">Level E (High School)</option>
                    <option value="F">Level F (Senior High)</option>
                    <option value="G">Level G (First-Year College)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">Form</label>
                  <select
                    value={form}
                    onChange={(e) => setForm(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0e0e13] border border-[#30303e] text-white text-xs focus:outline-none focus:border-[#9d62ff]"
                  >
                    <option value="5">Form 5 (Standard)</option>
                    <option value="6">Form 6 (Alternate)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">Test Administration Date</label>
                <input
                  type="date"
                  value={testDate}
                  onChange={(e) => setTestDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0e0e13] border border-[#30303e] text-white text-xs focus:outline-none focus:border-[#9d62ff]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-[#94a3b8] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-purple px-5 py-2 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Create Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
