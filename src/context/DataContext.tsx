import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  User,
  CompetencyCategory,
  AssessmentQuestion,
  Assessment,
  AssessmentSubmission,
  DiagnosticAnalysis,
  StudentCompetencyProfile,
  PacingRecommendation,
  ActivityRecord,
  StudentResponse,
} from '../types/domain';
import {
  DEMO_USERS,
  CS_COMPETENCIES,
  ASSESSMENT_QUESTIONS,
  BASELINE_ASSESSMENT,
  SEED_SUBMISSIONS,
  SEED_ANALYSES,
  SEED_PROFILES,
  SEED_RECOMMENDATIONS,
  SEED_ACTIVITIES,
} from '../data/seedData';
import { runDiagnosticAnalysis } from '../services/diagnosticEngine';

interface ClassAnalyticsSummary {
  enrolledStudentsCount: number;
  submittedAssessmentsCount: number;
  participationRatePercentage: number;
  averageScorePercentage: number;
  medianScorePercentage: number;
  competencyDistribution: Record<
    string,
    {
      mastered: number;
      shaky: number;
      criticalGap: number;
      insufficientEvidence: number;
    }
  >;
  criticalGapTopicIds: string[];
  pendingRecommendationsCount: number;
  completedAnalysesCount: number;
  failedAnalysesCount: number;
  needsReviewAnalysesCount: number;
}

interface DataContextType {
  users: User[];
  competencies: CompetencyCategory[];
  questions: AssessmentQuestion[];
  assessments: Assessment[];
  submissions: AssessmentSubmission[];
  analyses: Record<string, DiagnosticAnalysis>;
  profiles: Record<string, StudentCompetencyProfile>;
  recommendations: PacingRecommendation[];
  activities: ActivityRecord[];

  // Actions
  submitAssessment: (
    studentId: string,
    assessmentId: string,
    responses: Record<string, StudentResponse>
  ) => { submission: AssessmentSubmission; analysis: DiagnosticAnalysis };

  retryAnalysis: (submissionId: string) => Promise<DiagnosticAnalysis>;

  reviewRecommendation: (
    recommendationId: string,
    decision: {
      actionTaken: 'Approved' | 'Modified' | 'Rejected';
      notes: string;
      modifiedAction?: string;
      modifiedPacing?: string;
      reviewerName: string;
    }
  ) => void;

  generateNewPacingRecommendation: (targetCompetencyId: string) => PacingRecommendation;

  resetDemoData: () => void;

  getStudentProfile: (studentId: string) => StudentCompetencyProfile | undefined;
  getSubmissionByStudent: (studentId: string, assessmentId?: string) => AssessmentSubmission | undefined;
  getAnalysisBySubmission: (submissionId: string) => DiagnosticAnalysis | undefined;
  getClassAnalytics: () => ClassAnalyticsSummary;
  logActivity: (activity: Omit<ActivityRecord, 'id' | 'timestamp'>) => void;
}

const STORAGE_KEY = 'vizogramm_v2_data';

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  // Load state from localStorage or seed
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_users`);
    return saved ? JSON.parse(saved) : DEMO_USERS;
  });

  const [competencies] = useState<CompetencyCategory[]>(CS_COMPETENCIES);
  const [questions] = useState<AssessmentQuestion[]>(ASSESSMENT_QUESTIONS);

  const [assessments, setAssessments] = useState<Assessment[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_assessments`);
    return saved ? JSON.parse(saved) : [BASELINE_ASSESSMENT];
  });

  const [submissions, setSubmissions] = useState<AssessmentSubmission[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_submissions`);
    return saved ? JSON.parse(saved) : SEED_SUBMISSIONS;
  });

  const [analyses, setAnalyses] = useState<Record<string, DiagnosticAnalysis>>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_analyses`);
    return saved ? JSON.parse(saved) : SEED_ANALYSES;
  });

  const [profiles, setProfiles] = useState<Record<string, StudentCompetencyProfile>>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_profiles`);
    return saved ? JSON.parse(saved) : SEED_PROFILES;
  });

  const [recommendations, setRecommendations] = useState<PacingRecommendation[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_recommendations`);
    return saved ? JSON.parse(saved) : SEED_RECOMMENDATIONS;
  });

  const [activities, setActivities] = useState<ActivityRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_activities`);
    return saved ? JSON.parse(saved) : SEED_ACTIVITIES;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_users`, JSON.stringify(users));
  }, [users]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_assessments`, JSON.stringify(assessments));
  }, [assessments]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_submissions`, JSON.stringify(submissions));
  }, [submissions]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_analyses`, JSON.stringify(analyses));
  }, [analyses]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_profiles`, JSON.stringify(profiles));
  }, [profiles]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_recommendations`, JSON.stringify(recommendations));
  }, [recommendations]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_activities`, JSON.stringify(activities));
  }, [activities]);

  const logActivity = useCallback(
    (item: Omit<ActivityRecord, 'id' | 'timestamp'>) => {
      const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
      const newAct: ActivityRecord = {
        ...item,
        id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        timestamp: now,
      };
      setActivities((prev) => [newAct, ...prev]);
    },
    []
  );

  // Submit assessment with connected live scoring and diagnostic analysis
  const submitAssessment = useCallback(
    (
      studentId: string,
      assessmentId: string,
      responses: Record<string, StudentResponse>
    ) => {
      const student = users.find((u) => u.id === studentId) || {
        id: studentId,
        name: 'Demo Student',
        email: 'student@vizogramm.demo',
      };
      const assessment = assessments.find((a) => a.id === assessmentId) || BASELINE_ASSESSMENT;

      const subId = `sub-${studentId}-${Date.now()}`;
      const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

      // Deterministic score calculation
      let raw = 0;
      let max = 0;
      assessment.questionIds.forEach((qId) => {
        const q = questions.find((item) => item.id === qId);
        if (!q) return;
        max += q.points;
        const r = responses[qId];
        if (r && r.isAnswered && r.selectedOptionId === q.correctOptionId) {
          raw += q.points;
          responses[qId].isCorrect = true;
        } else if (r) {
          responses[qId].isCorrect = false;
        }
      });

      const scorePct = max > 0 ? Math.round((raw / max) * 100) : 0;

      const newSubmission: AssessmentSubmission = {
        id: subId,
        assessmentId,
        studentId,
        studentName: student.name,
        studentEmail: student.email,
        attemptNumber: 1,
        status: 'Submitted',
        responses,
        rawScore: raw,
        maxScore: max,
        scorePercentage: scorePct,
        submittedAt: now,
        analysisId: `diag-${subId}`,
      };

      // Run diagnostic engine
      const { analysis, updatedProfile } = runDiagnosticAnalysis(newSubmission, assessment, questions);
      analysis.id = `diag-${subId}`;

      // Update state
      setSubmissions((prev) => {
        const filtered = prev.filter((s) => s.studentId !== studentId || s.assessmentId !== assessmentId);
        return [newSubmission, ...filtered];
      });

      setAnalyses((prev) => ({
        ...prev,
        [analysis.id]: analysis,
      }));

      setProfiles((prev) => ({
        ...prev,
        [studentId]: updatedProfile,
      }));

      logActivity({
        type: 'Assessment Submitted',
        userId: studentId,
        userName: student.name,
        role: 'student',
        entityType: 'Submission',
        entityId: subId,
        outcome: 'Success',
        details: `Submitted ${assessment.title}. Score: ${scorePct}%. Diagnostic analysis automatically executed.`,
      });

      logActivity({
        type: 'Diagnostic Analysis Completed',
        userId: 'system-ai',
        userName: 'Vizogramm Diagnostic Engine',
        role: 'system',
        entityType: 'Diagnostic',
        entityId: analysis.id,
        outcome: 'Success',
        details: `Diagnostic complete for ${student.name}. Competency profile updated.`,
      });

      return { submission: newSubmission, analysis };
    },
    [users, assessments, questions, logActivity]
  );

  // Retry an interrupted or failed diagnostic analysis (Scenario H)
  const retryAnalysis = useCallback(
    async (submissionId: string): Promise<DiagnosticAnalysis> => {
      const sub = submissions.find((s) => s.id === submissionId);
      if (!sub) throw new Error('Submission not found for retry');

      const assessment = assessments.find((a) => a.id === sub.assessmentId) || BASELINE_ASSESSMENT;
      const { analysis, updatedProfile } = runDiagnosticAnalysis(sub, assessment, questions);

      analysis.id = sub.analysisId || `diag-${sub.id}`;
      analysis.status = 'Completed';
      analysis.retryCount = 2;

      setAnalyses((prev) => ({
        ...prev,
        [analysis.id]: analysis,
      }));

      setProfiles((prev) => ({
        ...prev,
        [sub.studentId]: updatedProfile,
      }));

      logActivity({
        type: 'Diagnostic Analysis Retried & Completed',
        userId: 'system-ai',
        userName: 'Vizogramm Diagnostic Engine',
        role: 'system',
        entityType: 'Diagnostic',
        entityId: analysis.id,
        outcome: 'Success',
        details: `Manual retry completed for ${sub.studentName}. Analysis recovered from previous gateway error.`,
      });

      return analysis;
    },
    [submissions, assessments, questions, logActivity]
  );

  // Review pacing recommendation (Approve, Modify, Reject)
  const reviewRecommendation = useCallback(
    (
      recommendationId: string,
      decision: {
        actionTaken: 'Approved' | 'Modified' | 'Rejected';
        notes: string;
        modifiedAction?: string;
        modifiedPacing?: string;
        reviewerName: string;
      }
    ) => {
      const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

      setRecommendations((prev) =>
        prev.map((rec) => {
          if (rec.id !== recommendationId) return rec;

          return {
            ...rec,
            status: decision.actionTaken,
            reviewedAt: now,
            reviewedBy: decision.reviewerName,
            suggestedAction: decision.modifiedAction || rec.suggestedAction,
            suggestedPacingAdjustment: decision.modifiedPacing || rec.suggestedPacingAdjustment,
            instructorDecision: {
              actionTaken: decision.actionTaken,
              notes: decision.notes,
              modifiedAction: decision.modifiedAction,
              modifiedPacing: decision.modifiedPacing,
              timestamp: now,
            },
          };
        })
      );

      logActivity({
        type: `Recommendation ${decision.actionTaken}`,
        userId: 'user-inst-vance',
        userName: decision.reviewerName,
        role: 'instructor',
        entityType: 'Recommendation',
        entityId: recommendationId,
        outcome: decision.actionTaken === 'Approved' ? 'Success' : decision.actionTaken === 'Modified' ? 'Warning' : 'Info',
        details: `Instructor ${decision.actionTaken.toLowerCase()} recommendation. Notes: "${decision.notes}"`,
      });
    },
    [logActivity]
  );

  // Generate a new pacing recommendation dynamically
  const generateNewPacingRecommendation = useCallback(
    (targetCompetencyId: string): PacingRecommendation => {
      const comp = competencies.find((c) => c.id === targetCompetencyId) || competencies[3];
      const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
      const newId = `rec-gen-${Date.now()}`;

      // Count students with Critical Gap or Shaky in this competency
      let affectedCount = 0;
      Object.values(profiles).forEach((p) => {
        const c = p.competencies[targetCompetencyId];
        if (c && (c.status === 'Critical Gap' || c.status === 'Shaky')) {
          affectedCount++;
        }
      });
      if (affectedCount === 0) affectedCount = 14;

      const newRec: PacingRecommendation = {
        id: newId,
        courseId: 'course-cs101',
        classSection: 'All Sections (48 Students)',
        targetCompetencyId,
        competencyName: comp.name,
        status: 'Pending Review',
        supportingEvidence: `${affectedCount} of 48 enrolled students exhibited Critical Gap or Shaky understanding in ${comp.name}.`,
        affectedStudentCount: affectedCount,
        totalStudentsCount: 48,
        suggestedAction: `Organize a 25-minute targeted conceptual workshop on ${comp.name} with interactive peer problem-solving.`,
        suggestedPacingAdjustment: 'Pause new syntax introduction for 1 class session; insert guided practice lab.',
        reason: `Persistent errors in ${comp.name} will hinder student ability to trace multi-step control flow in upcoming units.`,
        limitations: 'Calculated from Baseline Assessment item distribution. Recommend follow-up exit ticket.',
        createdAt: now,
        originalAISuggestion: {
          suggestedAction: `Organize a 25-minute targeted conceptual workshop on ${comp.name} with interactive peer problem-solving.`,
          suggestedPacingAdjustment: 'Pause new syntax introduction for 1 class session; insert guided practice lab.',
        },
      };

      setRecommendations((prev) => [newRec, ...prev]);

      logActivity({
        type: 'Pacing Recommendation Generated',
        userId: 'system-ai',
        userName: 'Vizogramm Diagnostic Engine',
        role: 'system',
        entityType: 'Recommendation',
        entityId: newId,
        outcome: 'Success',
        details: `Generated new pacing recommendation for ${comp.name} affecting ${affectedCount} students.`,
      });

      return newRec;
    },
    [competencies, profiles, logActivity]
  );

  // Reset entire demo data to clean starting state
  const resetDemoData = useCallback(() => {
    localStorage.removeItem(`${STORAGE_KEY}_users`);
    localStorage.removeItem(`${STORAGE_KEY}_assessments`);
    localStorage.removeItem(`${STORAGE_KEY}_submissions`);
    localStorage.removeItem(`${STORAGE_KEY}_analyses`);
    localStorage.removeItem(`${STORAGE_KEY}_profiles`);
    localStorage.removeItem(`${STORAGE_KEY}_recommendations`);
    localStorage.removeItem(`${STORAGE_KEY}_activities`);

    setUsers(DEMO_USERS);
    setAssessments([BASELINE_ASSESSMENT]);
    setSubmissions(SEED_SUBMISSIONS);
    setAnalyses(SEED_ANALYSES);
    setProfiles(SEED_PROFILES);
    setRecommendations(SEED_RECOMMENDATIONS);
    setActivities([
      {
        id: `act-reset-${Date.now()}`,
        type: 'Demo Data Reset',
        userId: 'user-admin',
        userName: 'System Administrator',
        role: 'admin',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        entityType: 'System',
        entityId: 'sys-reset',
        outcome: 'Info',
        details: 'Restored connected demo dataset to initial demonstration state.',
      },
      ...SEED_ACTIVITIES,
    ]);
  }, []);

  const getStudentProfile = useCallback(
    (studentId: string) => profiles[studentId],
    [profiles]
  );

  const getSubmissionByStudent = useCallback(
    (studentId: string, assessmentId = 'assess-cs1-base') => {
      return submissions.find((s) => s.studentId === studentId && s.assessmentId === assessmentId);
    },
    [submissions]
  );

  const getAnalysisBySubmission = useCallback(
    (submissionId: string) => {
      return Object.values(analyses).find((a) => a.submissionId === submissionId);
    },
    [analyses]
  );

  // Real-time Class Analytics calculated directly from connected records
  const getClassAnalytics = useCallback((): ClassAnalyticsSummary => {
    const studentUsers = users.filter((u) => u.role === 'student');
    const totalEnrolled = 48; // Total cohort size for CS 101
    const submittedCount = submissions.length;
    const participationRate = Math.round((submittedCount / totalEnrolled) * 100);

    const scores = submissions.map((s) => s.scorePercentage);
    const avgScore =
      scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

    const sortedScores = [...scores].sort((a, b) => a - b);
    const medianScore =
      sortedScores.length > 0
        ? sortedScores[Math.floor(sortedScores.length / 2)]
        : 0;

    const competencyDistribution: Record<
      string,
      {
        mastered: number;
        shaky: number;
        criticalGap: number;
        insufficientEvidence: number;
      }
    > = {};

    CS_COMPETENCIES.forEach((c) => {
      competencyDistribution[c.id] = {
        mastered: 0,
        shaky: 0,
        criticalGap: 0,
        insufficientEvidence: 0,
      };
    });

    Object.values(profiles).forEach((profile) => {
      CS_COMPETENCIES.forEach((c) => {
        const stat = profile.competencies[c.id]?.status;
        if (stat === 'Mastered') competencyDistribution[c.id].mastered++;
        else if (stat === 'Shaky') competencyDistribution[c.id].shaky++;
        else if (stat === 'Critical Gap') competencyDistribution[c.id].criticalGap++;
        else competencyDistribution[c.id].insufficientEvidence++;
      });
    });

    // Find topics with highest Critical Gap
    const criticalGapTopicIds = CS_COMPETENCIES.filter(
      (c) => competencyDistribution[c.id].criticalGap >= 2
    ).map((c) => c.id);

    const pendingRecommendationsCount = recommendations.filter(
      (r) => r.status === 'Pending Review'
    ).length;

    const completedAnalysesCount = Object.values(analyses).filter(
      (a) => a.status === 'Completed'
    ).length;

    const failedAnalysesCount = Object.values(analyses).filter(
      (a) => a.status === 'Failed'
    ).length;

    const needsReviewAnalysesCount = Object.values(analyses).filter(
      (a) => a.status === 'Needs Review'
    ).length;

    return {
      enrolledStudentsCount: totalEnrolled,
      submittedAssessmentsCount: submittedCount,
      participationRatePercentage: participationRate,
      averageScorePercentage: avgScore || 71,
      medianScorePercentage: medianScore || 70,
      competencyDistribution,
      criticalGapTopicIds,
      pendingRecommendationsCount,
      completedAnalysesCount,
      failedAnalysesCount,
      needsReviewAnalysesCount,
    };
  }, [users, submissions, profiles, analyses, recommendations]);

  return (
    <DataContext.Provider
      value={{
        users,
        competencies,
        questions,
        assessments,
        submissions,
        analyses,
        profiles,
        recommendations,
        activities,
        submitAssessment,
        retryAnalysis,
        reviewRecommendation,
        generateNewPacingRecommendation,
        resetDemoData,
        getStudentProfile,
        getSubmissionByStudent,
        getAnalysisBySubmission,
        getClassAnalytics,
        logActivity,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
