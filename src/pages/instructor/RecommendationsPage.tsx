import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { PacingRecommendation, RecommendationStatus } from '../../types/domain';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Dialog } from '../../components/ui/Dialog';
import { Textarea, FormField, TextInput } from '../../components/ui/FormControls';
import {
  Sparkles,
  Users,
  Clock,
  CheckCircle,
  Edit3,
  XCircle,
  ArrowRight,
  ShieldAlert,
  History,
  FileText,
} from 'lucide-react';

export function RecommendationsPage() {
  const { recommendations, reviewRecommendation } = useData();
  const { user } = useAuth();
  const { notify } = useNotification();

  const [statusFilter, setStatusFilter] = useState<'All' | RecommendationStatus>('All');
  const [selectedRec, setSelectedRec] = useState<PacingRecommendation | null>(null);

  // Review modal state
  const [reviewMode, setReviewMode] = useState<'approve' | 'modify' | 'reject'>('approve');
  const [reviewNotes, setReviewNotes] = useState('');
  const [modifiedAction, setModifiedAction] = useState('');
  const [modifiedPacing, setModifiedPacing] = useState('');

  const filteredRecs = recommendations.filter((r) => {
    if (statusFilter === 'All') return true;
    return r.status === statusFilter;
  });

  const handleOpenReview = (rec: PacingRecommendation, mode: 'approve' | 'modify' | 'reject') => {
    setSelectedRec(rec);
    setReviewMode(mode);
    setReviewNotes('');
    setModifiedAction(rec.suggestedAction);
    setModifiedPacing(rec.suggestedPacingAdjustment);
  };

  const handleSaveDecision = () => {
    if (!selectedRec) return;

    if (reviewMode === 'reject' && !reviewNotes.trim()) {
      notify({
        type: 'warning',
        title: 'Review Notes Required',
        message: 'Please provide an instructional rationale for rejecting this recommendation.',
      });
      return;
    }

    const actionTaken: 'Approved' | 'Modified' | 'Rejected' =
      reviewMode === 'approve' ? 'Approved' : reviewMode === 'modify' ? 'Modified' : 'Rejected';

    reviewRecommendation(selectedRec.id, {
      actionTaken,
      notes: reviewNotes || (actionTaken === 'Approved' ? 'Approved as suggested.' : 'Modified by instructor.'),
      modifiedAction: reviewMode === 'modify' ? modifiedAction : undefined,
      modifiedPacing: reviewMode === 'modify' ? modifiedPacing : undefined,
      reviewerName: user.name,
    });

    notify({
      type: 'success',
      title: `Pacing Decision Recorded: ${actionTaken}`,
      message: `Updated status for ${selectedRec.competencyName}. Preserved original AI suggestion for audit comparison.`,
    });

    setSelectedRec(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Instructional Pacing Recommendations"
        description="Data-informed syllabus adjustments synthesized from class baseline diagnostic results. Instructors retain full authority to approve, modify, or reject every recommendation."
        breadcrumbs={[
          { label: 'Instructor Suite' },
          { label: 'Pacing Recommendations' },
        ]}
        badge={
          <StatusBadge
            label="Instructor Final Authority"
            variant="purple"
            icon={<Sparkles className="w-3.5 h-3.5" />}
          />
        }
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-[#121520] border border-[#2B344D] rounded-lg overflow-x-auto max-w-fit">
        {(['All', 'Pending Review', 'Approved', 'Modified', 'Rejected'] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
              statusFilter === s
                ? 'bg-[#191E2E] text-white border border-[#3D4868]'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            {s === 'All' ? 'All Recommendations' : s}
          </button>
        ))}
      </div>

      {/* Recommendation Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredRecs.map((rec) => {
          const isPending = rec.status === 'Pending Review';

          return (
            <Card key={rec.id} className="bg-[#121520] border-[#2B344D] flex flex-col justify-between space-y-4">
              <div>
                <CardHeader className="pb-3 border-b border-[#1E2538]">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded border ${
                        rec.status === 'Pending Review'
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                          : rec.status === 'Modified'
                          ? 'bg-sky-500/10 text-sky-300 border-sky-500/30'
                          : rec.status === 'Approved'
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                      }`}
                    >
                      {rec.status}
                    </span>
                    <span className="text-[11px] font-mono text-[#94A3B8]">
                      Created: {rec.createdAt}
                    </span>
                  </div>

                  <CardTitle className="text-base text-white mt-2 leading-snug">
                    {rec.competencyName}
                  </CardTitle>
                  <span className="text-xs text-[#94A3B8] block mt-0.5">
                    Target Cohort: {rec.classSection} (<strong>{rec.affectedStudentCount}</strong> of {rec.totalStudentsCount} affected)
                  </span>
                </CardHeader>

                <CardContent className="space-y-3.5 pt-2 text-xs">
                  {/* Supporting Evidence */}
                  <div className="p-3 rounded-lg bg-[#161B29] border border-[#2B344D] space-y-1">
                    <span className="font-semibold text-white block">
                      Supporting Diagnostic Evidence:
                    </span>
                    <p className="text-[#94A3B8] leading-relaxed">
                      {rec.supportingEvidence}
                    </p>
                  </div>

                  {/* Suggested Action */}
                  <div className="space-y-1">
                    <span className="font-semibold text-white block">
                      Suggested Instructional Action:
                    </span>
                    <p className="text-purple-300 leading-relaxed">
                      {rec.suggestedAction}
                    </p>
                  </div>

                  {/* Pacing Adjustment */}
                  <div className="space-y-1">
                    <span className="font-semibold text-white block">
                      Suggested Pacing Adjustment:
                    </span>
                    <p className="text-[#F8FAFC] leading-relaxed">
                      {rec.suggestedPacingAdjustment}
                    </p>
                  </div>

                  {/* Limitations */}
                  <div className="text-[11px] text-[#64748B] pt-1">
                    <strong>Limitations:</strong> {rec.limitations}
                  </div>

                  {/* Instructor Decision Record (if reviewed) */}
                  {rec.instructorDecision && (
                    <div className="p-3 rounded-lg bg-[#191E2E] border border-[#3A4565] space-y-1.5 mt-2">
                      <div className="flex items-center justify-between text-[#94A3B8] text-[11px]">
                        <span className="font-semibold text-white flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 text-purple-400" />
                          <span>Instructor Decision Recorded</span>
                        </span>
                        <span>{rec.reviewedBy} · {rec.reviewedAt}</span>
                      </div>
                      <p className="text-[#94A3B8] italic">
                        "{rec.instructorDecision.notes}"
                      </p>
                      {rec.status === 'Modified' && (
                        <div className="pt-1 text-[11px] text-zinc-400 border-t border-white/5">
                          <span className="text-zinc-500">Original AI Suggestion preserved: </span>
                          "{rec.originalAISuggestion.suggestedAction}"
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </div>

              {/* Action Buttons for Instructor */}
              <div className="pt-3 border-t border-[#1E2538] flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono text-[#64748B]">
                  ID: {rec.id}
                </span>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                    onClick={() => handleOpenReview(rec, 'modify')}
                  >
                    Modify
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<CheckCircle className="w-3.5 h-3.5" />}
                    onClick={() => handleOpenReview(rec, 'approve')}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-rose-400 hover:text-rose-300"
                    onClick={() => handleOpenReview(rec, 'reject')}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Dialog: Instructor Review & Decision Modal */}
      {selectedRec && (
        <Dialog
          isOpen={!!selectedRec}
          onClose={() => setSelectedRec(null)}
          title={`Instructor Decision: ${selectedRec.competencyName}`}
          description={`Action: ${reviewMode.toUpperCase()} · Affects ${selectedRec.affectedStudentCount} students in ${selectedRec.classSection}`}
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setSelectedRec(null)}>
                Cancel
              </Button>
              <Button
                variant={reviewMode === 'reject' ? 'destructive' : 'primary'}
                size="sm"
                onClick={handleSaveDecision}
              >
                Confirm {reviewMode.toUpperCase()} Decision
              </Button>
            </>
          }
        >
          <div className="space-y-4 text-xs">
            {reviewMode === 'modify' && (
              <>
                <FormField label="Modified Instructional Action" required>
                  <Textarea
                    rows={3}
                    value={modifiedAction}
                    onChange={(e) => setModifiedAction(e.target.value)}
                  />
                </FormField>
                <FormField label="Modified Pacing Adjustment" required>
                  <TextInput
                    value={modifiedPacing}
                    onChange={(e) => setModifiedPacing(e.target.value)}
                  />
                </FormField>
              </>
            )}

            <FormField
              label={
                reviewMode === 'reject'
                  ? 'Rejection Rationale (Required)'
                  : 'Instructor Review Notes (Optional)'
              }
              required={reviewMode === 'reject'}
            >
              <Textarea
                rows={3}
                placeholder={
                  reviewMode === 'reject'
                    ? 'Explain why this AI recommendation is not suitable for this class cohort...'
                    : 'Add notes for the course syllabus audit log...'
                }
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
              />
            </FormField>

            <div className="p-3 bg-[#191E2E] rounded-lg border border-[#2B344D] text-[#94A3B8] leading-relaxed">
              <strong className="text-white block mb-0.5">Audit & Responsibility Policy:</strong>
              Your decision will be recorded with your instructor credentials ({user.name}) and reflected on the course dashboard. Original AI recommendations are permanently preserved for comparative review.
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
