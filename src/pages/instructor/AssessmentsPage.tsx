import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Assessment } from '../../types/domain';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Dialog } from '../../components/ui/Dialog';
import { TextInput, FormField } from '../../components/ui/FormControls';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { useNotification } from '../../context/NotificationContext';
import {
  Plus,
  Search,
  BookOpen,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';

export function AssessmentsPage() {
  const { assessments, competencies, questions, submissions } = useData();
  const { notify } = useNotification();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Assessment | null>(null);

  // Form State for New Assessment Blueprint
  const [newTitle, setNewTitle] = useState('');
  const [newCode, setNewCode] = useState('CS101-DIAG2');
  const [newDuration, setNewDuration] = useState('45');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([
    'comp-variables',
    'comp-conditionals',
    'comp-loops',
  ]);

  const filteredAssessments = assessments.filter((exam) => {
    const matchesFilter =
      filterStatus === 'all' || exam.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesSearch =
      exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleCreateBlueprint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsCreateOpen(false);
    setNewTitle('');

    notify({
      type: 'success',
      title: 'Assessment Blueprint Published',
      message: `${newTitle} (${newCode}) published to CS 101 cohort. Scheduled for Fall 2026.`,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Diagnostic Assessment Blueprints"
        description="Author, schedule, and configure baseline diagnostic instruments mapped to introductory Computer Science competency dimensions."
        breadcrumbs={[
          { label: 'Instructor Suite' },
          { label: 'Assessments' },
        ]}
        actions={
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsCreateOpen(true)}
          >
            Create Diagnostic Blueprint
          </Button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#121520] border border-[#2B344D] rounded-lg">
          {(['all', 'Published', 'In Progress', 'Draft'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer capitalize ${
                filterStatus === st
                  ? 'bg-[#191E2E] text-white border border-[#3A4565]'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              {st === 'all' ? 'All Assessments' : st}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="w-full sm:w-64">
          <TextInput
            placeholder="Search blueprints..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-3.5 h-3.5 text-[#94A3B8]" />}
          />
        </div>
      </div>

      {/* Assessment Table */}
      <Card className="bg-[#121520] border-[#2B344D]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Blueprint & Code</TableHead>
              <TableHead>Course & Term</TableHead>
              <TableHead>Competencies Measured</TableHead>
              <TableHead>Items / Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submissions Recorded</TableHead>
              <TableHead className="text-right">Inspection</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAssessments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-[#94A3B8]">
                  No assessment blueprints match the selected filter.
                </TableCell>
              </TableRow>
            ) : (
              filteredAssessments.map((exam) => (
                <TableRow key={exam.id} isInteractive onClick={() => setSelectedExam(exam)}>
                  <TableCell className="font-semibold text-white">
                    <div>
                      <span>{exam.title}</span>
                      <span className="block text-[11px] font-mono text-purple-400">
                        {exam.code}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-[#94A3B8]">
                    <span className="block text-white">{exam.courseName}</span>
                    <span className="text-[11px] text-[#64748B]">{exam.term}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {competencies.slice(0, 4).map((c) => (
                        <span
                          key={c.id}
                          className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#191E2E] border border-[#2B344D] text-[#94A3B8]"
                        >
                          {c.code}
                        </span>
                      ))}
                      <span className="text-[10px] text-[#64748B] self-center">
                        +{competencies.length - 4} more
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono tabular-nums text-[#94A3B8]">
                    <span>{exam.questionIds.length} items</span>
                    <span className="block text-[11px] text-[#64748B]">
                      {exam.durationMinutes} mins
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      label={exam.status}
                      variant={exam.status === 'Published' ? 'success' : 'purple'}
                      size="sm"
                    />
                  </TableCell>
                  <TableCell className="font-mono tabular-nums text-white">
                    {submissions.filter((s) => s.assessmentId === exam.id).length} / 48
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedExam(exam);
                      }}
                    >
                      View Items
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Dialog: Create Diagnostic Blueprint */}
      <Dialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New CS Diagnostic Blueprint"
        description="Configure questions and target competencies for introductory CS."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleCreateBlueprint}>
              Publish Blueprint
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateBlueprint} className="space-y-4 text-xs">
          <FormField label="Assessment Title" required>
            <TextInput
              placeholder="e.g. Iteration & Array Bounds Diagnostic"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Blueprint Code" required>
              <TextInput
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                required
              />
            </FormField>
            <FormField label="Duration (Minutes)">
              <TextInput
                type="number"
                value={newDuration}
                onChange={(e) => setNewDuration(e.target.value)}
              />
            </FormField>
          </div>

          <div className="space-y-2 pt-2">
            <label className="block text-xs font-semibold text-white">
              Target CS Competencies to Measure
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-[#0B0D13] border border-[#2B344D] rounded-xl max-h-48 overflow-y-auto">
              {competencies.map((comp) => {
                const isChecked = selectedTopics.includes(comp.id);
                return (
                  <label
                    key={comp.id}
                    className="flex items-center gap-2 text-xs text-white cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTopics([...selectedTopics, comp.id]);
                        } else {
                          setSelectedTopics(selectedTopics.filter((id) => id !== comp.id));
                        }
                      }}
                      className="w-4 h-4 rounded border-[#2B344D] bg-[#121520] text-purple-600 focus:ring-purple-400"
                    />
                    <span>{comp.name}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </form>
      </Dialog>

      {/* Dialog: Blueprint Detail Viewer */}
      {selectedExam && (
        <Dialog
          isOpen={!!selectedExam}
          onClose={() => setSelectedExam(null)}
          title={selectedExam.title}
          description={`Code: ${selectedExam.code} · ${selectedExam.courseName} (${selectedExam.term})`}
          footer={
            <Button variant="secondary" size="sm" onClick={() => setSelectedExam(null)}>
              Close Details
            </Button>
          }
        >
          <div className="space-y-4 text-xs">
            <p className="text-[#94A3B8] leading-relaxed">
              {selectedExam.instructions}
            </p>

            <div className="space-y-2 pt-2">
              <h4 className="font-semibold text-white">Configured Assessment Items ({questions.length} Items):</h4>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {questions
                  .filter((q) => selectedExam.questionIds.includes(q.id))
                  .map((q) => {
                    const comp = competencies.find((c) => c.id === q.competencyId);
                    return (
                      <div
                        key={q.id}
                        className="p-3 rounded-lg bg-[#161B29] border border-[#2B344D] space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-white">
                            Q{q.questionNumber}. {q.title}
                          </span>
                          <span className="text-[10px] font-mono text-purple-300">
                            {comp?.name} ({q.points} pts)
                          </span>
                        </div>
                        <p className="text-[#94A3B8]">{q.prompt}</p>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
