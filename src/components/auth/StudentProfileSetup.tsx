import React, { useState } from 'react';
import { Section, StudentProfileData } from '../../types';
import { Storage } from '../../utils/storage';
import { UserCheck, Shield, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';

interface StudentProfileSetupProps {
  sections: Section[];
  onComplete: (profile: StudentProfileData) => void;
  onCancel: () => void;
}

export const StudentProfileSetup: React.FC<StudentProfileSetupProps> = ({
  sections,
  onComplete,
  onCancel,
}) => {
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [middleInitial, setMiddleInitial] = useState('');
  const [studentNumber, setStudentNumber] = useState('');
  const [gradeYearLevel, setGradeYearLevel] = useState('1st Year College (Freshman)');
  const [selectedSectionId, setSelectedSectionId] = useState<string>(
    sections.length > 0 ? sections[0].id : ''
  );
  const [dob, setDob] = useState('');
  const [school, setSchool] = useState('');
  const [privacyAcknowledged, setPrivacyAcknowledged] = useState(false);
  const [error, setError] = useState('');

  const selectedSection = sections.find((s) => s.id === selectedSectionId) || sections[0] || null;

  if (sections.length === 0) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-white">
        <div className="brilliant-card max-w-md w-full rounded-2xl p-8 border border-[#2e2e3e] text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/15 text-amber-300 flex items-center justify-center mx-auto border border-amber-500/30">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">No Test Available Yet</h2>
          <p className="text-xs text-[#94a3b8] leading-relaxed">
            No test is available yet. Ask your instructor to set up your class section first.
          </p>
          <button
            type="button"
            onClick={onCancel}
            className="btn-ghost w-full py-2.5 rounded-xl text-xs font-semibold cursor-pointer"
          >
            ← Return to Role Picker
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lastName.trim() || !firstName.trim() || !studentNumber.trim()) {
      setError('Please provide your first name, last name, and student identification number.');
      return;
    }
    if (!selectedSection) {
      setError('Please select an active class section.');
      return;
    }
    if (!privacyAcknowledged) {
      setError('You must check the privacy acknowledgment before taking the test.');
      return;
    }

    const studentUserId = 'std_' + Math.random().toString(36).substring(2, 9);
    const profile: StudentProfileData = {
      userId: studentUserId,
      lastName: lastName.trim(),
      firstName: firstName.trim(),
      middleInitial: middleInitial.trim().toUpperCase(),
      dob: dob || undefined,
      studentNumber: studentNumber.trim(),
      gradeYearLevel,
      school: school.trim() || selectedSection.school,
      instructor: selectedSection.instructorName,
      sectionId: selectedSection.id,
      classCode: selectedSection.classCode || selectedSection.name,
      level: selectedSection.level,
      form: selectedSection.form,
      testDate: selectedSection.testDate,
      privacyAcknowledged,
      updatedAt: new Date().toISOString(),
    };

    Storage.saveStudentProfile(profile);
    onComplete(profile);
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
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
          <span className="text-xs text-[#64748b]">Step 1 of 2: Details</span>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
            Tell us about yourself
          </h1>
          <p className="text-xs text-[#94a3b8] italic">
            "Your results are visible to your instructor only."
          </p>
        </div>

        <div className="brilliant-card rounded-2xl p-7 border border-[#2e2e3e] shadow-[0_4px_0_0_#3152c9]">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Section Dropdown */}
            <div className="p-4 rounded-xl bg-[#14141d] border border-[#2b2b3b] space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#85a3ff] uppercase tracking-wider mb-1.5">
                  Select Your Section *
                </label>
                <select
                  value={selectedSectionId}
                  onChange={(e) => setSelectedSectionId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e0e13] border border-[#3b3b4f] text-white text-xs focus:outline-none focus:border-[#456dff]"
                >
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — {s.course} (Instructor: {s.instructorName})
                    </option>
                  ))}
                </select>
              </div>

              {/* Read-Only Auto-Populated Section Info */}
              {selectedSection && (
                <div className="p-3 rounded-lg bg-[#0e0e13] border border-[#242432] text-xs grid grid-cols-2 sm:grid-cols-4 gap-2 text-[#94a3b8]">
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-[#64748b]">Instructor</span>
                    <strong className="text-white block truncate">{selectedSection.instructorName}</strong>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-[#64748b]">Level</span>
                    <strong className="text-white block">Level {selectedSection.level}</strong>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-[#64748b]">Form</span>
                    <strong className="text-white block">Form {selectedSection.form}</strong>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-[#64748b]">Test Date</span>
                    <strong className="text-white block">{selectedSection.testDate}</strong>
                  </div>
                </div>
              )}
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">First Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0e0e13] border border-[#30303e] text-white text-sm focus:outline-none focus:border-[#456dff]"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">Last Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chen"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0e0e13] border border-[#30303e] text-white text-sm focus:outline-none focus:border-[#456dff]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">M.I.</label>
                <input
                  type="text"
                  maxLength={2}
                  placeholder="M"
                  value={middleInitial}
                  onChange={(e) => setMiddleInitial(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0e0e13] border border-[#30303e] text-white text-sm text-center uppercase focus:outline-none focus:border-[#456dff]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">Student Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2026-CS-0142"
                  value={studentNumber}
                  onChange={(e) => setStudentNumber(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0e0e13] border border-[#30303e] text-white text-sm focus:outline-none focus:border-[#456dff]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">Year / Grade Level *</label>
                <select
                  value={gradeYearLevel}
                  onChange={(e) => setGradeYearLevel(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0e0e13] border border-[#30303e] text-white text-sm focus:outline-none focus:border-[#456dff]"
                >
                  <option value="1st Year College (Freshman)">1st Year College (Freshman)</option>
                  <option value="2nd Year College">2nd Year College</option>
                  <option value="Pre-College / Senior High">Pre-College / Senior High (Grade 12)</option>
                </select>
              </div>
            </div>

            {/* Optional Fields: DOB & School */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#94a3b8] mb-1">Date of Birth (Optional)</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0e0e13] border border-[#30303e] text-white text-sm focus:outline-none focus:border-[#456dff]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#94a3b8] mb-1">School / College (Optional)</label>
                <input
                  type="text"
                  placeholder={selectedSection?.school || 'School of Computing'}
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0e0e13] border border-[#30303e] text-white text-sm focus:outline-none focus:border-[#456dff]"
                />
              </div>
            </div>

            {/* Privacy Acknowledgment Checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-3 p-3.5 rounded-xl bg-[#13131c] border border-[#2f2f3f] cursor-pointer hover:border-[#456dff]/60 transition-colors">
                <input
                  type="checkbox"
                  required
                  checked={privacyAcknowledged}
                  onChange={(e) => setPrivacyAcknowledged(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-[#456dff] focus:ring-[#456dff] accent-[#456dff]"
                />
                <span className="text-xs text-[#cbd5e1] leading-relaxed">
                  <strong>Privacy acknowledgment:</strong> I understand my results are confidential and visible only to my instructor.
                </span>
              </label>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={!privacyAcknowledged}
                className="w-full btn-blue py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span>Continue to Test Instructions</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
