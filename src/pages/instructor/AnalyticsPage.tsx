import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { CompetencyStatus } from '../../types/domain';
import { Dialog } from '../../components/ui/Dialog';
import {
  BarChart3,
  Filter,
  Download,
  AlertCircle,
  HelpCircle,
  TrendingDown,
  CheckCircle,
} from 'lucide-react';

export function AnalyticsPage() {
  const { users, competencies, submissions, profiles } = useData();

  const [selectedSection, setSelectedSection] = useState<'All' | 'Section A' | 'Section B'>('All');
  const [selectedCompId, setSelectedCompId] = useState<string>('comp-conditionals');
  const [inspectStudentId, setInspectStudentId] = useState<string | null>(null);

  const studentUsers = users.filter((u) => u.role === 'student');

  const filteredStudents = studentUsers.filter((s) => {
    if (selectedSection === 'All') return true;
    return s.section?.includes(selectedSection);
  });

  const activeComp = competencies.find((c) => c.id === selectedCompId) || competencies[3];

  const statusColors: Record<CompetencyStatus, { bg: string; text: string; border: string; label: string }> = {
    Mastered: { bg: 'bg-emerald-500/15', text: 'text-emerald-300', border: 'border-emerald-500/40', label: 'Mastered' },
    Shaky: { bg: 'bg-amber-500/15', text: 'text-amber-300', border: 'border-amber-500/40', label: 'Shaky' },
    'Critical Gap': { bg: 'bg-rose-500/15', text: 'text-rose-300', border: 'border-rose-500/40', label: 'Critical Gap' },
    'Insufficient Evidence': { bg: 'bg-zinc-500/15', text: 'text-zinc-300', border: 'border-zinc-500/40', label: 'Insufficient' },
  };

  const handleExportCSV = () => {
    const headers = ['Student ID,Name,Email,Section,Overall Score,' + competencies.map((c) => c.name).join(',')];
    const rows = filteredStudents.map((s) => {
      const sub = submissions.find((sub) => sub.studentId === s.id);
      const prof = profiles[s.id];
      const compScores = competencies.map((c) => prof?.competencies[c.id]?.status || 'Not Submitted');
      return `"${s.studentId || ''}","${s.name}","${s.email}","${s.section || ''}",${sub?.scorePercentage || 0},"${compScores.join('","')}"`;
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CS101_Class_Competency_Heatmap_${selectedSection}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const inspectedStudent = users.find((u) => u.id === inspectStudentId);
  const inspectedProfile = inspectStudentId ? profiles[inspectStudentId] : undefined;
  const inspectedSubmission = inspectStudentId ? submissions.find((s) => s.studentId === inspectStudentId) : undefined;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Class Competency Heatmap & Learning Gaps"
        description="Unified competency matrix mapping student responses against introductory Computer Science competencies. Uses identical records to individual student profiles."
        breadcrumbs={[
          { label: 'Instructor Suite' },
          { label: 'Class Analytics' },
        ]}
        actions={
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-3.5 h-3.5" />}
            onClick={handleExportCSV}
          >
            Export Heatmap CSV
          </Button>
        }
      />

      {/* Control Strip */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-[#121520] border border-[#2B344D] rounded-xl">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#94A3B8]" />
          <span className="text-xs font-medium text-[#94A3B8]">Section Filter:</span>
          {(['All', 'Section A', 'Section B'] as const).map((sec) => (
            <button
              key={sec}
              type="button"
              onClick={() => setSelectedSection(sec)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                selectedSection === sec
                  ? 'bg-[#191E2E] text-white border border-[#3D4868]'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 text-xs text-[#94A3B8]">
          <span className="flex items-center gap-1 text-emerald-400">● Mastered</span>
          <span className="flex items-center gap-1 text-amber-400">● Shaky</span>
          <span className="flex items-center gap-1 text-rose-400">● Critical Gap</span>
          <span className="flex items-center gap-1 text-zinc-400">● Insufficient Evidence</span>
        </div>
      </div>

      {/* Full Heatmap Matrix (Students x Competencies) */}
      <Card className="bg-[#121520] border-[#2B344D]">
        <CardHeader className="pb-3 border-b border-[#1E2538]">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base text-white">
                Class Competency Heatmap Matrix
              </CardTitle>
              <CardDescription className="text-xs text-[#94A3B8] mt-1">
                Click any cell to inspect evidence and diagnostic findings. Never relies on color alone (explicit status text provided).
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-2">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-[#2B344D] text-[#94A3B8]">
                  <th className="py-3 px-3 min-w-[170px] font-semibold">Student Name</th>
                  <th className="py-3 px-2 text-center font-semibold">Score</th>
                  {competencies.map((comp) => (
                    <th
                      key={comp.id}
                      onClick={() => setSelectedCompId(comp.id)}
                      className={`py-3 px-2 text-center cursor-pointer font-semibold transition-colors ${
                        comp.id === selectedCompId
                          ? 'text-purple-300 bg-purple-500/10 rounded-t-lg'
                          : 'hover:text-white'
                      }`}
                    >
                      <span>{comp.name.split(' ')[0]}</span>
                      <span className="block text-[10px] font-mono opacity-60">
                        {comp.code}
                      </span>
                    </th>
                  ))}
                  <th className="py-3 px-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2538]">
                {filteredStudents.map((s) => {
                  const sub = submissions.find((item) => item.studentId === s.id);
                  const prof = profiles[s.id];

                  return (
                    <tr key={s.id} className="hover:bg-[#161B29] transition-colors">
                      <td className="py-3 px-3 font-medium text-white">
                        <span>{s.name}</span>
                        <span className="block text-[10px] text-[#64748B] font-mono">
                          {s.section || 'CS 101'}
                        </span>
                      </td>

                      <td className="py-3 px-2 text-center font-mono tabular-nums text-white">
                        {sub ? `${sub.scorePercentage}%` : 'Pending'}
                      </td>

                      {competencies.map((comp) => {
                        const status: CompetencyStatus =
                          prof?.competencies[comp.id]?.status || 'Insufficient Evidence';
                        const styling = statusColors[status];
                        const isColSelected = comp.id === selectedCompId;

                        return (
                          <td
                            key={comp.id}
                            className={`py-2 px-1 text-center ${
                              isColSelected ? 'bg-purple-950/20' : ''
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedCompId(comp.id);
                                setInspectStudentId(s.id);
                              }}
                              className={`w-full py-1.5 px-2 rounded-md border text-[11px] font-medium transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-1 ${styling.bg} ${styling.text} ${styling.border}`}
                              title={`${s.name} - ${comp.name}: ${status}`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-current" />
                              <span className="truncate">{styling.label}</span>
                            </button>
                          </td>
                        );
                      })}

                      <td className="py-3 px-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setInspectStudentId(s.id)}
                        >
                          Profile
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Selected Competency Deep-Dive */}
      <Card className="bg-[#121520] border-purple-500/30">
        <CardHeader className="pb-3 border-b border-[#1E2538]">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-purple-300 font-mono uppercase tracking-wider">
                Competency Gap Deep-Dive
              </span>
              <CardTitle className="text-base text-white mt-1">
                {activeComp.name} ({activeComp.code})
              </CardTitle>
            </div>
          </div>
          <CardDescription className="text-xs text-[#94A3B8] mt-1">
            {activeComp.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-3 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 bg-[#161B29] border border-[#2B344D] rounded-xl space-y-1">
              <span className="text-[#94A3B8] font-medium block">
                Strongest Demonstrated Area
              </span>
              <p className="text-white">
                Variables and Input/Output demonstrated <strong>84%+</strong> mastery cohort-wide.
              </p>
            </div>

            <div className="p-3 bg-[#161B29] border border-rose-500/30 rounded-xl space-y-1">
              <span className="text-rose-300 font-medium block">
                Highest Concentration of Critical Gap
              </span>
              <p className="text-white">
                <strong>Conditional Statements:</strong> Multiple boundary slips (&gt;= vs &gt;) and De Morgan inversion errors.
              </p>
            </div>

            <div className="p-3 bg-[#161B29] border border-[#2B344D] rounded-xl space-y-1">
              <span className="text-zinc-300 font-medium block">
                Insufficient Evidence Cases
              </span>
              <p className="text-white">
                Students with unattempted loop items are categorized for targeted follow-up rather than assumed incapable.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog: Inspect Student Competency Profile from Heatmap */}
      {inspectedStudent && inspectedProfile && (
        <Dialog
          isOpen={!!inspectStudentId}
          onClose={() => setInspectStudentId(null)}
          title={`Competency Profile: ${inspectedStudent.name}`}
          description={`${inspectedStudent.email} · Score: ${inspectedSubmission?.scorePercentage || 0}%`}
          footer={
            <Button variant="secondary" size="sm" onClick={() => setInspectStudentId(null)}>
              Close Profile
            </Button>
          }
        >
          <div className="space-y-3 text-xs">
            <h4 className="font-semibold text-white">Competency Evaluations:</h4>
            <div className="space-y-2">
              {competencies.map((c) => {
                const detail = inspectedProfile.competencies[c.id];
                if (!detail) return null;
                const conf = statusColors[detail.status];

                return (
                  <div key={c.id} className="p-2.5 rounded-lg bg-[#161B29] border border-[#2B344D] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-white">{c.name}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${conf.bg} ${conf.text} ${conf.border}`}>
                        {detail.status}
                      </span>
                    </div>
                    <p className="text-[#94A3B8] text-[11px] leading-relaxed">
                      {detail.evidenceSummary}
                    </p>
                    <p className="text-purple-300 text-[11px]">
                      Action: {detail.suggestedAction}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
