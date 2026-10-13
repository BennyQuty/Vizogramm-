import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContext';
import { User, CompetencyStatus } from '../../types/domain';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { TextInput } from '../../components/ui/FormControls';
import { Dialog } from '../../components/ui/Dialog';
import { ProgressBar } from '../../components/ui/Progress';
import { CodeTraceComparator } from '../../components/ui/CodeTraceComparator';
import {
  Search,
  UserCheck,
  AlertTriangle,
  RotateCcw,
  CheckCircle,
  HelpCircle,
  FileText,
  AlertCircle,
  Layers,
} from 'lucide-react';

export function StudentsPage() {
  const {
    users,
    competencies,
    submissions,
    analyses,
    profiles,
    retryAnalysis,
  } = useData();
  const { notify } = useNotification();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const studentUsers = users.filter((u) => u.role === 'student');

  const filteredStudents = studentUsers.filter((s) => {
    return (
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.studentId && s.studentId.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const handleRetry = async (submissionId: string, studentName: string) => {
    setRetryingId(submissionId);
    try {
      await retryAnalysis(submissionId);
      notify({
        type: 'success',
        title: 'Diagnostic Analysis Recovered',
        message: `Successfully re-analyzed submission for ${studentName}. Diagnostic findings and profile updated.`,
      });
    } catch (err) {
      notify({
        type: 'error',
        title: 'Retry Failed',
        message: 'Could not connect to analysis service.',
      });
    } finally {
      setRetryingId(null);
    }
  };

  const statusColors: Record<CompetencyStatus, { bg: string; text: string; border: string }> = {
    Mastered: { bg: 'bg-emerald-500/10', text: 'text-emerald-300', border: 'border-emerald-500/30' },
    Shaky: { bg: 'bg-amber-500/10', text: 'text-amber-300', border: 'border-amber-500/30' },
    'Critical Gap': { bg: 'bg-rose-500/10', text: 'text-rose-300', border: 'border-rose-500/30' },
    'Insufficient Evidence': { bg: 'bg-zinc-500/10', text: 'text-zinc-300', border: 'border-zinc-500/30' },
  };

  const selectedProfile = selectedStudent ? profiles[selectedStudent.id] : undefined;
  const selectedSubmission = selectedStudent ? submissions.find((s) => s.studentId === selectedStudent.id) : undefined;
  const selectedAnalysis = selectedSubmission ? Object.values(analyses).find((a) => a.submissionId === selectedSubmission.id) : undefined;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Cohort Roster & Diagnostic Profiles"
        description="Enrolled introductory CS students with connected assessment attempts, deterministic scores, and AI diagnostic classifications."
        breadcrumbs={[
          { label: 'Instructor Suite' },
          { label: 'Student Roster' },
        ]}
      />

      {/* Search Input */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="w-full sm:w-80">
          <TextInput
            placeholder="Search student by name, email, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-3.5 h-3.5 text-[#94A3B8]" />}
          />
        </div>

        <div className="text-xs text-[#94A3B8] font-mono">
          Showing <strong>{filteredStudents.length}</strong> enrolled students
        </div>
      </div>

      {/* Roster Table */}
      <Card className="bg-[#121520] border-[#2B344D]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Section</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Diagnostic Status</TableHead>
              <TableHead>Identified Findings</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.map((student) => {
              const sub = submissions.find((s) => s.studentId === student.id);
              const analysis = sub ? Object.values(analyses).find((a) => a.submissionId === sub.id) : undefined;
              const isFailed = analysis?.status === 'Failed';
              const isRetrying = sub && retryingId === sub.id;

              return (
                <TableRow
                  key={student.id}
                  isInteractive
                  onClick={() => setSelectedStudent(student)}
                >
                  <TableCell className="font-medium text-white">
                    <div>
                      <span>{student.name}</span>
                      <span className="block text-[11px] font-mono text-[#94A3B8]">
                        {student.email} · {student.studentId}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="text-[#94A3B8] text-xs">
                    {student.section || 'Section A'}
                  </TableCell>

                  <TableCell className="font-mono tabular-nums text-white">
                    {sub ? `${sub.scorePercentage}%` : 'Not Submitted'}
                  </TableCell>

                  <TableCell>
                    {isFailed ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/30">
                        <AlertTriangle className="w-3 h-3 text-rose-400" />
                        <span>Failed (Retry Available)</span>
                      </span>
                    ) : (
                      <StatusBadge
                        label={analysis?.status || 'Pending'}
                        variant={analysis?.status === 'Completed' ? 'success' : 'neutral'}
                        size="sm"
                      />
                    )}
                  </TableCell>

                  <TableCell>
                    {analysis && analysis.findings.length > 0 ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                        <AlertTriangle className="w-3 h-3 shrink-0" />
                        <span>{analysis.findings.length} Flagged</span>
                      </span>
                    ) : isFailed ? (
                      <span className="text-[11px] text-rose-400 font-mono">
                        Interrupted (504)
                      </span>
                    ) : (
                      <span className="text-[11px] text-emerald-400 font-mono">
                        None / Clean
                      </span>
                    )}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      {isFailed && sub && (
                        <Button
                          variant="destructive"
                          size="sm"
                          isLoading={isRetrying}
                          leftIcon={<RotateCcw className="w-3 h-3" />}
                          onClick={() => handleRetry(sub.id, student.name)}
                        >
                          Retry
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedStudent(student)}
                      >
                        Inspect
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      {/* Individual Student Diagnostic Profile Dialog */}
      {selectedStudent && (
        <Dialog
          isOpen={!!selectedStudent}
          onClose={() => setSelectedStudent(null)}
          title={`Diagnostic Profile: ${selectedStudent.name}`}
          description={`${selectedStudent.email} · ${selectedStudent.studentId || ''} · ${selectedStudent.section || ''}`}
          footer={
            <Button variant="secondary" size="sm" onClick={() => setSelectedStudent(null)}>
              Close Profile
            </Button>
          }
        >
          <div className="space-y-4 text-xs">
            {/* Submission Status strip */}
            {selectedSubmission ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-3 bg-[#191E2E] rounded-lg border border-[#2B344D]">
                  <span className="text-[#94A3B8] block">Baseline Score</span>
                  <span className="text-white font-bold font-mono text-base mt-1 block">
                    {selectedSubmission.scorePercentage}%
                  </span>
                </div>
                <div className="p-3 bg-[#191E2E] rounded-lg border border-[#2B344D]">
                  <span className="text-[#94A3B8] block">Raw Points</span>
                  <span className="text-white font-mono mt-1 block">
                    {selectedSubmission.rawScore} / {selectedSubmission.maxScore}
                  </span>
                </div>
                <div className="p-3 bg-[#191E2E] rounded-lg border border-[#2B344D]">
                  <span className="text-[#94A3B8] block">Submitted At</span>
                  <span className="text-white font-mono mt-1 block text-[11px]">
                    {selectedSubmission.submittedAt}
                  </span>
                </div>
                <div className="p-3 bg-[#191E2E] rounded-lg border border-[#2B344D]">
                  <span className="text-[#94A3B8] block">Analysis Status</span>
                  <span className="text-white font-semibold mt-1 block">
                    {selectedAnalysis?.status || 'Pending'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-200">
                Student has not yet completed the CS1 Baseline Assessment.
              </div>
            )}

            {/* If Failed Analysis */}
            {selectedAnalysis?.status === 'Failed' && selectedSubmission && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-rose-300 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>Analysis Interrupted (Scenario H)</span>
                  </span>
                  <Button
                    variant="destructive"
                    size="sm"
                    leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                    onClick={() => handleRetry(selectedSubmission.id, selectedStudent.name)}
                  >
                    Run Diagnostic Retry Now
                  </Button>
                </div>
                <p className="text-zinc-300 leading-relaxed text-[11px]">
                  {selectedAnalysis.errorMessage}
                </p>
              </div>
            )}

            {/* Competency Breakdown */}
            {selectedProfile && (
              <div className="space-y-2 pt-2">
                <h4 className="font-semibold text-white">Competency Evaluations:</h4>
                <div className="space-y-2">
                  {competencies.map((c) => {
                    const detail = selectedProfile.competencies[c.id];
                    if (!detail) return null;
                    const conf = statusColors[detail.status];

                    return (
                      <div
                        key={c.id}
                        className="p-2.5 bg-[#161B29] border border-[#2B344D] rounded-lg space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-white font-medium">{c.name}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${conf.bg} ${conf.text} ${conf.border}`}>
                            {detail.status}
                          </span>
                        </div>
                        <p className="text-[#94A3B8] text-[11px] leading-relaxed">
                          {detail.evidenceSummary}
                        </p>
                        <div className="text-[11px] text-purple-300">
                          Suggested Action: {detail.suggestedAction}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Diagnostic Findings */}
            {selectedAnalysis && selectedAnalysis.findings.length > 0 && (
              <div className="space-y-2 pt-2">
                <h4 className="font-semibold text-orange-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Flagged Mental Model Deviations:</span>
                </h4>
                <div className="space-y-3">
                  {selectedAnalysis.findings.map((f) => {
                    if (f.codeComparison) {
                      return (
                        <CodeTraceComparator
                          key={f.id}
                          category={f.category}
                          flawedSnippet={f.codeComparison.flawedSnippet}
                          canonicalSnippet={f.codeComparison.canonicalSnippet}
                          explanation={f.codeComparison.explanation}
                          confidence={f.confidence}
                          suggestedFollowUp={f.suggestedFollowUp}
                          title={`Observed: ${f.observedPattern.slice(0, 50)}...`}
                        />
                      );
                    }

                    return (
                      <div
                        key={f.id}
                        className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-orange-300 block">
                            {f.category}
                          </span>
                          <span className="text-[10px] text-orange-400 font-mono">
                            Confidence: {f.confidence}
                          </span>
                        </div>
                        <p className="text-[#94A3B8] leading-relaxed">
                          {f.observedPattern}
                        </p>
                        <p className="text-purple-300 text-[11px]">
                          Remedy: {f.suggestedFollowUp}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </Dialog>
      )}
    </div>
  );
}
