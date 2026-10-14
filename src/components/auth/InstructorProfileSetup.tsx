import React, { useState } from 'react';
import { InstructorProfileData, Section } from '../../types';
import { Storage } from '../../utils/storage';
import { GraduationCap, ArrowRight, ArrowLeft } from 'lucide-react';

interface InstructorProfileSetupProps {
  onComplete: (instructor: InstructorProfileData, section: Section) => void;
  onCancel: () => void;
}

export const InstructorProfileSetup: React.FC<InstructorProfileSetupProps> = ({
  onComplete,
  onCancel,
}) => {
  const [fullName, setFullName] = useState('Prof. Alan Turing');
  const [school, setSchool] = useState('College of Computing & Informatics');
  const [department, setDepartment] = useState('Department of Computer Science');

  // First section
  const [sectionName, setSectionName] = useState('Section A');
  const [course, setCourse] = useState('CS 101: Introduction to Computing');
  const [level, setLevel] = useState<'E' | 'F' | 'G'>('G');
  const [form, setForm] = useState<'5' | '6'>('5');
  const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0]);

  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !school.trim() || !department.trim() || !sectionName.trim()) {
      setError('Please fill in all instructor and section fields.');
      return;
    }

    const instUserId = 'inst_' + Math.random().toString(36).substring(2, 9);
    const instructorProfile: InstructorProfileData = {
      userId: instUserId,
      fullName: fullName.trim(),
      school: school.trim(),
      department: department.trim(),
      updatedAt: new Date().toISOString(),
    };

    const newSection: Section = {
      id: 'sec_' + Math.random().toString(36).substring(2, 9),
      name: sectionName.trim(),
      course: course.trim(),
      level,
      form,
      testDate,
      instructorId: instUserId,
      instructorName: fullName.trim(),
      school: school.trim(),
    };

    Storage.saveInstructorProfile(instructorProfile);
    Storage.saveSection(newSection);

    onComplete(instructorProfile, newSection);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-white relative">
      <div className="w-full max-w-xl z-10">
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={onCancel}
            className="btn-ghost px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Role Picker
          </button>
          <span className="text-xs text-[#64748b]">First Entry Setup</span>
        </div>

        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#9d62ff]/15 text-[#caa3ff] border border-[#9d62ff]/30 text-xs font-semibold mb-3">
            <GraduationCap className="w-3.5 h-3.5" /> Instructor Setup
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
            Set up your profile and first section
          </h1>
          <p className="text-xs text-[#94a3b8]">
            Configure your teaching credentials and initialize your primary student cohort.
          </p>
        </div>

        <div className="brilliant-card rounded-2xl p-7 border border-[#2e2e3e] shadow-[0_4px_0_0_#874de5]">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">Full Name & Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Prof. Alan Turing"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e0e13] border border-[#30303e] text-white text-sm focus:outline-none focus:border-[#9d62ff]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">School / University *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. College of Computing"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0e0e13] border border-[#30303e] text-white text-sm focus:outline-none focus:border-[#9d62ff]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">Department *</label>
                <input
                  type="text"
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0e0e13] border border-[#30303e] text-white text-sm focus:outline-none focus:border-[#9d62ff]"
                />
              </div>
            </div>

            {/* First Class Section Setup */}
            <div className="mt-5 pt-4 border-t border-[#262635]">
              <span className="text-xs font-bold text-[#caa3ff] uppercase tracking-wider block mb-3">
                First Class Section
              </span>

              <div className="p-4 rounded-xl bg-[#14141d] border border-[#2b2b3b] space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">Section Identifier *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Section A"
                      value={sectionName}
                      onChange={(e) => setSectionName(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#0e0e13] border border-[#343446] text-white text-sm focus:outline-none focus:border-[#9d62ff]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">Course Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. CS 101: Intro to Computing"
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#0e0e13] border border-[#343446] text-white text-sm focus:outline-none focus:border-[#9d62ff]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">Level</label>
                    <select
                      value={level}
                      onChange={(e) => setLevel(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#0e0e13] border border-[#343446] text-white text-xs focus:outline-none focus:border-[#9d62ff]"
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
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#0e0e13] border border-[#343446] text-white text-xs focus:outline-none focus:border-[#9d62ff]"
                    >
                      <option value="5">Form 5 (Standard)</option>
                      <option value="6">Form 6 (Alternate)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">Test Date</label>
                    <input
                      type="date"
                      value={testDate}
                      onChange={(e) => setTestDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#0e0e13] border border-[#343446] text-white text-xs focus:outline-none focus:border-[#9d62ff]"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                className="w-full btn-purple py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                Complete Setup & Open Dashboard
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
