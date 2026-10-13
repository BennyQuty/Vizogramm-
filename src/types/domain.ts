/**
 * Vizogramm Domain Types
 * Unified, connected data models for CS post-assessment diagnostic platform
 */

export type UserRole = 'student' | 'instructor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarInitials: string;
  studentId?: string; // e.g. "STU-001"
  section?: string;   // e.g. "Section A (Prof. Vance)"
}

export type AssessmentStatus = 'Draft' | 'Published' | 'In Progress' | 'Submitted' | 'Closed';

export type DiagnosticAnalysisStatus =
  | 'Not Started'
  | 'Pending'
  | 'Analyzing'
  | 'Completed'
  | 'Failed'
  | 'Needs Review';

export type CompetencyStatus =
  | 'Mastered'
  | 'Shaky'
  | 'Critical Gap'
  | 'Insufficient Evidence';

export type RecommendationStatus =
  | 'Draft'
  | 'Pending Review'
  | 'Approved'
  | 'Modified'
  | 'Rejected'
  | 'Applied';

export interface CompetencyCategory {
  id: string;
  code: string;
  name: string;
  description: string;
  order: number;
}

export interface AnswerChoice {
  id: string;
  text: string;
  misconceptionTag?: string; // e.g. "conditional-boundary-inversion"
}

export interface AssessmentQuestion {
  id: string;
  questionNumber: number;
  competencyId: string;
  title: string;
  prompt: string;
  codeSnippet?: string;
  options: AnswerChoice[];
  correctOptionId: string;
  explanation: string;
  points: number;
  difficulty: 'Foundation' | 'Intermediate' | 'Advanced';
}

export interface Assessment {
  id: string;
  code: string;
  title: string;
  courseId: string;
  courseName: string;
  term: string;
  instructions: string;
  status: AssessmentStatus;
  durationMinutes: number;
  totalPoints: number;
  questionIds: string[];
  dueDate: string;
}

export interface StudentResponse {
  questionId: string;
  selectedOptionId?: string;
  isAnswered: boolean;
  isCorrect?: boolean;
  timeSpentSeconds?: number;
}

export interface AssessmentSubmission {
  id: string;
  assessmentId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  attemptNumber: number;
  status: 'In Progress' | 'Submitted' | 'Closed';
  responses: Record<string, StudentResponse>;
  rawScore: number;
  maxScore: number;
  scorePercentage: number;
  submittedAt?: string;
  analysisId?: string;
}

export interface DiagnosticFinding {
  id: string;
  category: 'Careless Slip' | 'Repeated Misconception' | 'Unattempted / Possible Guess';
  competencyId: string;
  questionIds: string[];
  observedPattern: string;
  evidenceSummary: string;
  interpretation: string;
  confidence: 'High' | 'Moderate' | 'Low' | 'Insufficient Evidence';
  suggestedFollowUp: string;
  codeComparison?: {
    flawedSnippet: string;
    canonicalSnippet: string;
    explanation: string;
  };
}

export interface DiagnosticAnalysis {
  id: string;
  submissionId: string;
  studentId: string;
  assessmentId: string;
  status: DiagnosticAnalysisStatus;
  analyzedAt?: string;
  errorMessage?: string;
  retryCount?: number;
  findings: DiagnosticFinding[];
}

export interface StudentCompetencyDetail {
  competencyId: string;
  status: CompetencyStatus;
  questionsAttempted: number;
  questionsTotal: number;
  questionsCorrect: number;
  evidenceSummary: string;
  confidenceIndicator: 'High' | 'Moderate' | 'Low' | 'Insufficient Evidence';
  suggestedAction: string;
}

export interface StudentCompetencyProfile {
  studentId: string;
  studentName: string;
  overallScorePercentage: number;
  updatedAt: string;
  competencies: Record<string, StudentCompetencyDetail>;
}

export interface PacingRecommendation {
  id: string;
  courseId: string;
  classSection: string;
  targetCompetencyId: string;
  competencyName: string;
  status: RecommendationStatus;
  supportingEvidence: string;
  affectedStudentCount: number;
  totalStudentsCount: number;
  suggestedAction: string;
  suggestedPacingAdjustment: string;
  reason: string;
  limitations: string;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  instructorDecision?: {
    actionTaken: 'Approved' | 'Modified' | 'Rejected';
    notes: string;
    modifiedAction?: string;
    modifiedPacing?: string;
    timestamp: string;
  };
  originalAISuggestion: {
    suggestedAction: string;
    suggestedPacingAdjustment: string;
  };
}

export interface ActivityRecord {
  id: string;
  type: string;
  userId: string;
  userName: string;
  role: string;
  timestamp: string;
  entityType: 'Assessment' | 'Submission' | 'Diagnostic' | 'Recommendation' | 'System';
  entityId: string;
  outcome: 'Success' | 'Warning' | 'Error' | 'Info';
  details: string;
}
