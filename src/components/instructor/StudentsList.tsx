import React, { useState } from 'react';
import {
  ClusterCategoryBreakdown,
  ScoreCategory,
  Section,
  StudentProfileData,
  StudentSubmission,
} from '../../types';
import { Search, Filter, X, ChevronRight, User as UserIcon, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

interface StudentsListProps {
  sections: Section[];
  profiles: Record<string, StudentProfileData>;
  submissions: StudentSubmission[];
  selectedSectionId: string;
  onSelectSection: (id: string) => void;
  activeCellFilter: {
    clusterKey: keyof ClusterCategoryBreakdown;
    category: ScoreCategory;
  } | null;
  onClearCellFilter: () => void;
  onSelectStudent: (userId: string) => void;
}

export const StudentsList: React.FC<StudentsListProps> = ({
  sections,
  profiles,
  submissions,
  selectedSectionId,
  onSelectSection,
  activeCellFilter,
  onClearCellFilter,
  onSelectStudent,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Combine student profile + submission
  const studentRows = Object.values(profiles).map((prof) => {
    const sub = submissions.find((s) => s.studentId === prof.userId);
    return {
      profile: prof,
      submission: sub,
    };
  });

  // Filter
  const filtered = studentRows.filter(({ profile, submission }) => {
    // Section filter
    if (selectedSectionId && selectedSectionId !== 'all') {
      if (profile.sectionId !== selectedSectionId) return false;
    }

    // Heatmap cell filter
    if (activeCellFilter) {
      if (!submission || submission.status !== 'submitted') return false;
      const cat = submission.categories[activeCellFilter.clusterKey];
      if (cat !== activeCellFilter.category) return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = `${profile.firstName} ${profile.lastName}`.toLowerCase().includes(q);
      const matchNum = profile.studentNumber.toLowerCase().includes(q);
      const matchCode = (profile.classCode || '').toLowerCase().includes(q);
      if (!matchName && !matchNum && !matchCode) return false;
    }

    return true;
  });

  const getStatusBadge = (sub?: StudentSubmission) => {
    if (!sub || sub.status === 'not_started') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#20202a] text-[#94a3b8] border border-[#30303e]">
          Not Started
        </span>
      );
    }
    if (sub.status === 'in_progress') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
          In Progress
        </span>
      );
    }
    if (sub.analysisStatus === 'analyzing') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" /> Analyzing
        </span>
      );
    }
    if (sub.analysisStatus === 'ready') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" /> Ready
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
        Diagnosis Failed
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Student Roster & Diagnostics</h2>
          <p className="text-xs text-[#94a3b8] mt-1">
            Individual profiles and test responses are strictly confidential to course instructors.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#64748b] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search student or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl bg-[#14141c] border border-[#2f2f3f] text-xs text-white placeholder-[#64748b] focus:outline-none focus:border-[#9d62ff]"
            />
          </div>

          {/* Section filter */}
          <select
            value={selectedSectionId}
            onChange={(e) => onSelectSection(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#14141c] border border-[#2f2f3f] text-xs text-white focus:outline-none focus:border-[#9d62ff]"
          >
            <option value="all">All Sections ({sections.length})</option>
            {sections.map((sec) => (
              <option key={sec.id} value={sec.id}>
                {sec.name} ({sec.course})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Heatmap Cell Filter Pill */}
      {activeCellFilter && (
        <div className="p-3 rounded-xl bg-[#9d62ff]/10 border border-[#9d62ff]/30 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[#94a3b8]">Filtered by Heatmap cell:</span>
            <strong className="text-white font-mono">{activeCellFilter.clusterKey}</strong>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#181824] text-[#caa3ff] border border-[#38384f]">
              {activeCellFilter.category}
            </span>
          </div>
          <button
            onClick={onClearCellFilter}
            className="flex items-center gap-1 text-[11px] text-[#caa3ff] hover:text-white px-2 py-1 rounded bg-[#202030] hover:bg-[#2b2b40]"
          >
            <X className="w-3.5 h-3.5" />
            Clear Filter
          </button>
        </div>
      )}

      {/* Roster Table */}
      {filtered.length === 0 ? (
        <div className="brilliant-card rounded-2xl p-12 text-center border border-[#2b2b3a]">
          <UserIcon className="w-10 h-10 text-[#64748b] mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">
            {Object.keys(profiles).length === 0 ? 'No students enrolled yet' : 'No matching students'}
          </h3>
          <p className="text-xs text-[#94a3b8] max-w-sm mx-auto">
            {Object.keys(profiles).length === 0
              ? 'Students will automatically appear here once they complete their first entrance assessment session.'
              : 'Try clearing your search query or section filter.'}
          </p>
        </div>
      ) : (
        <div className="brilliant-card rounded-2xl overflow-hidden border border-[#2b2b3a]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#101018] border-b border-[#232330] text-[#94a3b8] uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-5">Student Name</th>
                <th className="py-3.5 px-4">Student ID</th>
                <th className="py-3.5 px-4">Section</th>
                <th className="py-3.5 px-4">Assessment Status</th>
                <th className="py-3.5 px-4">Composite Band</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1e2b]">
              {filtered.map(({ profile, submission }) => {
                const isSubmitted = submission?.status === 'submitted';
                const sectionObj = sections.find((s) => s.id === profile.sectionId);
                return (
                  <tr
                    key={profile.userId}
                    onClick={() => onSelectStudent(profile.userId)}
                    className="hover:bg-[#151522] cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-5 font-semibold text-white">
                      <div>{profile.lastName}, {profile.firstName}</div>
                      <div className="text-[11px] text-[#64748b]">{profile.gradeYearLevel}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#cbd5e1]">
                      {profile.studentNumber}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-[#85a3ff]">
                      {sectionObj?.name || profile.sectionId}
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(submission)}
                    </td>
                    <td className="py-3.5 px-4">
                      {isSubmitted && submission ? (
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                            submission.categories.total === 'Below Average'
                              ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                              : submission.categories.total === 'Average'
                              ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                              : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          }`}
                        >
                          {submission.categories.total}
                        </span>
                      ) : (
                        <span className="text-[#64748b]">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#caa3ff] hover:text-white"
                      >
                        View Diagnosis <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
