/**
 * Vizogramm CS Post-Exam Diagnostic Mock Domain Data
 */

export interface CompetencyTopic {
  id: string;
  name: string;
  category: string;
  description: string;
  averageMastery: number; // 0 - 100
  cohortLevel: 1 | 2 | 3 | 4 | 5;
  criticalGapStudents: number;
}

export interface Misconception {
  id: string;
  topicId: string;
  title: string;
  description: string;
  frequency: number; // percentage of cohort affected
  affectedStudentCount: number;
  severity: 'high' | 'medium' | 'low';
  exampleSnippet?: string;
  counterExampleSnippet?: string;
  remedyAction: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  section: string;
  overallScore: number;
  overallMastery: 1 | 2 | 3 | 4 | 5;
  submissionDate: string;
  topicMastery: Record<string, 1 | 2 | 3 | 4 | 5>;
  topMisconceptions: string[];
  status: 'Needs Immediate Review' | 'Developing' | 'On Track' | 'Excelling';
}

export interface AssessmentItem {
  id: string;
  questionNumber: number;
  topicId: string;
  title: string;
  prompt: string;
  codeContext?: string;
  options: {
    id: string;
    text: string;
    misconceptionId?: string;
  }[];
  correctOptionId: string;
  explanation: string;
  difficulty: 'Foundation' | 'Intermediate' | 'Advanced';
}

export interface Assessment {
  id: string;
  code: string;
  title: string;
  course: string;
  term: string;
  status: 'Completed' | 'In Progress' | 'Scheduled';
  totalStudents: number;
  submittedCount: number;
  averageScore: number;
  medianScore: number;
  topics: string[];
  itemsCount: number;
  durationMinutes: number;
  dueDate: string;
}

export interface Recommendation {
  id: string;
  priority: 'Immediate Action' | 'Recommended' | 'Enrichment';
  title: string;
  topicName: string;
  targetCohortSize: number;
  rationale: string;
  suggestedAction: string;
  activityType: 'Code Trace Lab' | 'Concept Refresher' | 'Peer Instruction' | 'Micro-Assessment';
  estimatedDuration: string;
}

export const CS_TOPICS: CompetencyTopic[] = [
  {
    id: 'topic-recursion',
    name: 'Recursive Logic & Call Trees',
    category: 'Control Flow',
    description: 'Base case induction, recursive descent, stack frame allocation, and winding/unwinding mechanisms.',
    averageMastery: 58,
    cohortLevel: 2,
    criticalGapStudents: 21,
  },
  {
    id: 'topic-pointers',
    name: 'Memory Models & Pointer Semantics',
    category: 'Systems & Memory',
    description: 'Stack vs heap storage, pointer dereferencing, reference passing, and memory address arithmetic.',
    averageMastery: 64,
    cohortLevel: 3,
    criticalGapStudents: 16,
  },
  {
    id: 'topic-complexity',
    name: 'Algorithmic Complexity & Invariants',
    category: 'Analysis',
    description: 'Asymptotic growth bounds (O(1), O(n), O(n²)), loop invariants, and nested iteration costs.',
    averageMastery: 72,
    cohortLevel: 4,
    criticalGapStudents: 9,
  },
  {
    id: 'topic-arrays',
    name: 'Array Indexing & Buffer Safety',
    category: 'Data Structures',
    description: 'Zero-indexing conventions, contiguous block layout, boundary preservation, and off-by-one avoidance.',
    averageMastery: 84,
    cohortLevel: 5,
    criticalGapStudents: 4,
  },
  {
    id: 'topic-conditionals',
    name: 'Boolean Logic & Branch Coverage',
    category: 'Control Flow',
    description: 'Short-circuit evaluation, compound predicates, and edge case exhaustive branching.',
    averageMastery: 89,
    cohortLevel: 5,
    criticalGapStudents: 2,
  },
];

export const CS_MISCONCEPTIONS: Misconception[] = [
  {
    id: 'misc-rec-base',
    topicId: 'topic-recursion',
    title: 'Off-by-One Recursion Base Condition',
    description: 'Students terminate at n == 1 instead of n <= 0, causing infinite recursion on negative inputs or missing leaf computations.',
    frequency: 44,
    affectedStudentCount: 21,
    severity: 'high',
    exampleSnippet: `int factorial(int n) {\n  if (n == 1) return 1; // Fails when n == 0 or negative!\n  return n * factorial(n - 1);\n}`,
    counterExampleSnippet: `int factorial(int n) {\n  if (n <= 1) return 1; // Robust guard protecting call tree\n  return n * factorial(n - 1);\n}`,
    remedyAction: 'Assign Step-Through Call Tree visualizer focusing on boundary argument n=0.',
  },
  {
    id: 'misc-ptr-pass',
    topicId: 'topic-pointers',
    title: 'Pass-by-Value Confusion on Pointer Reassignment',
    description: 'Assuming modifying the pointer variable locally in a helper function rebinds the caller pointer in the invoking frame.',
    frequency: 38,
    affectedStudentCount: 18,
    severity: 'high',
    exampleSnippet: `void reallocNode(Node* ptr) {\n  ptr = new Node(); // Modifies local copy, caller unaffected!\n}`,
    counterExampleSnippet: `void reallocNode(Node*& ptr) { // Or Node** double pointer\n  ptr = new Node();\n}`,
    remedyAction: 'Memory diagram trace showing stack frame parameter passing vs heap mutation.',
  },
  {
    id: 'misc-rec-accum',
    topicId: 'topic-recursion',
    title: 'Premature Accumulator Overwrite in Helper',
    description: 'Reinitializing the accumulator inside recursive frames instead of passing forward through parameter registers.',
    frequency: 29,
    affectedStudentCount: 14,
    severity: 'medium',
    remedyAction: 'Tail-recursion transformation practice with explicitly declared accumulator arguments.',
  },
  {
    id: 'misc-ptr-null',
    topicId: 'topic-pointers',
    title: 'Unchecked Null Dereference in Linked Structures',
    description: 'Accessing next->val without verifying curr != nullptr prior to compound traversal.',
    frequency: 25,
    affectedStudentCount: 12,
    severity: 'medium',
    remedyAction: 'Short-circuit evaluation rule checklist for pointer traversal chains.',
  },
];

export const ASSESSMENTS: Assessment[] = [
  {
    id: 'exam-cs101-m1',
    code: 'CS101-MID1',
    title: 'Midterm 1: Foundations of Memory & Control Flow',
    course: 'CS 101 — Intro to Computer Science',
    term: 'Fall 2026',
    status: 'Completed',
    totalStudents: 48,
    submittedCount: 48,
    averageScore: 73.4,
    medianScore: 76.0,
    topics: ['topic-recursion', 'topic-pointers', 'topic-complexity', 'topic-arrays', 'topic-conditionals'],
    itemsCount: 12,
    durationMinutes: 75,
    dueDate: 'Oct 10, 2026',
  },
  {
    id: 'exam-cs101-diag2',
    code: 'CS101-DIAG2',
    title: 'Diagnostic Check 2: Recursive Descent & Pointers',
    course: 'CS 101 — Intro to Computer Science',
    term: 'Fall 2026',
    status: 'In Progress',
    totalStudents: 48,
    submittedCount: 34,
    averageScore: 66.8,
    medianScore: 69.0,
    topics: ['topic-recursion', 'topic-pointers'],
    itemsCount: 8,
    durationMinutes: 45,
    dueDate: 'Oct 18, 2026',
  },
  {
    id: 'exam-cs102-pre',
    code: 'CS102-PRE',
    title: 'Data Structures Readiness Diagnostic',
    course: 'CS 102 — Data Structures',
    term: 'Fall 2026',
    status: 'Scheduled',
    totalStudents: 40,
    submittedCount: 0,
    averageScore: 0,
    medianScore: 0,
    topics: ['topic-complexity', 'topic-pointers', 'topic-arrays'],
    itemsCount: 10,
    durationMinutes: 60,
    dueDate: 'Nov 02, 2026',
  },
];

export const STUDENT_ROSTER: Student[] = [
  {
    id: 'stu-alex-chen',
    name: 'Alex Chen',
    email: 'achen@univ.edu',
    section: 'Section A (Prof. Vance)',
    overallScore: 68,
    overallMastery: 2,
    submissionDate: 'Oct 10, 2026 at 14:22',
    topicMastery: {
      'topic-recursion': 2,
      'topic-pointers': 2,
      'topic-complexity': 4,
      'topic-arrays': 5,
      'topic-conditionals': 5,
    },
    topMisconceptions: ['misc-rec-base', 'misc-ptr-pass'],
    status: 'Needs Immediate Review',
  },
  {
    id: 'stu-maya-patel',
    name: 'Maya Patel',
    email: 'mpatel@univ.edu',
    section: 'Section A (Prof. Vance)',
    overallScore: 92,
    overallMastery: 5,
    submissionDate: 'Oct 10, 2026 at 13:58',
    topicMastery: {
      'topic-recursion': 5,
      'topic-pointers': 4,
      'topic-complexity': 5,
      'topic-arrays': 5,
      'topic-conditionals': 5,
    },
    topMisconceptions: [],
    status: 'Excelling',
  },
  {
    id: 'stu-marcus-vance',
    name: 'Marcus Vance Jr.',
    email: 'mvance@univ.edu',
    section: 'Section B (Prof. Alvarez)',
    overallScore: 61,
    overallMastery: 2,
    submissionDate: 'Oct 10, 2026 at 15:10',
    topicMastery: {
      'topic-recursion': 1,
      'topic-pointers': 2,
      'topic-complexity': 3,
      'topic-arrays': 4,
      'topic-conditionals': 4,
    },
    topMisconceptions: ['misc-rec-base', 'misc-rec-accum'],
    status: 'Needs Immediate Review',
  },
  {
    id: 'stu-elena-rostova',
    name: 'Elena Rostova',
    email: 'erostova@univ.edu',
    section: 'Section A (Prof. Vance)',
    overallScore: 78,
    overallMastery: 4,
    submissionDate: 'Oct 10, 2026 at 14:45',
    topicMastery: {
      'topic-recursion': 3,
      'topic-pointers': 3,
      'topic-complexity': 4,
      'topic-arrays': 5,
      'topic-conditionals': 5,
    },
    topMisconceptions: ['misc-ptr-pass'],
    status: 'Developing',
  },
  {
    id: 'stu-jordan-lee',
    name: 'Jordan Lee',
    email: 'jlee@univ.edu',
    section: 'Section B (Prof. Alvarez)',
    overallScore: 84,
    overallMastery: 4,
    submissionDate: 'Oct 10, 2026 at 14:02',
    topicMastery: {
      'topic-recursion': 4,
      'topic-pointers': 4,
      'topic-complexity': 4,
      'topic-arrays': 5,
      'topic-conditionals': 5,
    },
    topMisconceptions: [],
    status: 'On Track',
  },
  {
    id: 'stu-priya-sharma',
    name: 'Priya Sharma',
    email: 'psharma@univ.edu',
    section: 'Section A (Prof. Vance)',
    overallScore: 54,
    overallMastery: 1,
    submissionDate: 'Oct 10, 2026 at 15:12',
    topicMastery: {
      'topic-recursion': 1,
      'topic-pointers': 1,
      'topic-complexity': 2,
      'topic-arrays': 3,
      'topic-conditionals': 4,
    },
    topMisconceptions: ['misc-rec-base', 'misc-ptr-pass', 'misc-ptr-null'],
    status: 'Needs Immediate Review',
  },
];

export const CURRENT_STUDENT: Student = STUDENT_ROSTER[0]; // Alex Chen

export const SAMPLE_QUESTIONS: AssessmentItem[] = [
  {
    id: 'q1',
    questionNumber: 1,
    topicId: 'topic-recursion',
    title: 'Recursive Call Tree & Base Case Termination',
    prompt: 'Examine the following recursive procedure calculating powers of two. For which parameter value does this function fail to produce a defined result or enter unbounded execution?',
    codeContext: `int powerOfTwo(int exp) {\n    if (exp == 1) {\n        return 2;\n    }\n    return 2 * powerOfTwo(exp - 1);\n}`,
    options: [
      {
        id: 'opt-a',
        text: 'exp = 0, because the base case checks exp == 1 and skips zero, decrementing indefinitely into negative call stack frames.',
        misconceptionId: 'misc-rec-base',
      },
      {
        id: 'opt-b',
        text: 'exp = 2, because 2 is even and recursion cannot descend evenly.',
      },
      {
        id: 'opt-c',
        text: 'exp = 16, because integer stack limits trigger before reaching single digits.',
      },
      {
        id: 'opt-d',
        text: 'None; the function correctly handles all integer inputs.',
      },
    ],
    correctOptionId: 'opt-a',
    explanation: 'When exp == 0 is supplied, the condition exp == 1 evaluates to false. The execution branches into powerOfTwo(-1), then powerOfTwo(-2), never satisfying the base test and triggering a Stack Overflow.',
    difficulty: 'Foundation',
  },
  {
    id: 'q2',
    questionNumber: 2,
    topicId: 'topic-pointers',
    title: 'Parameter Rebinding vs Caller State',
    prompt: 'A student writes a utility function intended to re-allocate an empty list head to a newly created node. Consider the snippet below. What occurs when caller calls initList(head)?',
    codeContext: `struct Node { int val; Node* next; };\n\nvoid initList(Node* head) {\n    head = (Node*)malloc(sizeof(Node));\n    head->val = 42;\n    head->next = NULL;\n}\n\nint main() {\n    Node* myHead = NULL;\n    initList(myHead);\n    printf("%d", myHead->val); // Line 12\n}`,
    options: [
      {
        id: 'opt-a',
        text: 'Line 12 prints 42, because head points to the newly allocated heap block.',
      },
      {
        id: 'opt-b',
        text: 'Line 12 triggers undefined behavior / segmentation fault because myHead remains NULL (passed by value).',
        misconceptionId: 'misc-ptr-pass',
      },
      {
        id: 'opt-c',
        text: 'The program fails to compile because malloc cannot be invoked inside helper procedures.',
      },
      {
        id: 'opt-d',
        text: 'Line 12 prints 0 due to default zero-initialization of structs.',
      },
    ],
    correctOptionId: 'opt-b',
    explanation: 'Parameters in C/C++ are passed by value. The parameter head receives a copy of the pointer myHead (NULL). Modifying head reassigns only the local frame copy; myHead in main remains NULL, so dereferencing it causes a segmentation fault.',
    difficulty: 'Intermediate',
  },
  {
    id: 'q3',
    questionNumber: 3,
    topicId: 'topic-complexity',
    title: 'Nested Loop Asymptotic Complexity',
    prompt: 'Determine the worst-case asymptotic time complexity of the following algorithm over an array of size n.',
    codeContext: `void processMatrix(int arr[], int n) {\n    for (int i = 0; i < n; i++) {\n        for (int j = i; j < n; j += 2) {\n            printf("%d", arr[j]);\n        }\n    }\n}`,
    options: [
      {
        id: 'opt-a',
        text: 'O(n²), because the outer loop runs n times and inner loop executes (n - i)/2 times, summing to ~n²/4 steps.',
      },
      {
        id: 'opt-b',
        text: 'O(n log n), because the stride j += 2 halves the execution window.',
      },
      {
        id: 'opt-c',
        text: 'O(n), because the inner loop terminates quickly.',
      },
      {
        id: 'opt-d',
        text: 'O(1), constant time.',
      },
    ],
    correctOptionId: 'opt-a',
    explanation: 'Constant step increments (such as j += 2) alter only the constant factor (1/2), not the asymptotic order. The summation sum_{i=0}^{n-1} (n - i)/2 is proportional to n², yielding O(n²).',
    difficulty: 'Intermediate',
  },
];

export const RECOMMENDATIONS: Recommendation[] = [
  {
    id: 'rec-1',
    priority: 'Immediate Action',
    title: 'Visual Call-Stack Framing for Boundary Recursion',
    topicName: 'Recursive Logic & Call Trees',
    targetCohortSize: 21,
    rationale: '44% of students exhibited the off-by-one base condition misconception on Midterm Question 1, repeatedly failing to trace n <= 0 boundary frames.',
    suggestedAction: 'Deploy interactive step-by-step call tree simulator in the next lab session. Have students draw activation frames before writing code.',
    activityType: 'Code Trace Lab',
    estimatedDuration: '25 min lab exercise',
  },
  {
    id: 'rec-2',
    priority: 'Immediate Action',
    title: 'Pointer Pass-by-Value vs Address Mutation Diagnostic',
    topicName: 'Memory Models & Pointer Semantics',
    targetCohortSize: 18,
    rationale: '38% of submissions attempted caller pointer modification through single pointer parameters without double pointer or reference semantics.',
    suggestedAction: 'Run 10-minute peer instruction exercise contrasting stack-pointer frames vs heap blocks with live memory visualizer.',
    activityType: 'Peer Instruction',
    estimatedDuration: '15 min lecture module',
  },
  {
    id: 'rec-3',
    priority: 'Recommended',
    title: 'Asymptotic Stride Invariance Micro-Module',
    topicName: 'Algorithmic Complexity & Invariants',
    targetCohortSize: 14,
    rationale: '29% of cohort conflated constant-stride loop increments (j += 2) with logarithmic division (j /= 2).',
    suggestedAction: 'Provide targeted 3-problem diagnostic set distinguishing linear decrements from geometric dividing steps.',
    activityType: 'Micro-Assessment',
    estimatedDuration: '10 min homework review',
  },
];
