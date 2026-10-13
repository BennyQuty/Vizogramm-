import { useState } from 'react';
import { useRouter } from '../../context/RouterContext';
import { useData } from '../../context/DataContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import {
  Users,
  Target,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Layers,
  BarChart3,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileCheck,
} from 'lucide-react';

export function DashboardPage() {
  const { navigate } = useRouter();
  const {
    assessments,
    submissions,
    competencies,
    recommendations,
    activities,
    getClassAnalytics,
    generateNewPacingRecommendation,
  } = useData();

  const analytics = getClassAnalytics();
  const [selectedCompId, setSelectedCompId] = useState<string>('comp-conditionals');

  const selectedComp =
    competencies.find((c) => c.id === selectedCompId) || competencies[3];
  const dist = analytics.competencyDistribution[selectedCompId] || {
    mastered: 0,
    shaky: 0,
    criticalGap: 0,
    insufficientEvidence: 0,
  };

  const pendingRecs = recommendations.filter((r) => r.status === 'Pending Review');

  return (
    <div className="space-y-6">
      <PageHeader
        title="CS 101 Cohort Diagnostic Pulse"
        description="Real-time post-assessment diagnostic synthesis. Data informs instructional pacing decisions before introducing dependent programming concepts."
        breadcrumbs={[
          { label: 'Instructor Suite' },
          { label: 'Course Health' },
        ]}
        badge={
          <StatusBadge
            label="Fall 2026 Live Cohort"
            variant="purple"
          />
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<BarChart3 className="w-3.5 h-3.5" />}
              onClick={() => navigate('/instructor/analytics')}
            >
              Class Heatmap
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Sparkles className="w-3.5 h-3.5" />}
              onClick={() => navigate('/instructor/recommendations')}
            >
              Pacing Recommendations ({pendingRecs.length})
            </Button>
          </div>
        }
      />

      {/* Primary KPI Strip - Connected Live Numbers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Participation */}
        <Card className="bg-[#121520] border-[#2B344D]">
          <div className="flex items-center justify-between text-xs text-[#94A3B8]">
            <span>Assessment Participation</span>
            <Users className="w-4 h-4 text-[#94A3B8]" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-bold font-mono tabular-nums text-white">
              {analytics.participationRatePercentage}%
            </span>
            <span className="text-xs text-[#94A3B8] font-mono">
              ({analytics.submittedAssessmentsCount} / {analytics.enrolledStudentsCount})
            </span>
          </div>
          <p className="text-[11px] text-[#94A3B8] mt-2">
            Baseline submissions recorded in live store
          </p>
        </Card>

        {/* Cohort Mean Score */}
        <Card className="bg-[#121520] border-[#2B344D]">
          <div className="flex items-center justify-between text-xs text-[#94A3B8]">
            <span>Cohort Score Average</span>
            <Target className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-bold font-mono tabular-nums text-white">
              {analytics.averageScorePercentage}%
            </span>
            <span className="text-xs text-[#94A3B8] font-mono">
              (Median: {analytics.medianScorePercentage}%)
            </span>
          </div>
          <p className="text-[11px] text-[#94A3B8] mt-2">
            Deterministic evaluation of 10 items
          </p>
        </Card>

        {/* Top Critical Gap */}
        <Card className="bg-[#121520] border-rose-500/30">
          <div className="flex items-center justify-between text-xs text-rose-300">
            <span>Critical Concept Gaps</span>
            <TrendingDown className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-bold font-mono tabular-nums text-rose-400">
              {analytics.criticalGapTopicIds.length}
            </span>
            <span className="text-xs text-rose-300 font-semibold">
              Topics Identified
            </span>
          </div>
          <p className="text-[11px] text-[#94A3B8] mt-2">
            Highest concentration: <strong>Conditional Statements</strong>
          </p>
        </Card>

        {/* Awaiting Instructor Review */}
        <Card className="bg-[#121520] border-amber-500/30">
          <div className="flex items-center justify-between text-xs text-amber-300">
            <span>Pacing Recommendations</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-bold font-mono tabular-nums text-amber-300">
              {analytics.pendingRecommendationsCount}
            </span>
            <span className="text-xs text-amber-300 font-semibold">
              Awaiting Review
            </span>
          </div>
          <p className="text-[11px] text-[#94A3B8] mt-2">
            Instructor decisions required before next lecture
          </p>
        </Card>
      </div>

      {/* Main Two-Column View: Competency Distribution Explorer vs Awaiting Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Competency Distribution Explorer */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="bg-[#121520] border-[#2B344D]">
            <CardHeader className="pb-3 border-b border-[#1E2538]">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base text-white">
                    Class Competency Distribution
                  </CardTitle>
                  <CardDescription className="text-xs text-[#94A3B8] mt-1">
                    Select a competency to inspect student readiness breakdown.
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  onClick={() => navigate('/instructor/analytics')}
                >
                  Full Heatmap
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-3 pt-2">
              <div className="space-y-2">
                {competencies.map((comp) => {
                  const isSelected = comp.id === selectedCompId;
                  const cDist = analytics.competencyDistribution[comp.id] || {
                    mastered: 0,
                    shaky: 0,
                    criticalGap: 0,
                    insufficientEvidence: 0,
                  };

                  return (
                    <div
                      key={comp.id}
                      onClick={() => setSelectedCompId(comp.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#191E2E] border-purple-500/60 ring-1 ring-purple-500/30'
                          : 'bg-[#121520] border-[#2B344D] hover:border-[#414E73] hover:bg-[#161B29]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-white">
                            {comp.name}
                          </span>
                          <span className="text-[10px] font-mono text-[#94A3B8]">
                            ({comp.code})
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs font-mono">
                          {cDist.criticalGap > 0 && (
                            <span className="text-rose-400 font-semibold">
                              {cDist.criticalGap} Critical
                            </span>
                          )}
                          <span className="text-emerald-400">
                            {cDist.mastered} Mastered
                          </span>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="mt-3 pt-3 border-t border-[#2B344D] space-y-2">
                          <p className="text-xs text-[#94A3B8]">
                            {comp.description}
                          </p>

                          <div className="grid grid-cols-4 gap-2 text-center text-xs pt-1">
                            <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                              <span className="text-[10px] block opacity-80">Mastered</span>
                              <span className="font-bold font-mono text-sm">{cDist.mastered}</span>
                            </div>
                            <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300">
                              <span className="text-[10px] block opacity-80">Shaky</span>
                              <span className="font-bold font-mono text-sm">{cDist.shaky}</span>
                            </div>
                            <div className="p-2 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300">
                              <span className="text-[10px] block opacity-80">Critical Gap</span>
                              <span className="font-bold font-mono text-sm">{cDist.criticalGap}</span>
                            </div>
                            <div className="p-2 rounded bg-zinc-500/10 border border-zinc-500/20 text-zinc-300">
                              <span className="text-[10px] block opacity-80">Insufficient</span>
                              <span className="font-bold font-mono text-sm">{cDist.insufficientEvidence}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                generateNewPacingRecommendation(comp.id);
                                navigate('/instructor/recommendations');
                              }}
                            >
                              Generate Pacing Recommendation →
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (5 cols): Recommendations Needing Immediate Action */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="bg-[#121520] border-[#2B344D]">
            <CardHeader className="pb-3 border-b border-[#1E2538]">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base text-white">
                    Pacing Recommendations
                  </CardTitle>
                  <CardDescription className="text-xs text-[#94A3B8] mt-1">
                    AI suggestions ready for instructor decision.
                  </CardDescription>
                </div>
                <StatusBadge
                  label={`${pendingRecs.length} Actionable`}
                  variant="orange"
                  size="sm"
                />
              </div>
            </CardHeader>

            <CardContent className="space-y-3 pt-2">
              {recommendations.slice(0, 3).map((rec) => (
                <div
                  key={rec.id}
                  className="p-3.5 rounded-xl border border-[#2B344D] bg-[#161B29] space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-semibold text-white leading-snug">
                      {rec.competencyName}
                    </h4>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
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
                  </div>

                  <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                    {rec.suggestedAction}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-[#1E2538] text-[11px]">
                    <span className="text-[#94A3B8]">
                      Affects <strong>{rec.affectedStudentCount}</strong> students
                    </span>
                    <button
                      type="button"
                      onClick={() => navigate('/instructor/recommendations')}
                      className="text-purple-400 hover:text-purple-300 font-medium cursor-pointer"
                    >
                      Review & Decide →
                    </button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Live Activity Stream */}
          <Card className="bg-[#121520] border-[#2B344D]">
            <CardHeader className="pb-2 border-b border-[#1E2538]">
              <CardTitle className="text-sm text-white">
                Recent Diagnostic Activities
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2 space-y-2 text-xs">
              {activities.slice(0, 4).map((act) => (
                <div
                  key={act.id}
                  className="p-2 rounded-lg bg-[#0E111B] border border-[#1E2538] flex items-start justify-between gap-2"
                >
                  <div>
                    <span className="font-semibold text-white block leading-snug">
                      {act.type}
                    </span>
                    <span className="text-[11px] text-[#94A3B8] block mt-0.5">
                      {act.details}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#64748B] whitespace-nowrap shrink-0">
                    {act.timestamp.split(' ')[1] || act.timestamp}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Live Submissions Table */}
      <Card className="bg-[#121520] border-[#2B344D]">
        <CardHeader className="pb-3 border-b border-[#1E2538]">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base text-white">
                Student Submissions Queue ({submissions.length})
              </CardTitle>
              <CardDescription className="text-xs text-[#94A3B8] mt-1">
                Real-time assessment submissions and diagnostic analysis status.
              </CardDescription>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/instructor/students')}
            >
              Full Student Roster
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Submission Timestamp</TableHead>
                <TableHead>Raw Score</TableHead>
                <TableHead>Percentage</TableHead>
                <TableHead>Diagnostic Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell className="font-medium text-white">
                    <div>
                      <span>{sub.studentName}</span>
                      <span className="block text-[11px] font-mono text-[#94A3B8]">
                        {sub.studentEmail}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-[#94A3B8] font-mono text-xs">
                    {sub.submittedAt || 'Just now'}
                  </TableCell>
                  <TableCell className="font-mono tabular-nums text-white">
                    {sub.rawScore} / {sub.maxScore}
                  </TableCell>
                  <TableCell className="font-mono tabular-nums text-white font-semibold">
                    {sub.scorePercentage}%
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      label="Completed"
                      variant="success"
                      size="sm"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate('/instructor/students')}
                    >
                      Inspect Profile
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
