import React, { useState } from 'react';
import { ClusterCategoryBreakdown, ScoreCategory, Section, StudentSubmission } from '../../types';
import { Filter, Users, Info, ChevronRight } from 'lucide-react';

interface ClassHeatmapProps {
  sections: Section[];
  submissions: StudentSubmission[];
  selectedSectionId: string;
  onSelectSection: (id: string) => void;
  onCellClick: (clusterKey: keyof ClusterCategoryBreakdown, category: ScoreCategory) => void;
}

interface RowDef {
  key: keyof ClusterCategoryBreakdown;
  label: string;
  sublabel: string;
  isParent?: boolean;
  indent?: boolean;
}

const ROWS: RowDef[] = [
  { key: 'total', label: 'Total Reasoning', sublabel: '24 items (Combined)', isParent: true },
  { key: 'verbal', label: 'Verbal Total', sublabel: '12 items (VC + VR)', isParent: true },
  { key: 'verbalComprehension', label: 'Verbal Comprehension', sublabel: '4 items', indent: true },
  { key: 'verbalReasoning', label: 'Verbal Reasoning', sublabel: '8 items', indent: true },
  { key: 'nonverbal', label: 'Nonverbal Total', sublabel: '12 items (FR + QR)', isParent: true },
  { key: 'figuralReasoning', label: 'Figural Reasoning', sublabel: '6 items (SVG)', indent: true },
  { key: 'quantitativeReasoning', label: 'Quantitative Reasoning', sublabel: '6 items', indent: true },
];

const COLUMNS: ScoreCategory[] = ['Below Average', 'Average', 'Above Average'];

export const ClassHeatmap: React.FC<ClassHeatmapProps> = ({
  sections,
  submissions,
  selectedSectionId,
  onSelectSection,
  onCellClick,
}) => {
  const filteredSubmissions = submissions.filter((sub) => {
    if (sub.status !== 'submitted') return false;
    if (selectedSectionId && selectedSectionId !== 'all') {
      return sub.sectionId === selectedSectionId;
    }
    return true;
  });

  const totalSubmitted = filteredSubmissions.length;

  // Compute counts
  const cellCounts: Record<string, number> = {};
  ROWS.forEach((r) => {
    COLUMNS.forEach((c) => {
      const key = `${r.key}_${c}`;
      cellCounts[key] = filteredSubmissions.filter((sub) => sub.categories[r.key] === c).length;
    });
  });

  // Calculate intensity color
  const getCellColor = (count: number, category: ScoreCategory) => {
    if (totalSubmitted === 0 || count === 0) return 'bg-[#14141c] text-[#64748b] border-[#252535]';
    const pct = count / totalSubmitted;

    if (category === 'Below Average') {
      if (pct > 0.4) return 'bg-rose-950/60 border-rose-600/60 text-rose-300 font-bold';
      if (pct > 0.2) return 'bg-rose-950/40 border-rose-700/40 text-rose-300';
      return 'bg-rose-950/20 border-rose-800/30 text-rose-300';
    }
    if (category === 'Average') {
      if (pct > 0.5) return 'bg-blue-950/60 border-blue-600/60 text-blue-300 font-bold';
      if (pct > 0.2) return 'bg-blue-950/40 border-blue-700/40 text-blue-300';
      return 'bg-blue-950/20 border-blue-800/30 text-blue-300';
    }
    // Above Average
    if (pct > 0.4) return 'bg-emerald-950/60 border-emerald-600/60 text-emerald-300 font-bold';
    if (pct > 0.2) return 'bg-emerald-950/40 border-emerald-700/40 text-emerald-300';
    return 'bg-emerald-950/20 border-emerald-800/30 text-emerald-300';
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Class Diagnostic Heatmap
            <span className="text-xs font-normal px-2.5 py-0.5 rounded-full bg-[#1c1c28] text-[#94a3b8] border border-[#2e2e3e]">
              {totalSubmitted} submissions
            </span>
          </h2>
          <p className="text-xs text-[#94a3b8] mt-1">
            Aggregated cohort distribution across the 7 reasoning clusters. No individual student names are displayed here.
          </p>
        </div>

        {/* Section Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#94a3b8]" />
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

      {totalSubmitted === 0 ? (
        <div className="brilliant-card rounded-2xl p-12 text-center border border-[#2a2a3a]">
          <Users className="w-10 h-10 text-[#64748b] mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No submissions yet</h3>
          <p className="text-xs text-[#94a3b8] max-w-sm mx-auto mb-4">
            Share your section's Class Code with students. As students complete the OLSAT-style assessment, cohort readiness distributions will appear on this heatmap live.
          </p>
        </div>
      ) : (
        <div className="brilliant-card rounded-2xl overflow-hidden border border-[#2b2b3a] shadow-[0_4px_0_0_rgba(255,255,255,0.05)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#262635] bg-[#101017]">
                  <th className="py-4 px-5 text-xs font-bold text-[#cbd5e1] uppercase tracking-wider w-2/5">
                    Reasoning Cluster
                  </th>
                  {COLUMNS.map((col) => (
                    <th
                      key={col}
                      className="py-4 px-5 text-xs font-bold text-center uppercase tracking-wider w-1/5"
                    >
                      <span
                        className={`inline-block px-2.5 py-1 rounded-md text-[11px] ${
                          col === 'Below Average'
                            ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                            : col === 'Average'
                            ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                            : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {col}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e1e2c]">
                {ROWS.map((row) => (
                  <tr
                    key={row.key}
                    className={`hover:bg-[#151520] transition-colors ${
                      row.isParent ? 'bg-[#101018]' : ''
                    }`}
                  >
                    <td className="py-3.5 px-5">
                      <div className={row.indent ? 'pl-6' : ''}>
                        <div
                          className={`text-sm ${
                            row.isParent
                              ? 'font-bold text-white'
                              : 'font-medium text-[#e2e8f0]'
                          }`}
                        >
                          {row.label}
                        </div>
                        <div className="text-[11px] text-[#64748b]">{row.sublabel}</div>
                      </div>
                    </td>

                    {COLUMNS.map((col) => {
                      const count = cellCounts[`${row.key}_${col}`] || 0;
                      const pct = totalSubmitted > 0 ? Math.round((count / totalSubmitted) * 100) : 0;
                      return (
                        <td key={col} className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => onCellClick(row.key, col)}
                            className={`w-full py-3 px-2 rounded-xl border transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 hover:scale-[1.02] active:scale-[0.98] ${getCellColor(
                              count,
                              col
                            )}`}
                            title={`Click to view students with ${row.label} in ${col}`}
                          >
                            <span className="text-base font-bold">{count}</span>
                            <span className="text-[10px] opacity-75">{pct}%</span>
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-[#0d0d12] border-t border-[#232330] flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#94a3b8] gap-2">
            <div className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-[#456dff]" />
              <span>Click any heatmap cell to drill down into the list of students in that category.</span>
            </div>
            <div className="text-[11px] text-[#64748b]">
              Bands: Provisional adapted form (scaled 1/3 Table 45). Not official norms.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
