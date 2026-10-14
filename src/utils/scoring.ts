import { ITEM_BANK } from '../data/itemBank';
import {
  ClusterCategoryBreakdown,
  ClusterScoreBreakdown,
  ScoreCategory,
} from '../types';

export interface NormBand {
  below: [number, number];
  average: [number, number];
  above: [number, number];
}

// 24-item adapted provisional bands
export const PROVISIONAL_BANDS: Record<keyof ClusterScoreBreakdown, NormBand> = {
  total: { below: [0, 8], average: [9, 15], above: [16, 24] },
  verbal: { below: [0, 4], average: [5, 7], above: [8, 12] },
  verbalComprehension: { below: [0, 1], average: [2, 2], above: [3, 4] },
  verbalReasoning: { below: [0, 2], average: [3, 4], above: [5, 8] },
  nonverbal: { below: [0, 4], average: [5, 8], above: [9, 12] },
  figuralReasoning: { below: [0, 1], average: [2, 3], above: [4, 6] },
  quantitativeReasoning: { below: [0, 2], average: [3, 4], above: [5, 6] },
};

// Official 72-item reference norms (Table 45, OLSAT Level G Form 5)
export const OFFICIAL_72_BANDS = {
  total: { max: 72, below: '0–26', average: '27–45', above: '46–72' },
  verbal: { max: 36, below: '0–12', average: '13–22', above: '23–36' },
  verbalComprehension: { max: 12, below: '0–4', average: '5–8', above: '9–12' },
  verbalReasoning: { max: 24, below: '0–7', average: '8–14', above: '15–24' },
  nonverbal: { max: 36, below: '0–12', average: '13–25', above: '26–36' },
  figuralReasoning: { max: 18, below: '0–5', average: '6–11', above: '12–18' },
  quantitativeReasoning: { max: 18, below: '0–6', average: '7–13', above: '14–18' },
};

export function getCategoryFromScore(
  clusterKey: keyof ClusterScoreBreakdown,
  rawScore: number
): ScoreCategory {
  const band = PROVISIONAL_BANDS[clusterKey];
  if (!band) return 'Average';
  if (rawScore <= band.below[1]) return 'Below Average';
  if (rawScore <= band.average[1]) return 'Average';
  return 'Above Average';
}

export function computeScores(answers: Record<string, string>): {
  scores: ClusterScoreBreakdown;
  categories: ClusterCategoryBreakdown;
} {
  let vc = 0;
  let vr = 0;
  let fr = 0;
  let qr = 0;

  for (const item of ITEM_BANK) {
    const studentAnswer = answers[item.id];
    const isCorrect = studentAnswer === item.key;
    if (isCorrect) {
      if (item.cluster === 'Verbal Comprehension') vc++;
      else if (item.cluster === 'Verbal Reasoning') vr++;
      else if (item.cluster === 'Figural Reasoning') fr++;
      else if (item.cluster === 'Quantitative Reasoning') qr++;
    }
  }

  const verbal = vc + vr;
  const nonverbal = fr + qr;
  const total = verbal + nonverbal;

  const scores: ClusterScoreBreakdown = {
    total,
    verbal,
    verbalComprehension: vc,
    verbalReasoning: vr,
    nonverbal,
    figuralReasoning: fr,
    quantitativeReasoning: qr,
  };

  const categories: ClusterCategoryBreakdown = {
    total: getCategoryFromScore('total', total),
    verbal: getCategoryFromScore('verbal', verbal),
    verbalComprehension: getCategoryFromScore('verbalComprehension', vc),
    verbalReasoning: getCategoryFromScore('verbalReasoning', vr),
    nonverbal: getCategoryFromScore('nonverbal', nonverbal),
    figuralReasoning: getCategoryFromScore('figuralReasoning', fr),
    quantitativeReasoning: getCategoryFromScore('quantitativeReasoning', qr),
  };

  return { scores, categories };
}
