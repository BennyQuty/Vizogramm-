import React, { useState } from 'react';
import { PacingRecommendation, StudentSubmission, User } from '../../types';
import { runCohortPacing } from '../../utils/aiClient';
import { Storage } from '../../utils/storage';
import {
  Sparkles,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit2,
  Clock,
  HelpCircle,
  FileText,
  Save,
} from 'lucide-react';

interface PacingRecommendationsViewProps {
  currentUser: User;
  submissions: StudentSubmission[];
  recommendations: PacingRecommendation[];
  onRecommendationsUpdated: (recs: PacingRecommendation[]) => void;
}

export const PacingRecommendationsView: React.FC<PacingRecommendationsViewProps> = ({
  currentUser,
  submissions,
  recommendations,
  onRecommendationsUpdated,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [editingRecId, setEditingRecId] = useState<string | null>(null);
  const [modifyNote, setModifyNote] = useState('');

  const analyzedSubmissions = submissions.filter(
    (s) => s.status === 'submitted' && s.analysisStatus === 'ready'
  );
  const countN = analyzedSubmissions.length;
  const isSmallSample = countN < 5;

  const handleGenerateOrRefresh = async () => {
    if (countN === 0) {
      setErrorMessage('Cannot generate cohort pacing recommendations until at least 1 student assessment is analyzed.');
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);

    const result = await runCohortPacing(analyzedSubmissions);
    setIsGenerating(false);

    if (result.success && result.data) {
      Storage.saveRecommendations(result.data);
      onRecommendationsUpdated(result.data);
      Storage.addAuditLog(
        'recommendations_generated',
        `Generated ${result.data.length} cohort recommendations based on ${countN} student analyses.`,
        currentUser.name
      );
    } else {
      setErrorMessage(result.error || 'Failed to generate recommendations. Please verify AI model connection.');
    }
  };

  const handleDecision = (
    recId: string,
    action: 'approved' | 'rejected' | 'modified',
    customNote?: string
  ) => {
    const updated = recommendations.map((r) => {
      if (r.id === recId) {
        return {
          ...r,
          status: action,
          modifiedNote: customNote || r.modifiedNote,
          decidedAt: new Date().toISOString(),
          decidedBy: currentUser.name,
        };
      }
      return r;
    });

    Storage.saveRecommendations(updated);
    onRecommendationsUpdated(updated);

    Storage.addAuditLog(
      'recommendation_decided',
      `Instructor marked ${recId} as ${action.toUpperCase()}${customNote ? ` with note: "${customNote}"` : ''}.`,
      currentUser.name
    );
  };

  const decidedRecs = recommendations.filter((r) => r.status !== 'pending');
  const pendingRecs = recommendations.filter((r) => r.status === 'pending');

  const aiConfig = Storage.getAIModelConfig();
  const isAiConnected = aiConfig.status === 'connected';

  return (
    <div className="space-y-8">
      {/* No AI model configured alert banner */}
      {!isAiConnected && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>
              <strong>AI Notice:</strong> No AI model configured. Contact the System Administrator.
            </span>
          </div>
          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-200 border border-amber-500/40">
            Model Offline
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white">AI-Driven Cohort Pacing Recommender</h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#9d62ff]/15 text-[#caa3ff] border border-[#9d62ff]/30">
              Based on {countN} student{countN === 1 ? '' : 's'}
            </span>
          </div>
          <p className="text-xs text-[#94a3b8] mt-1 max-w-2xl">
            Synthesizes cohort-wide reasoning error patterns to recommend pre-teaching adjustments. Every item is an{' '}
            <strong className="text-white">AI suggestion. Instructor decides.</strong>
          </p>
        </div>

        <button
          type="button"
          disabled={isGenerating || countN === 0}
          onClick={handleGenerateOrRefresh}
          className="btn-purple px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
          {isGenerating ? 'Synthesizing Cohort Trends...' : recommendations.length === 0 ? 'Generate Recommendations' : 'Refresh Recommendations'}
        </button>
      </div>

      {/* Small sample warning */}
      {countN > 0 && isSmallSample && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>
            <strong>Small sample warning (N = {countN} &lt; 5):</strong> Recommendations reflect early preliminary patterns. Pacing suggestions will achieve greater curricular fidelity as more class submissions arrive.
          </span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Rationale Disclaimer Banner */}
      <div className="p-3.5 rounded-xl bg-[#14141d] border border-[#272738] text-xs text-[#94a3b8] flex items-center gap-2">
        <HelpCircle className="w-4 h-4 text-[#9d62ff] shrink-0" />
        <span>
          <strong>Pedagogical Hypothesis:</strong> The link from a reasoning cluster to a programming topic is a diagnostic hypothesis for instructor review. The AI never determines final syllabi or academic standing.
        </span>
      </div>

      {/* Empty State */}
      {recommendations.length === 0 ? (
        <div className="brilliant-card rounded-2xl p-12 text-center border border-[#2b2b3a]">
          <Sparkles className="w-10 h-10 text-[#64748b] mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No pacing recommendations generated</h3>
          <p className="text-xs text-[#94a3b8] max-w-md mx-auto mb-5">
            {countN === 0
              ? 'Cohort recommendations require at least 1 analyzed student submission. Once your students submit the short form, click the generate button.'
              : `You have ${countN} analyzed student submission${countN === 1 ? '' : 's'}. Click "Generate Recommendations" above to trigger live AI cohort synthesis.`}
          </p>
          {countN > 0 && (
            <button
              onClick={handleGenerateOrRefresh}
              className="btn-purple px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
            >
              Generate Recommendations Now
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active / Pending Recommendations */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <span>Pending Instructor Review</span>
              <span className="text-xs text-[#94a3b8]">({pendingRecs.length})</span>
            </h3>

            {pendingRecs.length === 0 ? (
              <div className="p-6 rounded-xl bg-[#121217] border border-[#252533] text-center text-xs text-[#94a3b8]">
                All recommendations have been evaluated. Check the Decision Log below.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingRecs.map((rec) => (
                  <div
                    key={rec.id}
                    className="brilliant-card rounded-2xl p-5 border border-[#2e2e3e] flex flex-col justify-between shadow-[0_3px_0_0_rgba(255,255,255,0.04)]"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-[#caa3ff] px-2 py-0.5 rounded bg-[#9d62ff]/15 border border-[#9d62ff]/30">
                          {rec.id}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
                          AI suggestion. Instructor decides.
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-white">
                        {rec.concept}
                      </h4>

                      <div className="text-xs space-y-2">
                        <div className="p-2.5 rounded-lg bg-[#0e0e14] border border-[#222230] text-[#94a3b8]">
                          <strong className="text-[#cbd5e1] block text-[11px] mb-0.5">Cohort Diagnostic Evidence:</strong>
                          {rec.evidence}
                        </div>

                        <div className="p-2.5 rounded-lg bg-[#141420] border border-[#2a2a3e] text-[#e2e8f0]">
                          <strong className="text-[#85a3ff] block text-[11px] mb-0.5">Suggested Instructional Action:</strong>
                          {rec.suggested_action}
                        </div>

                        <p className="text-[11px] text-[#94a3b8] italic">
                          "{rec.rationale}"
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-5 pt-4 border-t border-[#232332]">
                      {editingRecId === rec.id ? (
                        <div className="space-y-2">
                          <label className="text-[11px] font-semibold text-[#cbd5e1] block">
                            Instructor Modification Note:
                          </label>
                          <textarea
                            value={modifyNote}
                            onChange={(e) => setModifyNote(e.target.value)}
                            placeholder="e.g. Approved with condition: allocate 15 mins instead of 30 mins to keep lab on schedule."
                            rows={2}
                            className="w-full px-3 py-1.5 rounded-lg bg-[#0e0e13] border border-[#343446] text-white text-xs focus:outline-none focus:border-[#9d62ff]"
                          />
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingRecId(null)}
                              className="px-2.5 py-1 rounded-lg text-xs text-[#94a3b8] hover:text-white"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                handleDecision(rec.id, 'modified', modifyNote);
                                setEditingRecId(null);
                                setModifyNote('');
                              }}
                              className="btn-purple px-3 py-1 rounded-lg text-xs font-bold"
                            >
                              Save & Adopt
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleDecision(rec.id, 'rejected')}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-950/30 text-rose-300 border border-rose-800/40 hover:bg-rose-950/50 cursor-pointer transition-colors"
                          >
                            Reject
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingRecId(rec.id);
                              setModifyNote('');
                            }}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#20202e] text-[#caa3ff] border border-[#37374d] hover:bg-[#2b2b3d] cursor-pointer transition-colors"
                          >
                            Modify Note
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDecision(rec.id, 'approved')}
                            className="btn-purple px-4 py-1.5 rounded-xl text-xs font-bold cursor-pointer"
                          >
                            Approve
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ========================================================= */}
          {/* VISIBLE DECISION LOG WITH TIMESTAMPS                      */}
          {/* ========================================================= */}
          <div className="mt-10 pt-6 border-t border-[#262635]">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center justify-between">
              <span>Instructor Decision Log</span>
              <span className="text-xs text-[#94a3b8] font-normal">{decidedRecs.length} logged actions</span>
            </h3>

            {decidedRecs.length === 0 ? (
              <div className="p-6 rounded-2xl bg-[#121217] border border-[#252533] text-center text-xs text-[#94a3b8]">
                No decisions recorded yet. Evaluated recommendations will automatically log here with timestamps and notes.
              </div>
            ) : (
              <div className="brilliant-card rounded-2xl overflow-hidden border border-[#2b2b3a]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#101018] border-b border-[#232330] text-[#94a3b8] uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Concept / ID</th>
                      <th className="py-3 px-4">Decision</th>
                      <th className="py-3 px-4">Instructor Note</th>
                      <th className="py-3 px-4">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e1e2b]">
                    {decidedRecs.map((d) => (
                      <tr key={d.id} className="hover:bg-[#14141e]">
                        <td className="py-3 px-4 font-semibold text-white">
                          <div>{d.concept}</div>
                          <span className="font-mono text-[10px] text-[#94a3b8]">{d.id}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                              d.status === 'approved'
                                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                : d.status === 'modified'
                                ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                                : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                            }`}
                          >
                            {d.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[#cbd5e1] max-w-xs">
                          {d.modifiedNote || 'Standard adoption without curricular modification.'}
                        </td>
                        <td className="py-3 px-4 text-[#94a3b8] font-mono text-[11px] whitespace-nowrap">
                          {d.decidedAt ? new Date(d.decidedAt).toLocaleString() : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
