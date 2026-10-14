import { ITEM_BANK } from '../data/itemBank';
import {
  AIModelConfig,
  ClusterCategoryBreakdown,
  ClusterScoreBreakdown,
  Course,
  CourseRecommendationItem,
  DiagnosisOutput,
  PacingRecommendation,
  StudentCourseRecommendations,
  StudentSubmission,
} from '../types';
import { Storage } from './storage';

export interface TestConnectionResult {
  success: boolean;
  message?: string;
  error?: string;
  latencyMs: number;
}

export async function testAiModelConnection(config: AIModelConfig): Promise<TestConnectionResult> {
  const startTime = Date.now();
  try {
    const res = await fetch('/api/ai/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });

    const data = await res.json();
    const latencyMs = data.latencyMs ?? (Date.now() - startTime);

    if (res.ok && data.success) {
      Storage.recordAiCall(true, latencyMs);
      return {
        success: true,
        message: data.message || 'Connection verified successfully.',
        latencyMs,
      };
    } else {
      Storage.recordAiCall(false, latencyMs);
      return {
        success: false,
        error: data.error || `HTTP ${res.status} connection test failed`,
        latencyMs,
      };
    }
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    Storage.recordAiCall(false, latencyMs);
    return {
      success: false,
      error: err.message || 'Network request failed',
      latencyMs,
    };
  }
}

// Generate diagnosis for a student
export async function runStudentDiagnosis(
  studentName: string,
  answers: Record<string, string>,
  scores: ClusterScoreBreakdown,
  categories: ClusterCategoryBreakdown,
  isRetry = false
): Promise<{ success: boolean; data?: DiagnosisOutput; error?: string; latencyMs: number; model?: string }> {
  const config = Storage.getAIModelConfig();
  const prompts = Storage.getAIPrompts();

  if (!config || config.status !== 'connected') {
    return {
      success: false,
      error: 'No AI model configured. Contact the System Administrator.',
      latencyMs: 0,
    };
  }

  // Build input payload
  const itemSummary = ITEM_BANK.map((item) => {
    const chosen = answers[item.id] || 'None';
    const isCorrect = chosen === item.key;
    const errorTag = !isCorrect ? item.wrongTags[chosen as 'A' | 'B' | 'C' | 'D' | 'E'] || 'unclassified' : null;
    return {
      id: item.id,
      cluster: item.cluster,
      type: item.type,
      chosen,
      key: item.key,
      isCorrect,
      errorTag,
    };
  });

  const promptPayload = `Analyze this student's baseline assessment responses.
STUDENT IDENTIFIER: [Confidential ID]
CLUSTER RAW SCORES:
- Total: ${scores.total}/24 (${categories.total})
- Verbal: ${scores.verbal}/12 (${categories.verbal})
  * Verbal Comprehension: ${scores.verbalComprehension}/4 (${categories.verbalComprehension})
  * Verbal Reasoning: ${scores.verbalReasoning}/8 (${categories.verbalReasoning})
- Nonverbal: ${scores.nonverbal}/12 (${categories.nonverbal})
  * Figural Reasoning: ${scores.figuralReasoning}/6 (${categories.figuralReasoning})
  * Quantitative Reasoning: ${scores.quantitativeReasoning}/6 (${categories.quantitativeReasoning})

ITEM-LEVEL RESPONSES & ERROR TAGS:
${JSON.stringify(itemSummary, null, 2)}

REQUIRED STRICT JSON OUTPUT FORMAT:
{
  "overall_summary": "Two sentences describing the student's baseline cognitive pattern in non-judgmental, descriptive language without quoting numbers or percentiles.",
  "clusters": {
    "total": { "status": "mastered" | "shaky" | "absent", "cause": "careless_slip" | "misconception" | "never_learned" | "mixed", "reason": "One short sentence citing item IDs." },
    "verbal": { "status": "mastered" | "shaky" | "absent", "cause": "careless_slip" | "misconception" | "never_learned" | "mixed", "reason": "One short sentence citing item IDs." },
    "verbal_comprehension": { "status": "mastered" | "shaky" | "absent", "cause": "careless_slip" | "misconception" | "never_learned" | "mixed", "reason": "One short sentence citing item IDs." },
    "verbal_reasoning": { "status": "mastered" | "shaky" | "absent", "cause": "careless_slip" | "misconception" | "never_learned" | "mixed", "reason": "One short sentence citing item IDs." },
    "nonverbal": { "status": "mastered" | "shaky" | "absent", "cause": "careless_slip" | "misconception" | "never_learned" | "mixed", "reason": "One short sentence citing item IDs." },
    "figural_reasoning": { "status": "mastered" | "shaky" | "absent", "cause": "careless_slip" | "misconception" | "never_learned" | "mixed", "reason": "One short sentence citing item IDs." },
    "quantitative_reasoning": { "status": "mastered" | "shaky" | "absent", "cause": "careless_slip" | "misconception" | "never_learned" | "mixed", "reason": "One short sentence citing item IDs." }
  }
}`;

  const startTime = Date.now();
  try {
    const res = await fetch('/api/ai/diagnose', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        config,
        systemInstruction: prompts.diagnosisPrompt,
        prompt: promptPayload,
      }),
    });

    const result = await res.json();
    const latencyMs = result.latencyMs ?? (Date.now() - startTime);

    if (res.ok && result.success && result.data && result.data.clusters) {
      Storage.recordAiCall(true, latencyMs);
      return {
        success: true,
        data: result.data,
        latencyMs,
        model: result.model || config.modelId,
      };
    }

    // Try retry once if first attempt failed
    if (!isRetry) {
      console.warn('[Vizogramm AI] First diagnosis attempt failed, retrying once...', result.error);
      return runStudentDiagnosis(studentName, answers, scores, categories, true);
    }

    Storage.recordAiCall(false, latencyMs);
    return {
      success: false,
      error: result.error || 'Diagnosis failed after retry. AI model returned invalid schema.',
      latencyMs,
    };
  } catch (err: any) {
    if (!isRetry) {
      console.warn('[Vizogramm AI] Network failure on diagnosis, retrying once...', err);
      return runStudentDiagnosis(studentName, answers, scores, categories, true);
    }
    const latencyMs = Date.now() - startTime;
    Storage.recordAiCall(false, latencyMs);
    return {
      success: false,
      error: err.message || 'Diagnosis generation failed',
      latencyMs,
    };
  }
}

// Generate cohort pacing recommendations
export async function runCohortPacing(
  submissions: StudentSubmission[],
  isRetry = false
): Promise<{ success: boolean; data?: PacingRecommendation[]; error?: string; latencyMs: number; model?: string }> {
  const config = Storage.getAIModelConfig();
  const prompts = Storage.getAIPrompts();

  if (!config || config.status !== 'connected') {
    return {
      success: false,
      error: 'No AI model configured. Contact the System Administrator.',
      latencyMs: 0,
    };
  }

  // Aggregate heatmap and causes
  const counts = {
    total: { Below: 0, Average: 0, Above: 0 },
    verbal: { Below: 0, Average: 0, Above: 0 },
    verbalComprehension: { Below: 0, Average: 0, Above: 0 },
    verbalReasoning: { Below: 0, Average: 0, Above: 0 },
    nonverbal: { Below: 0, Average: 0, Above: 0 },
    figuralReasoning: { Below: 0, Average: 0, Above: 0 },
    quantitativeReasoning: { Below: 0, Average: 0, Above: 0 },
  };

  const causes: Record<string, number> = {
    careless_slip: 0,
    misconception: 0,
    never_learned: 0,
    mixed: 0,
  };

  submissions.forEach((sub) => {
    if (sub.status === 'submitted') {
      const cats = sub.categories;
      (Object.keys(counts) as Array<keyof typeof counts>).forEach((k) => {
        const cat = cats[k];
        if (cat === 'Below Average') counts[k].Below++;
        else if (cat === 'Average') counts[k].Average++;
        else if (cat === 'Above Average') counts[k].Above++;
      });

      if (sub.diagnosis && sub.diagnosis.clusters) {
        Object.values(sub.diagnosis.clusters).forEach((c) => {
          if (c && c.cause) {
            causes[c.cause] = (causes[c.cause] || 0) + 1;
          }
        });
      }
    }
  });

  const promptPayload = `Class Cohort Diagnostic Summary:
Total Students Analyzed: ${submissions.length}
HEATMAP COUNTS (Cluster x Category):
${JSON.stringify(counts, null, 2)}

ERROR CAUSES DISTRIBUTION ACROSS COHORT:
${JSON.stringify(causes, null, 2)}

Generate 3 to 5 cohort pacing recommendations linking the observed reasoning baseline to upcoming CS topics.
REQUIRED STRICT JSON FORMAT:
{
  "recommendations": [
    {
      "id": "REC-01",
      "concept": "Topic name (e.g. Boolean Logic & Compound Conditions)",
      "evidence": "Brief cohort count evidence (e.g. 8 of 14 students below average in Verbal Reasoning with misconception causes on inference items)",
      "suggested_action": "Actionable instructional recommendation (e.g. Front-load truth table tracing activities before coding if-else ladders)",
      "rationale": "Why this reasoning gap affects learning in this specific computing concept."
    }
  ]
}`;

  const startTime = Date.now();
  try {
    const res = await fetch('/api/ai/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        config,
        systemInstruction: prompts.pacingPrompt,
        prompt: promptPayload,
      }),
    });

    const result = await res.json();
    const latencyMs = result.latencyMs ?? (Date.now() - startTime);

    if (res.ok && result.success && result.data && Array.isArray(result.data.recommendations)) {
      Storage.recordAiCall(true, latencyMs);
      const recs: PacingRecommendation[] = result.data.recommendations.map((r: any, idx: number) => ({
        id: r.id || `REC-0${idx + 1}`,
        concept: r.concept || 'Foundational Computing Topic',
        evidence: r.evidence || `${submissions.length} students analyzed`,
        suggested_action: r.suggested_action || 'Review baseline prerequisites with the cohort.',
        rationale: r.rationale || 'Instructional hypothesis for instructor review.',
        status: 'pending' as const,
      }));

      return {
        success: true,
        data: recs,
        latencyMs,
        model: result.model || config.modelId,
      };
    }

    if (!isRetry) {
      console.warn('[Vizogramm AI] First pacing recommendation attempt failed, retrying once...', result.error);
      return runCohortPacing(submissions, true);
    }

    Storage.recordAiCall(false, latencyMs);
    return {
      success: false,
      error: result.error || 'Pacing recommendation failed after retry. AI returned invalid schema.',
      latencyMs,
    };
  } catch (err: any) {
    if (!isRetry) {
      console.warn('[Vizogramm AI] Network failure on pacing, retrying once...', err);
      return runCohortPacing(submissions, true);
    }
    const latencyMs = Date.now() - startTime;
    Storage.recordAiCall(false, latencyMs);
    return {
      success: false,
      error: err.message || 'Pacing recommendation failed',
      latencyMs,
    };
  }
}

// Generate Course Recommendations for a Student based on their Baseline Check
export interface CourseRecommendationResult {
  success: boolean;
  data?: {
    recommended_courses: CourseRecommendationItem[];
    no_match_skills: string[];
    suggested_topics_to_create: { skill: string; topic: string; why: string }[];
  };
  error?: string;
  latencyMs: number;
  model?: string;
}

export async function runCourseRecommendation(
  submission: StudentSubmission,
  courses: Course[],
  isRetry = false
): Promise<CourseRecommendationResult> {
  const config = Storage.getAIModelConfig();

  // If no catalog or no submission data: return empty lists per AI rules
  if (!submission || !courses || courses.length === 0) {
    const keyMap: Record<string, keyof typeof submission.categories> = {
      'Verbal Comprehension': 'verbalComprehension',
      'Verbal Reasoning': 'verbalReasoning',
      'Figural Reasoning': 'figuralReasoning',
      'Quantitative Reasoning': 'quantitativeReasoning',
    };
    const neededSkills = ['Verbal Comprehension', 'Verbal Reasoning', 'Figural Reasoning', 'Quantitative Reasoning'].filter(
      (skill) => {
        const cat = submission ? submission.categories[keyMap[skill]] : 'Below Average';
        return cat === 'Below Average' || cat === 'Average';
      }
    );

    return {
      success: true,
      data: {
        recommended_courses: [],
        no_match_skills: neededSkills,
        suggested_topics_to_create: neededSkills.map((s) => ({
          skill: s,
          topic: `Introduction to ${s}`,
          why: `Foundational learning module for students needing practice in ${s}.`,
        })),
      },
      latencyMs: 0,
    };
  }

  if (!config || config.status !== 'connected') {
    return {
      success: false,
      error: 'Recommendations are unavailable right now',
      latencyMs: 0,
    };
  }

  // Student skill-area categories
  const skillCategories = {
    'Verbal Comprehension': submission.categories.verbalComprehension,
    'Verbal Reasoning': submission.categories.verbalReasoning,
    'Figural Reasoning': submission.categories.figuralReasoning,
    'Quantitative Reasoning': submission.categories.quantitativeReasoning,
  };

  // Compile student's answer pattern per skill area
  const answerPattern: Record<string, { totalItems: number; wrongCount: number; errors: Record<string, number> }> = {
    'Verbal Comprehension': { totalItems: 0, wrongCount: 0, errors: {} },
    'Verbal Reasoning': { totalItems: 0, wrongCount: 0, errors: {} },
    'Figural Reasoning': { totalItems: 0, wrongCount: 0, errors: {} },
    'Quantitative Reasoning': { totalItems: 0, wrongCount: 0, errors: {} },
  };

  ITEM_BANK.forEach((item) => {
    if (answerPattern[item.cluster]) {
      answerPattern[item.cluster].totalItems++;
      const studentAns = submission.answers[item.id];
      if (studentAns && studentAns !== item.key) {
        answerPattern[item.cluster].wrongCount++;
        const tag = item.wrongTags[studentAns] || 'unclassified';
        answerPattern[item.cluster].errors[tag] = (answerPattern[item.cluster].errors[tag] || 0) + 1;
      }
    }
  });

  // Course catalog representation
  const catalogPayload = courses.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    tags: c.skillTags,
    difficulty: c.difficulty,
  }));

  const systemInstruction = `You are an educational AI course recommendation system for first-year computing students.
Your job is to recommend courses from the provided course catalog based on the student's weak skill areas evaluated in a cognitive baseline assessment.
CRITICAL RULES:
1. At most 3 recommended courses per student.
2. ONLY use course_ids that strictly exist in the catalog. NEVER invent a course id or course.
3. Start with 'Starter' difficulty when the skill area is 'Below Average'.
4. DO NOT recommend any course for an 'Above Average' skill area.
5. If there is no data or no catalog matching a skill area needing help, list it in "no_match_skills".
6. "reason_for_student": exactly one friendly sentence, no numbers, no negative labels or discouraging words (e.g. "Build your pattern skills with interactive steps", "Warm up your number logic").
7. "reason_for_instructor": exactly one sentence of evidence citing question patterns (e.g. "Missed 3 of 4 number-series items, mostly misconception-type errors").
8. "priority": integer 1, 2, or 3 (1 being highest priority).
9. Output STRICT JSON ONLY matching the required schema. No markdown code fences, no extra text.`;

  const promptPayload = `STUDENT SKILL-AREA CATEGORIES:
${JSON.stringify(skillCategories, null, 2)}

STUDENT ANSWER PATTERN PER SKILL AREA:
${JSON.stringify(answerPattern, null, 2)}

COURSE CATALOG:
${JSON.stringify(catalogPayload, null, 2)}

REQUIRED STRICT JSON FORMAT:
{
  "recommended_courses": [
    {
      "course_id": "must exist in the catalog",
      "target_skill": "Verbal Comprehension | Verbal Reasoning | Figural Reasoning | Quantitative Reasoning",
      "reason_for_student": "one friendly sentence, no numbers, no negative labels",
      "reason_for_instructor": "one sentence of evidence",
      "priority": 1
    }
  ],
  "no_match_skills": ["skill areas needing help but with no course in the catalog"],
  "suggested_topics_to_create": [
    { "skill": "...", "topic": "short title", "why": "one sentence" }
  ]
}`;

  const startTime = Date.now();
  try {
    const res = await fetch('/api/ai/course-recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        config,
        systemInstruction,
        prompt: promptPayload,
      }),
    });

    const result = await res.json();
    const latencyMs = result.latencyMs ?? (Date.now() - startTime);

    if (res.ok && result.success && result.data && Array.isArray(result.data.recommended_courses)) {
      Storage.recordAiCall(true, latencyMs);

      // Validate AI output strictly against rules
      const validCourseIds = new Set(courses.map((c) => c.id));
      const filteredRecs: CourseRecommendationItem[] = [];

      for (const rec of result.data.recommended_courses) {
        if (!validCourseIds.has(rec.course_id)) continue;
        const skill = rec.target_skill;
        if (skillCategories[skill as keyof typeof skillCategories] === 'Above Average') {
          // Rule: do not recommend for an Above Average skill area
          continue;
        }
        filteredRecs.push({
          course_id: rec.course_id,
          target_skill: rec.target_skill,
          reason_for_student: rec.reason_for_student || 'Strengthen your core foundation with this course.',
          reason_for_instructor: rec.reason_for_instructor || `Identified focus area in ${rec.target_skill}`,
          priority: typeof rec.priority === 'number' ? rec.priority : filteredRecs.length + 1,
        });
        if (filteredRecs.length >= 3) break; // Rule: at most 3 recommended courses per student
      }

      return {
        success: true,
        data: {
          recommended_courses: filteredRecs,
          no_match_skills: Array.isArray(result.data.no_match_skills) ? result.data.no_match_skills : [],
          suggested_topics_to_create: Array.isArray(result.data.suggested_topics_to_create)
            ? result.data.suggested_topics_to_create
            : [],
        },
        latencyMs,
        model: result.model || config.modelId,
      };
    }

    if (!isRetry) {
      console.warn('[Vizogramm AI] First course recommendation attempt failed, retrying once...', result.error);
      return runCourseRecommendation(submission, courses, true);
    }

    Storage.recordAiCall(false, latencyMs);
    return {
      success: false,
      error: 'Recommendations are unavailable right now',
      latencyMs,
    };
  } catch (err: any) {
    if (!isRetry) {
      console.warn('[Vizogramm AI] Network failure on course recommendation, retrying once...', err);
      return runCourseRecommendation(submission, courses, true);
    }
    const latencyMs = Date.now() - startTime;
    Storage.recordAiCall(false, latencyMs);
    return {
      success: false,
      error: 'Recommendations are unavailable right now',
      latencyMs,
    };
  }
}

