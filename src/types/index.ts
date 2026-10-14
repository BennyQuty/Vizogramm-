export type UserRole = 'student' | 'instructor' | 'admin';

export interface User {
  id: string;
  role: UserRole;
  email?: string;
  name: string;
  profileCompleted: boolean;
  createdAt: string;
  active: boolean;
}

export interface Section {
  id: string;
  name: string; // e.g. "Section A"
  course: string; // e.g. "Intro to Computer Science"
  level: 'E' | 'F' | 'G';
  form: '5' | '6';
  testDate: string;
  classCode?: string;
  instructorId?: string;
  instructorName: string;
  school: string;
}

export interface StudentProfileData {
  userId: string;
  lastName: string;
  firstName: string;
  middleInitial: string;
  dob?: string;
  studentNumber: string;
  gradeYearLevel: string;
  school?: string;
  instructor: string;
  sectionId: string;
  classCode?: string;
  level: 'E' | 'F' | 'G';
  form: '5' | '6';
  testDate: string;
  privacyAcknowledged: boolean;
  updatedAt: string;
}

export interface InstructorProfileData {
  userId: string;
  fullName: string;
  email?: string;
  school: string;
  department: string;
  updatedAt: string;
}

export interface AdminProfileData {
  userId: string;
  fullName?: string;
  email?: string;
  organization?: string;
  updatedAt: string;
}

export type ClusterName =
  | 'Verbal Comprehension'
  | 'Verbal Reasoning'
  | 'Figural Reasoning'
  | 'Quantitative Reasoning';

export type BroadClusterName = 'Verbal' | 'Nonverbal' | 'Total';

export type WrongOptionTag = 'slip' | 'misconception' | 'surface_match' | 'random';

export interface OptionItem {
  key: 'A' | 'B' | 'C' | 'D' | 'E';
  text?: string;
  svg?: string;
}

export interface AssessmentItem {
  id: string;
  cluster: ClusterName;
  broadCluster: 'Verbal' | 'Nonverbal';
  type: string;
  difficulty: 'easy' | 'medium' | 'hard';
  stem: string;
  stemSvg?: string;
  options: OptionItem[];
  key: 'A' | 'B' | 'C' | 'D' | 'E';
  wrongTags: Record<'A' | 'B' | 'C' | 'D' | 'E', WrongOptionTag | null>;
  rationale: string;
}

export type ScoreCategory = 'Below Average' | 'Average' | 'Above Average';

export interface ClusterScoreBreakdown {
  total: number;
  verbal: number;
  verbalComprehension: number;
  verbalReasoning: number;
  nonverbal: number;
  figuralReasoning: number;
  quantitativeReasoning: number;
}

export interface ClusterCategoryBreakdown {
  total: ScoreCategory;
  verbal: ScoreCategory;
  verbalComprehension: ScoreCategory;
  verbalReasoning: ScoreCategory;
  nonverbal: ScoreCategory;
  figuralReasoning: ScoreCategory;
  quantitativeReasoning: ScoreCategory;
}

export interface ClusterDiagnosis {
  status: 'mastered' | 'shaky' | 'absent';
  cause: 'careless_slip' | 'misconception' | 'never_learned' | 'mixed';
  reason: string;
}

export interface DiagnosisOutput {
  overall_summary: string;
  clusters: {
    total?: ClusterDiagnosis;
    verbal?: ClusterDiagnosis;
    verbal_comprehension: ClusterDiagnosis;
    verbal_reasoning: ClusterDiagnosis;
    nonverbal?: ClusterDiagnosis;
    figural_reasoning: ClusterDiagnosis;
    quantitative_reasoning: ClusterDiagnosis;
    [key: string]: ClusterDiagnosis | undefined;
  };
}

export interface StudentSubmission {
  id: string;
  studentId: string;
  studentName: string;
  studentNumber: string;
  sectionId: string;
  classCode?: string;
  status: 'not_started' | 'in_progress' | 'submitted';
  currentQuestionIndex: number;
  answers: Record<string, 'A' | 'B' | 'C' | 'D' | 'E'>;
  submittedAt?: string;
  scores: ClusterScoreBreakdown;
  categories: ClusterCategoryBreakdown;
  analysisStatus: 'not_started' | 'analyzing' | 'ready' | 'error';
  analysisError?: string;
  diagnosis?: DiagnosisOutput;
  analyzedAt?: string;
  analysisModelUsed?: string;
  analysisLatencyMs?: number;
}

export interface AIModelConfig {
  provider: 'gemini' | 'openrouter' | 'custom';
  modelId: string;
  apiKey: string;
  baseUrl?: string;
  temperature: number;
  maxTokens: number;
  timeout: number;
  status: 'connected' | 'not_configured' | 'error';
  lastTested?: string;
  lastError?: string;
  assignedDiagnosis: string;
  assignedPacing: string;
}

export interface AIPromptsConfig {
  diagnosisPrompt: string;
  diagnosisVersion: string;
  pacingPrompt: string;
  pacingVersion: string;
}

export interface PacingRecommendation {
  id: string;
  concept: string;
  evidence: string;
  suggested_action: string;
  rationale: string;
  status: 'pending' | 'approved' | 'modified' | 'rejected';
  modifiedNote?: string;
  decidedAt?: string;
  decidedBy?: string;
}

export interface AuditLogItem {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  actor: string;
}

export interface SystemStats {
  aiCallsCount: number;
  aiSuccessCount: number;
  aiFailureCount: number;
  totalLatencyMs: number;
}

export type LessonNodeStatus = 'locked' | 'available' | 'in_progress' | 'completed';

export interface Lesson {
  id: string;
  sectionId: string;
  title: string;
  description: string;
  code: string; // max 12 lines
  bugLineNumber?: number; // 1-indexed line number if buggy
  correctBlock?: string;
  wrongBlocks?: string[]; // 1 to 3 wrong blocks
  hint?: string;
  position: number;
  branchFromId?: string; // optional branch from a parent node
  openToAll?: boolean;
  createdAt: string;
}

export interface Announcement {
  id: string;
  sectionId: string;
  text: string;
  createdAt: string;
  instructorName: string;
}

export interface TraceStep {
  stepIndex: number; // 0-indexed
  lineNumber: number; // 1-indexed
  lineText: string;
  actionType: 'init' | 'assign' | 'loop_check' | 'loop_body' | 'condition' | 'print' | 'done';
  label: string; // e.g. "INITIALIZE total = 0"
  loopInfo?: {
    currentRound: number;
    totalRounds: number;
    varName: string;
  };
  variables: Record<string, any>;
  changedVar?: string;
  output: string;
}

export type CourseDifficulty = 'Starter' | 'Core' | 'Challenge';

export interface CourseLesson {
  id: string;
  title: string;
  description: string;
  code: string;
  bugLineNumber?: number;
  correctBlock?: string;
  wrongBlocks?: string[];
  hint?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  skillTags: ClusterName[];
  difficulty: CourseDifficulty;
  lessons: CourseLesson[];
  createdAt: string;
}

export interface CourseRecommendationItem {
  course_id: string;
  target_skill: ClusterName;
  reason_for_student: string;
  reason_for_instructor: string;
  priority: number;
  dismissedByStudent?: boolean;
  statusForInstructor?: 'pending' | 'accepted' | 'dismissed' | 'assigned_to_class';
  addedToRoadmap?: boolean;
}

export interface SuggestedTopicToCreate {
  skill: string;
  topic: string;
  why: string;
}

export interface StudentCourseRecommendations {
  studentId: string;
  studentName?: string;
  sectionId?: string;
  recommended_courses: CourseRecommendationItem[];
  no_match_skills: string[];
  suggested_topics_to_create: SuggestedTopicToCreate[];
  status: 'idle' | 'thinking' | 'ready' | 'error';
  error?: string;
  generatedAt?: string;
}

