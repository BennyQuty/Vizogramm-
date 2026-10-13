/**
 * Vizogramm AI & Deterministic Diagnostic Engine
 * Performs objective scoring, evidence-based pattern interpretation across:
 *  A. Careless Slips
 *  B. Repeated Misconceptions
 *  C. Unattempted Questions & Possible Guesses
 * Generates transparent competency classifications (Mastered, Shaky, Critical Gap, Insufficient Evidence)
 */

import {
  Assessment,
  AssessmentQuestion,
  AssessmentSubmission,
  DiagnosticAnalysis,
  DiagnosticFinding,
  StudentCompetencyProfile,
  StudentCompetencyDetail,
  CompetencyStatus,
} from '../types/domain';
import { CS_COMPETENCIES, ASSESSMENT_QUESTIONS } from '../data/seedData';

export interface DiagnosticResult {
  analysis: DiagnosticAnalysis;
  updatedProfile: StudentCompetencyProfile;
}

export function runDiagnosticAnalysis(
  submission: AssessmentSubmission,
  assessment: Assessment,
  questions: AssessmentQuestion[] = ASSESSMENT_QUESTIONS
): DiagnosticResult {
  const questionMap = new Map(questions.map((q) => [q.id, q]));
  const findings: DiagnosticFinding[] = [];

  // Group responses by competency
  const competencyResponses: Record<
    string,
    {
      question: AssessmentQuestion;
      isAnswered: boolean;
      isCorrect: boolean;
      selectedOptionId?: string;
      misconceptionTag?: string;
    }[]
  > = {};

  CS_COMPETENCIES.forEach((comp) => {
    competencyResponses[comp.id] = [];
  });

  // Calculate deterministic scores and group
  let totalRawScore = 0;
  let totalMaxScore = 0;

  assessment.questionIds.forEach((qId) => {
    const q = questionMap.get(qId);
    if (!q) return;

    totalMaxScore += q.points;
    const resp = submission.responses[qId];

    const isAnswered = !!resp && resp.isAnswered;
    const isCorrect = isAnswered && resp.selectedOptionId === q.correctOptionId;

    if (isCorrect) {
      totalRawScore += q.points;
    }

    const selectedOption = q.options.find((opt) => opt.id === resp?.selectedOptionId);

    competencyResponses[q.competencyId]?.push({
      question: q,
      isAnswered,
      isCorrect,
      selectedOptionId: resp?.selectedOptionId,
      misconceptionTag: selectedOption?.misconceptionTag,
    });
  });

  const scorePercentage = totalMaxScore > 0 ? Math.round((totalRawScore / totalMaxScore) * 100) : 0;

  // Build Competency Profile Details and Diagnostic Findings
  const competencyDetails: Record<string, StudentCompetencyDetail> = {};

  CS_COMPETENCIES.forEach((comp) => {
    const items = competencyResponses[comp.id] || [];
    const totalQuestions = items.length;
    const attemptedQuestions = items.filter((i) => i.isAnswered).length;
    const correctQuestions = items.filter((i) => i.isCorrect).length;
    const incorrectQuestions = items.filter((i) => i.isAnswered && !i.isCorrect);
    const unattemptedQuestions = items.filter((i) => !i.isAnswered);

    let status: CompetencyStatus = 'Insufficient Evidence';
    let confidence: 'High' | 'Moderate' | 'Low' | 'Insufficient Evidence' = 'Moderate';
    let evidenceSummary = '';
    let suggestedAction = '';

    if (attemptedQuestions === 0) {
      // Unattempted category
      status = 'Insufficient Evidence';
      confidence = 'Insufficient Evidence';
      evidenceSummary = `0 of ${totalQuestions} questions attempted. Evidence is insufficient to reliably assess understanding.`;
      suggestedAction = 'Administer a follow-up 2-question targeted check-in before classifying competency.';

      findings.push({
        id: `find-unattempted-${comp.id}-${Date.now()}`,
        category: 'Unattempted / Possible Guess',
        competencyId: comp.id,
        questionIds: unattemptedQuestions.map((i) => i.question.id),
        observedPattern: `All questions in ${comp.name} were left unattempted without an answer choice selected.`,
        evidenceSummary: `Missing responses cannot be interpreted as confirmed misunderstanding.`,
        interpretation: `Student did not reach or chose to skip ${comp.name}. Diagnostic data remains incomplete.`,
        confidence: 'Insufficient Evidence',
        suggestedFollowUp: `Conduct a brief unproctored check-in on ${comp.name} to collect missing evidence.`,
      });
    } else if (attemptedQuestions < totalQuestions && attemptedQuestions === 1 && totalQuestions >= 2) {
      // Partial evidence
      status = 'Insufficient Evidence';
      confidence = 'Low';
      evidenceSummary = `Only 1 of ${totalQuestions} questions attempted (${correctQuestions} correct). Sample is too small for high diagnostic certainty.`;
      suggestedAction = 'Collect additional evidence through class participation or quick review.';
    } else {
      const accuracy = correctQuestions / attemptedQuestions;

      if (accuracy >= 0.8) {
        status = 'Mastered';
        confidence = 'High';
        evidenceSummary = `${correctQuestions}/${attemptedQuestions} correct. Consistent demonstrated understanding across tested items.`;
        suggestedAction = 'Maintain standard instructional pacing; eligible for enrichment.';

        // Check if there was an isolated slip in this mastered domain
        if (incorrectQuestions.length === 1 && correctQuestions >= 2) {
          const slipItem = incorrectQuestions[0];
          findings.push({
            id: `find-slip-${comp.id}-${Date.now()}`,
            category: 'Careless Slip',
            competencyId: comp.id,
            questionIds: [slipItem.question.id],
            observedPattern: `Answered ${correctQuestions} of ${attemptedQuestions} questions accurately in ${comp.name}, with an isolated error on "${slipItem.question.title}".`,
            evidenceSummary: `Student otherwise demonstrates firm mastery of ${comp.name}.`,
            interpretation: `The isolated error likely represents a careless slip or misread question rather than a systemic cognitive gap.`,
            confidence: 'Moderate',
            suggestedFollowUp: `Briefly prompt the student to review their work on "${slipItem.question.title}".`,
          });
        }
      } else if (accuracy >= 0.5) {
        status = 'Shaky';
        confidence = 'Moderate';
        evidenceSummary = `${correctQuestions}/${attemptedQuestions} correct. Demonstrates partial, inconsistent reasoning on complex boundary conditions.`;
        suggestedAction = 'Provide targeted practice and conceptual review before introducing dependent topics.';

        if (incorrectQuestions.length > 0) {
          findings.push({
            id: `find-shaky-${comp.id}-${Date.now()}`,
            category: 'Careless Slip',
            competencyId: comp.id,
            questionIds: incorrectQuestions.map((i) => i.question.id),
            observedPattern: `Inconsistent performance on ${comp.name} (${correctQuestions}/${attemptedQuestions} correct).`,
            evidenceSummary: `Student answered some foundational items correctly while missing related items.`,
            interpretation: `Demonstrates fragile or emergent understanding. Concepts are partially grasped but not yet stable under variation.`,
            confidence: 'Moderate',
            suggestedFollowUp: `Assign guided step-through code traces on ${comp.name}.`,
          });
        }
      } else {
        // Less than 50%
        status = 'Critical Gap';
        confidence = attemptedQuestions >= 2 ? 'High' : 'Moderate';
        evidenceSummary = `${correctQuestions}/${attemptedQuestions} correct. Multiple incorrect responses demonstrate repeated conceptual deviations.`;
        suggestedAction = 'Schedule targeted remedial intervention; review fundamental concepts before continuing.';

        findings.push({
          id: `find-misc-${comp.id}-${Date.now()}`,
          category: 'Repeated Misconception',
          competencyId: comp.id,
          questionIds: incorrectQuestions.map((i) => i.question.id),
          observedPattern: `Student missed ${incorrectQuestions.length} of ${attemptedQuestions} attempted questions in ${comp.name}.`,
          evidenceSummary: `Repeated incorrect answers across: ${incorrectQuestions.map((i) => i.question.title).join(', ')}.`,
          interpretation: `Response pattern indicates an underlying conceptual misconception in ${comp.name} rather than arithmetic slips.`,
          confidence: confidence,
          suggestedFollowUp: `Conduct targeted review on core rules of ${comp.name} prior to subsequent units.`,
          codeComparison: incorrectQuestions[0]?.question.codeSnippet
            ? {
                flawedSnippet: `// Flawed pattern in: ${incorrectQuestions[0].question.title}\n// Selected option: ${
                  incorrectQuestions[0].question.options.find(
                    (o) => o.id === incorrectQuestions[0].selectedOptionId
                  )?.text || 'Incorrect option'
                }`,
                canonicalSnippet: `// Canonical solution\n// Correct option: ${
                  incorrectQuestions[0].question.options.find(
                    (o) => o.id === incorrectQuestions[0].question.correctOptionId
                  )?.text || 'Canonical option'
                }`,
                explanation: incorrectQuestions[0].question.explanation,
              }
            : undefined,
        });
      }
    }

    competencyDetails[comp.id] = {
      competencyId: comp.id,
      status,
      questionsAttempted: attemptedQuestions,
      questionsTotal: totalQuestions,
      questionsCorrect: correctQuestions,
      evidenceSummary,
      confidenceIndicator: confidence,
      suggestedAction,
    };
  });

  const analysis: DiagnosticAnalysis = {
    id: `diag-${submission.id}`,
    submissionId: submission.id,
    studentId: submission.studentId,
    assessmentId: assessment.id,
    status: 'Completed',
    analyzedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    findings,
  };

  const updatedProfile: StudentCompetencyProfile = {
    studentId: submission.studentId,
    studentName: submission.studentName,
    overallScorePercentage: scorePercentage,
    updatedAt: analysis.analyzedAt || new Date().toISOString(),
    competencies: competencyDetails,
  };

  return { analysis, updatedProfile };
}
