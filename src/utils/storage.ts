import {
  AdminProfileData,
  AIModelConfig,
  AIPromptsConfig,
  Announcement,
  AuditLogItem,
  Course,
  CourseLesson,
  CourseRecommendationItem,
  InstructorProfileData,
  Lesson,
  PacingRecommendation,
  Section,
  StudentCourseRecommendations,
  StudentProfileData,
  StudentSubmission,
  SystemStats,
  User,
} from '../types';

const STORAGE_KEYS = {
  CURRENT_USER: 'vizogramm_current_user',
  USERS: 'vizogramm_users',
  STUDENT_PROFILES: 'vizogramm_student_profiles',
  INSTRUCTOR_PROFILES: 'vizogramm_instructor_profiles',
  SECTIONS: 'vizogramm_sections',
  SUBMISSIONS: 'vizogramm_submissions',
  AI_MODEL: 'vizogramm_ai_model',
  AI_PROMPTS: 'vizogramm_ai_prompts',
  RECOMMENDATIONS: 'vizogramm_recommendations',
  AUDIT_LOG: 'vizogramm_audit_log',
  SYSTEM_STATS: 'vizogramm_system_stats',
  DEMO_MODE: 'vizogramm_demo_mode',
  LESSONS: 'vizogramm_lessons',
  ANNOUNCEMENTS: 'vizogramm_announcements',
  STUDENT_CLASSROOMS: 'vizogramm_student_classrooms',
  STUDENT_PROGRESS: 'vizogramm_student_progress',
  COURSES: 'vizogramm_courses',
  COURSE_RECOMMENDATIONS: 'vizogramm_course_recommendations',
};

export const DEFAULT_DIAGNOSIS_PROMPT = `You are an expert cognitive diagnostic assistant evaluating first-year computing students on an adapted baseline reasoning assessment (OLSAT-style adaptation).
CRITICAL RULES:
1. The AI NEVER grades, NEVER generates solutions, and NEVER decides academic outcomes.
2. Provide diagnostic hypotheses for each of the 7 clusters: Total, Verbal, Verbal Comprehension, Verbal Reasoning, Nonverbal, Figural Reasoning, Quantitative Reasoning.
3. For each cluster output:
   - "status": "mastered" | "shaky" | "absent"
   - "cause": "careless_slip" | "misconception" | "never_learned" | "mixed"
   - "reason": exactly ONE short, objective sentence citing specific item IDs (e.g. "Struggled with multi-step premise deduction on VR-04 and VR-07").
4. "overall_summary": exactly TWO sentences describing the student's cognitive baseline pattern in non-judgmental, descriptive language without quoting numerical scores or percentile numbers.
5. Return ONLY a valid JSON object matching the required schema.`;

export const DEFAULT_PACING_PROMPT = `You are an instructional design advisor analyzing cohort diagnostic reasoning patterns for a first-year computing course.
CRITICAL RULES:
1. Every recommendation is an "AI suggestion. Instructor decides."
2. The link from a reasoning cluster to a programming topic is a hypothesis for instructor review.
3. Analyze the provided class heatmap distributions and error cause frequencies.
4. Return 3 to 5 actionable cohort pacing recommendations.
5. Each recommendation must contain:
   - "id": unique string e.g. "REC-01"
   - "concept": target computing topic (e.g., "Nested Conditionals & Boolean Logic", "Loop Invariants & Iteration", "Memory Allocation & Variables")
   - "evidence": brief count-based evidence from the cohort diagnosis
   - "suggested_action": specific instructional pacing modification (e.g., "Dedicate 30 mins to tracing state tables before writing conditional statements")
   - "rationale": why this cognitive baseline predicts difficulty in this specific computing topic.
6. Return strictly valid JSON with a "recommendations" array.`;

export const DEFAULT_AI_MODEL_CONFIG: AIModelConfig = {
  provider: 'gemini',
  modelId: 'gemini-2.5-flash',
  apiKey: '',
  baseUrl: '',
  temperature: 0.1,
  maxTokens: 2048,
  timeout: 25000,
  status: 'not_configured',
  assignedDiagnosis: 'primary',
  assignedPacing: 'primary',
};

export const DEFAULT_AI_PROMPTS: AIPromptsConfig = {
  diagnosisPrompt: DEFAULT_DIAGNOSIS_PROMPT,
  diagnosisVersion: '1.2.0',
  pacingPrompt: DEFAULT_PACING_PROMPT,
  pacingVersion: '1.1.0',
};

// Safe localStorage helpers
function getFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item);
  } catch (err) {
    console.error(`Error reading ${key} from storage:`, err);
    return fallback;
  }
}

function setToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error writing ${key} to storage:`, err);
  }
}

export const Storage = {
  // Current logged in user
  getCurrentUser(): User | null {
    return getFromStorage<User | null>(STORAGE_KEYS.CURRENT_USER, null);
  },
  setCurrentUser(user: User | null): void {
    setToStorage(STORAGE_KEYS.CURRENT_USER, user);
  },

  // Users list
  getUsers(): User[] {
    return getFromStorage<User[]>(STORAGE_KEYS.USERS, []);
  },
  saveUser(user: User): void {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === user.id);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    setToStorage(STORAGE_KEYS.USERS, users);
  },
  updateUser(id: string, updates: Partial<User>): void {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === id);
    if (index >= 0) {
      users[index] = { ...users[index], ...updates };
      setToStorage(STORAGE_KEYS.USERS, users);
      const current = this.getCurrentUser();
      if (current && current.id === id) {
        this.setCurrentUser(users[index]);
      }
    }
  },

  // Student Profiles
  getStudentProfiles(): Record<string, StudentProfileData> {
    return getFromStorage<Record<string, StudentProfileData>>(STORAGE_KEYS.STUDENT_PROFILES, {});
  },
  getStudentProfile(userId: string): StudentProfileData | null {
    const profiles = this.getStudentProfiles();
    return profiles[userId] || null;
  },
  saveStudentProfile(profile: StudentProfileData): void {
    const profiles = this.getStudentProfiles();
    profiles[profile.userId] = profile;
    setToStorage(STORAGE_KEYS.STUDENT_PROFILES, profiles);
  },

  // Instructor Profile (remembered in browser storage to skip setup on return)
  getInstructorProfile(): InstructorProfileData | null {
    return getFromStorage<InstructorProfileData | null>('vizogramm_active_instructor', null);
  },
  saveInstructorProfile(profile: InstructorProfileData): void {
    setToStorage('vizogramm_active_instructor', profile);
  },

  // Admin Profile (remembered in browser storage)
  getAdminProfile(): AdminProfileData | null {
    return getFromStorage<AdminProfileData | null>('vizogramm_active_admin', null);
  },
  saveAdminProfile(profile: AdminProfileData): void {
    setToStorage('vizogramm_active_admin', profile);
  },

  // Sections
  getSections(): Section[] {
    return getFromStorage<Section[]>(STORAGE_KEYS.SECTIONS, []);
  },
  saveSection(section: Section): void {
    const sections = this.getSections();
    const index = sections.findIndex((s) => s.id === section.id);
    if (index >= 0) {
      sections[index] = section;
    } else {
      sections.push(section);
    }
    setToStorage(STORAGE_KEYS.SECTIONS, sections);
  },

  // Submissions
  getSubmissions(): StudentSubmission[] {
    return getFromStorage<StudentSubmission[]>(STORAGE_KEYS.SUBMISSIONS, []);
  },
  getSubmissionByStudent(studentId: string): StudentSubmission | null {
    const submissions = this.getSubmissions();
    return submissions.find((s) => s.studentId === studentId) || null;
  },
  saveSubmission(submission: StudentSubmission): void {
    const submissions = this.getSubmissions();
    const index = submissions.findIndex((s) => s.id === submission.id);
    if (index >= 0) {
      submissions[index] = submission;
    } else {
      submissions.push(submission);
    }
    setToStorage(STORAGE_KEYS.SUBMISSIONS, submissions);
  },

  // AI Model Settings
  getAIModelConfig(): AIModelConfig {
    return getFromStorage<AIModelConfig>(STORAGE_KEYS.AI_MODEL, DEFAULT_AI_MODEL_CONFIG);
  },
  saveAIModelConfig(config: AIModelConfig): void {
    setToStorage(STORAGE_KEYS.AI_MODEL, config);
  },

  // AI Prompts
  getAIPrompts(): AIPromptsConfig {
    return getFromStorage<AIPromptsConfig>(STORAGE_KEYS.AI_PROMPTS, DEFAULT_AI_PROMPTS);
  },
  saveAIPrompts(prompts: AIPromptsConfig): void {
    setToStorage(STORAGE_KEYS.AI_PROMPTS, prompts);
  },

  // Pacing Recommendations
  getRecommendations(): PacingRecommendation[] {
    return getFromStorage<PacingRecommendation[]>(STORAGE_KEYS.RECOMMENDATIONS, []);
  },
  saveRecommendations(recs: PacingRecommendation[]): void {
    setToStorage(STORAGE_KEYS.RECOMMENDATIONS, recs);
  },
  updateRecommendation(id: string, updates: Partial<PacingRecommendation>): void {
    const recs = this.getRecommendations();
    const idx = recs.findIndex((r) => r.id === id);
    if (idx >= 0) {
      recs[idx] = { ...recs[idx], ...updates };
      setToStorage(STORAGE_KEYS.RECOMMENDATIONS, recs);
    }
  },

  // Audit Log
  getAuditLog(): AuditLogItem[] {
    return getFromStorage<AuditLogItem[]>(STORAGE_KEYS.AUDIT_LOG, []);
  },
  addAuditLog(action: string, details: string, actor: string = 'System Admin'): void {
    const log = this.getAuditLog();
    const entry: AuditLogItem = {
      id: 'LOG-' + Math.random().toString(36).substring(2, 9),
      action,
      details,
      timestamp: new Date().toISOString(),
      actor,
    };
    log.unshift(entry);
    setToStorage(STORAGE_KEYS.AUDIT_LOG, log.slice(0, 100)); // Keep latest 100
  },

  // System Stats
  getSystemStats(): SystemStats {
    return getFromStorage<SystemStats>(STORAGE_KEYS.SYSTEM_STATS, {
      aiCallsCount: 0,
      aiSuccessCount: 0,
      aiFailureCount: 0,
      totalLatencyMs: 0,
    });
  },
  recordAiCall(success: boolean, latencyMs: number): void {
    const stats = this.getSystemStats();
    stats.aiCallsCount += 1;
    if (success) {
      stats.aiSuccessCount += 1;
    } else {
      stats.aiFailureCount += 1;
    }
    stats.totalLatencyMs += latencyMs;
    setToStorage(STORAGE_KEYS.SYSTEM_STATS, stats);
  },

  // Demo mode
  getDemoMode(): boolean {
    return getFromStorage<boolean>(STORAGE_KEYS.DEMO_MODE, true);
  },
  setDemoMode(enabled: boolean): void {
    setToStorage(STORAGE_KEYS.DEMO_MODE, enabled);
  },

  // Lessons
  getLessons(sectionId?: string): Lesson[] {
    const all = getFromStorage<Lesson[]>(STORAGE_KEYS.LESSONS, []);
    if (sectionId) {
      return all
        .filter((l) => l.sectionId === sectionId)
        .sort((a, b) => a.position - b.position);
    }
    return all;
  },
  saveLesson(lesson: Lesson): void {
    const all = this.getLessons();
    const idx = all.findIndex((l) => l.id === lesson.id);
    if (idx >= 0) {
      all[idx] = lesson;
    } else {
      all.push(lesson);
    }
    setToStorage(STORAGE_KEYS.LESSONS, all);
  },
  deleteLesson(lessonId: string): void {
    const all = this.getLessons().filter((l) => l.id !== lessonId);
    setToStorage(STORAGE_KEYS.LESSONS, all);
  },
  reorderLessons(sectionId: string, lessonIds: string[]): void {
    const all = this.getLessons();
    const other = all.filter((l) => l.sectionId !== sectionId);
    const target = all.filter((l) => l.sectionId === sectionId);
    
    lessonIds.forEach((id, index) => {
      const item = target.find((l) => l.id === id);
      if (item) {
        item.position = index + 1;
      }
    });
    setToStorage(STORAGE_KEYS.LESSONS, [...other, ...target]);
  },

  // Announcements
  getAnnouncements(sectionId?: string): Announcement[] {
    const all = getFromStorage<Announcement[]>(STORAGE_KEYS.ANNOUNCEMENTS, []);
    if (sectionId) {
      return all
        .filter((a) => a.sectionId === sectionId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return all;
  },
  saveAnnouncement(announcement: Announcement): void {
    const all = this.getAnnouncements();
    all.unshift(announcement);
    setToStorage(STORAGE_KEYS.ANNOUNCEMENTS, all);
  },

  // Student Enrolled Classrooms
  getStudentJoinedClassrooms(): string[] {
    return getFromStorage<string[]>(STORAGE_KEYS.STUDENT_CLASSROOMS, []);
  },
  joinClassroom(sectionId: string): void {
    const current = this.getStudentJoinedClassrooms();
    if (!current.includes(sectionId)) {
      current.push(sectionId);
      setToStorage(STORAGE_KEYS.STUDENT_CLASSROOMS, current);
    }
  },

  // Student Progress per section
  getStudentProgress(sectionId: string): { completedLessonIds: string[]; inProgressLessonIds: string[] } {
    const allProgress = getFromStorage<Record<string, { completedLessonIds: string[]; inProgressLessonIds: string[] }>>(
      STORAGE_KEYS.STUDENT_PROGRESS,
      {}
    );
    return allProgress[sectionId] || { completedLessonIds: [], inProgressLessonIds: [] };
  },
  markLessonComplete(sectionId: string, lessonId: string): void {
    const allProgress = getFromStorage<Record<string, { completedLessonIds: string[]; inProgressLessonIds: string[] }>>(
      STORAGE_KEYS.STUDENT_PROGRESS,
      {}
    );
    const current = allProgress[sectionId] || { completedLessonIds: [], inProgressLessonIds: [] };
    if (!current.completedLessonIds.includes(lessonId)) {
      current.completedLessonIds.push(lessonId);
    }
    // Remove from in-progress if it was there
    current.inProgressLessonIds = current.inProgressLessonIds.filter((id) => id !== lessonId);
    allProgress[sectionId] = current;
    setToStorage(STORAGE_KEYS.STUDENT_PROGRESS, allProgress);
  },
  markLessonInProgress(sectionId: string, lessonId: string): void {
    const allProgress = getFromStorage<Record<string, { completedLessonIds: string[]; inProgressLessonIds: string[] }>>(
      STORAGE_KEYS.STUDENT_PROGRESS,
      {}
    );
    const current = allProgress[sectionId] || { completedLessonIds: [], inProgressLessonIds: [] };
    if (!current.completedLessonIds.includes(lessonId) && !current.inProgressLessonIds.includes(lessonId)) {
      current.inProgressLessonIds.push(lessonId);
    }
    allProgress[sectionId] = current;
    setToStorage(STORAGE_KEYS.STUDENT_PROGRESS, allProgress);
  },

  // Courses (starts BLANK)
  getCourses(): Course[] {
    return getFromStorage<Course[]>(STORAGE_KEYS.COURSES, []);
  },
  getCourse(id: string): Course | null {
    const courses = this.getCourses();
    return courses.find((c) => c.id === id) || null;
  },
  saveCourse(course: Course): void {
    const courses = this.getCourses();
    const idx = courses.findIndex((c) => c.id === course.id);
    if (idx >= 0) {
      courses[idx] = course;
    } else {
      courses.push(course);
    }
    setToStorage(STORAGE_KEYS.COURSES, courses);
  },
  saveCourses(coursesToAdd: Course[]): void {
    const existing = this.getCourses();
    const map = new Map<string, Course>();
    existing.forEach((c) => map.set(c.id, c));
    coursesToAdd.forEach((c) => map.set(c.id, c));
    setToStorage(STORAGE_KEYS.COURSES, Array.from(map.values()));
  },
  deleteCourse(id: string): void {
    const courses = this.getCourses().filter((c) => c.id !== id);
    setToStorage(STORAGE_KEYS.COURSES, courses);
  },

  // Course Recommendations per student
  getCourseRecommendations(): Record<string, StudentCourseRecommendations> {
    return getFromStorage<Record<string, StudentCourseRecommendations>>(
      STORAGE_KEYS.COURSE_RECOMMENDATIONS,
      {}
    );
  },
  getStudentCourseRecommendation(studentId: string): StudentCourseRecommendations | null {
    const all = this.getCourseRecommendations();
    return all[studentId] || null;
  },
  saveStudentCourseRecommendation(rec: StudentCourseRecommendations): void {
    const all = this.getCourseRecommendations();
    all[rec.studentId] = rec;
    setToStorage(STORAGE_KEYS.COURSE_RECOMMENDATIONS, all);
  },
  dismissStudentRecommendation(studentId: string, courseId: string): void {
    const all = this.getCourseRecommendations();
    const studentRec = all[studentId];
    if (studentRec) {
      studentRec.recommended_courses = studentRec.recommended_courses.map((item) =>
        item.course_id === courseId ? { ...item, dismissedByStudent: true } : item
      );
      all[studentId] = studentRec;
      setToStorage(STORAGE_KEYS.COURSE_RECOMMENDATIONS, all);
    }
  },
  updateInstructorRecommendationStatus(
    studentId: string,
    courseId: string,
    status: 'accepted' | 'dismissed' | 'assigned_to_class'
  ): void {
    const all = this.getCourseRecommendations();
    const studentRec = all[studentId];
    if (studentRec) {
      studentRec.recommended_courses = studentRec.recommended_courses.map((item) =>
        item.course_id === courseId ? { ...item, statusForInstructor: status } : item
      );
      all[studentId] = studentRec;
      setToStorage(STORAGE_KEYS.COURSE_RECOMMENDATIONS, all);
    }
  },
  addCourseToRoadmap(
    sectionId: string,
    courseId: string,
    studentId?: string,
    forWholeClass = false
  ): boolean {
    const course = this.getCourse(courseId);
    if (!course) return false;

    const currentLessons = this.getLessons(sectionId);
    let addedCount = 0;

    course.lessons.forEach((cl, idx) => {
      // Check if lesson with this title/code already exists in section
      const alreadyExists = currentLessons.some(
        (l) => l.title === `${course.title}: ${cl.title}` || l.title === cl.title
      );
      if (!alreadyExists) {
        const newLesson: Lesson = {
          id: `les_c_${course.id}_${cl.id || idx}`,
          sectionId,
          title: `${course.title}: ${cl.title}`,
          description: cl.description,
          code: cl.code,
          bugLineNumber: cl.bugLineNumber,
          correctBlock: cl.correctBlock,
          wrongBlocks: cl.wrongBlocks,
          hint: cl.hint || 'Carefully step through each line of code.',
          position: currentLessons.length + 1 + addedCount,
          openToAll: true, // Mark Available immediately
          createdAt: new Date().toISOString(),
        };
        this.saveLesson(newLesson);
        addedCount++;
      }
    });

    // Update recommendation status if studentId provided
    if (studentId) {
      const all = this.getCourseRecommendations();
      const studentRec = all[studentId];
      if (studentRec) {
        studentRec.recommended_courses = studentRec.recommended_courses.map((item) =>
          item.course_id === courseId
            ? {
                ...item,
                addedToRoadmap: true,
                statusForInstructor: forWholeClass ? 'assigned_to_class' : 'accepted',
              }
            : item
        );
        all[studentId] = studentRec;
        setToStorage(STORAGE_KEYS.COURSE_RECOMMENDATIONS, all);
      }
    }

    if (forWholeClass) {
      // Also update for any other students that had this course recommended
      const all = this.getCourseRecommendations();
      Object.keys(all).forEach((sId) => {
        const sRec = all[sId];
        if (sRec) {
          sRec.recommended_courses = sRec.recommended_courses.map((item) =>
            item.course_id === courseId
              ? {
                  ...item,
                  addedToRoadmap: true,
                  statusForInstructor: 'assigned_to_class',
                }
              : item
          );
        }
      });
      setToStorage(STORAGE_KEYS.COURSE_RECOMMENDATIONS, all);
    }

    return true;
  },

  // Reset demo data:
  // "clears all instructors, students, submissions, profiles, recommendations, and the decision log; keeps the admin account and AI model settings."
  resetDemoData(): void {
    const aiConfig = this.getAIModelConfig();
    const aiPrompts = this.getAIPrompts();
    const adminProfile = this.getAdminProfile();

    localStorage.removeItem(STORAGE_KEYS.STUDENT_PROFILES);
    localStorage.removeItem('vizogramm_active_instructor');
    localStorage.removeItem(STORAGE_KEYS.SECTIONS);
    localStorage.removeItem(STORAGE_KEYS.SUBMISSIONS);
    localStorage.removeItem(STORAGE_KEYS.RECOMMENDATIONS);
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.LESSONS);
    localStorage.removeItem(STORAGE_KEYS.ANNOUNCEMENTS);
    localStorage.removeItem(STORAGE_KEYS.STUDENT_CLASSROOMS);
    localStorage.removeItem(STORAGE_KEYS.STUDENT_PROGRESS);
    localStorage.removeItem(STORAGE_KEYS.COURSES);
    localStorage.removeItem(STORAGE_KEYS.COURSE_RECOMMENDATIONS);

    setToStorage(STORAGE_KEYS.AI_MODEL, aiConfig);
    setToStorage(STORAGE_KEYS.AI_PROMPTS, aiPrompts);
    if (adminProfile) {
      setToStorage('vizogramm_active_admin', adminProfile);
    }
  },
};
