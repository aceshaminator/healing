export interface RiskInput {
  systolicBP: number;
  heartRate: number;
  familyHistoryCount: number;
  activeSymptoms?: string[];
}

export interface RiskResult {
  score: number;
  category: 'Low' | 'Moderate' | 'High' | 'Critical';
  summary: string;
}

export function calculateCardiovascularRisk(input: RiskInput): RiskResult {
  let score = 10;

  // Vitals scoring
  if (input.systolicBP >= 160) score += 40;
  else if (input.systolicBP >= 140) score += 25;
  else if (input.systolicBP >= 130) score += 10;

  if (input.heartRate > 100 || input.heartRate < 50) score += 15;

  // Family DNA risk multiplier
  score += input.familyHistoryCount * 8;

  // Symptom weights
  if (input.activeSymptoms?.includes('chest_pain')) score += 30;
  if (input.activeSymptoms?.includes('shortness_breath')) score += 20;
  if (input.activeSymptoms?.includes('dizziness')) score += 10;
  if (input.activeSymptoms?.includes('headache')) score += 10;

  score = Math.min(score, 100);

  let category: RiskResult['category'] = 'Low';
  let summary = 'Vitals and symptomatic indicators are within normal parameters.';

  if (score >= 75) {
    category = 'Critical';
    summary = 'Critical cardiovascular alert triggered. Immediate medical check required.';
  } else if (score >= 50) {
    category = 'High';
    summary = 'Elevated vital signs and active symptoms present. Follow-up advised.';
  } else if (score >= 30) {
    category = 'Moderate';
    summary = 'Mild risk indicators detected. Continue monitoring vital trends.';
  }

  return { score, category, summary };
}