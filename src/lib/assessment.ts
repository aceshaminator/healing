import type { RiskLevel, SignalReading, SymptomQuestion } from './types';

// Nigeria's national emergency number. Change it if the app is used in another country.
const EMERGENCY_NUMBER = (() => { try { return localStorage.getItem('healing_emergency_number') || '112'; } catch { return '112'; } })();

export const SYMPTOM_QUESTIONS: SymptomQuestion[] = [
  // Cardiovascular
  { id: 'chest_pain', category: 'Cardiovascular', question: 'Do you have chest pain or tightness?', description: 'Pressure, squeezing, or pain in the chest area', weight: 25, severe: true },
  { id: 'irregular_heartbeat', category: 'Cardiovascular', question: 'Is your heartbeat irregular or racing?', description: 'Palpitations or skipped beats', weight: 12 },
  { id: 'leg_swelling', category: 'Cardiovascular', question: 'Do you have swelling in your legs or ankles?', description: 'Puffiness or fluid buildup in the lower limbs', weight: 10 },
  { id: 'arm_pain', category: 'Cardiovascular', question: 'Do you have pain radiating to your arm or jaw?', description: 'Can be a sign of cardiac distress', weight: 18, severe: true },

  // Respiratory
  { id: 'breath_shortness', category: 'Respiratory', question: 'Are you experiencing shortness of breath?', description: 'Difficulty breathing, especially during light activity', weight: 20, severe: true },
  { id: 'persistent_cough', category: 'Respiratory', question: 'Do you have a persistent cough?', description: 'A cough lasting more than a few days', weight: 10 },
  { id: 'wheezing', category: 'Respiratory', question: 'Are you wheezing or making whistling sounds when breathing?', description: 'Narrowed airways can cause wheezing', weight: 12 },
  { id: 'cough_blood', category: 'Respiratory', question: 'Are you coughing up blood?', description: 'Blood in sputum requires urgent evaluation', weight: 22, severe: true },

  // Metabolic / Endocrine
  { id: 'excessive_thirst', category: 'Metabolic', question: 'Are you experiencing excessive thirst?', description: 'Unusual or constant need to drink water', weight: 8 },
  { id: 'frequent_urination', category: 'Metabolic', question: 'Are you urinating much more frequently than usual?', description: 'Can indicate metabolic imbalance', weight: 8 },
  { id: 'unexplained_weight_loss', category: 'Metabolic', question: 'Have you lost weight without trying?', description: 'Unexpected weight loss over a short period', weight: 10 },
  { id: 'extreme_hunger', category: 'Metabolic', question: 'Are you feeling extreme hunger even after eating?', description: 'Can signal blood sugar irregularity', weight: 6 },

  // Neurological
  { id: 'severe_headache', category: 'Neurological', question: 'Do you have a severe or unusual headache?', description: 'A headache worse than usual or with no clear cause', weight: 12 },
  { id: 'dizziness', category: 'Neurological', question: 'Have you felt dizzy or fainted recently?', description: 'Lightheadedness or loss of balance', weight: 12 },
  { id: 'confusion', category: 'Neurological', question: 'Are you experiencing confusion or trouble speaking?', description: 'Sudden difficulty with words or awareness', weight: 20, severe: true },
  { id: 'limb_weakness', category: 'Neurological', question: 'Do you have sudden weakness or numbness in a limb or face?', description: 'Can be a warning sign of stroke', weight: 22, severe: true },
  { id: 'seizure', category: 'Neurological', question: 'Have you had a seizure or convulsion?', description: 'Involuntary movements or loss of consciousness', weight: 25, severe: true },

  // Maternal / Reproductive
  { id: 'vaginal_bleeding', category: 'Maternal', question: 'Are you experiencing unusual vaginal bleeding?', description: 'Bleeding outside your normal cycle or during pregnancy', weight: 18, severe: true },
  { id: 'severe_abdominal_pain', category: 'Maternal', question: 'Do you have severe abdominal or pelvic pain?', description: 'Intense pain in the lower belly', weight: 16, severe: true },
  { id: 'decreased_fetal_movement', category: 'Maternal', question: 'Have you noticed decreased fetal movement?', description: 'Less kicking or movement than usual during pregnancy', weight: 20, severe: true },

  // Systemic / General
  { id: 'fever', category: 'Systemic', question: 'Have you had a fever in the last 24 hours?', description: 'Body temperature above 38°C / 100.4°F', weight: 15 },
  { id: 'fatigue', category: 'Systemic', question: 'Are you feeling unusual fatigue or weakness?', description: 'Low energy that interferes with daily activities', weight: 8 },
  { id: 'night_sweats', category: 'Systemic', question: 'Are you experiencing drenching night sweats?', description: 'Heavy sweating during sleep', weight: 8 },
  { id: 'unexplained_rash', category: 'Systemic', question: 'Do you have an unexplained rash or skin changes?', description: 'New rash, hives, or discoloration', weight: 8 },

  // Gastrointestinal
  { id: 'nausea_vomiting', category: 'Gastrointestinal', question: 'Are you experiencing nausea or vomiting?', description: 'Feeling sick to your stomach or throwing up', weight: 8 },
  { id: 'blood_stool', category: 'Gastrointestinal', question: 'Have you noticed blood in your stool?', description: 'Dark, tarry, or bright red blood', weight: 16, severe: true },
  { id: 'severe_diarrhea', category: 'Gastrointestinal', question: 'Do you have severe or persistent diarrhea?', description: 'Multiple episodes lasting more than 2 days', weight: 10 },

  // Sensory
  { id: 'loss_smell_taste', category: 'Sensory', question: 'Have you noticed a loss of smell or taste?', description: 'Sudden inability to smell or taste normally', weight: 10 },
  { id: 'vision_changes', category: 'Sensory', question: 'Are you experiencing sudden vision changes?', description: 'Blurriness, double vision, or vision loss', weight: 14, severe: true },
];

const MAX_RAW_SCORE = SYMPTOM_QUESTIONS.reduce((sum, q) => sum + q.weight, 0);

export const SEVERE_SYMPTOM_IDS = SYMPTOM_QUESTIONS.filter((q) => q.severe).map((q) => q.id);

// Symptoms that need emergency care on their own, whatever the score says.
// Have a doctor review this list before real people rely on the app.
export const EMERGENCY_SYMPTOM_IDS = [
  'chest_pain',
  'arm_pain',
  'breath_shortness',
  'cough_blood',
  'confusion',
  'limb_weakness',
  'seizure',
];

const LEVEL_ORDER: RiskLevel[] = ['low', 'moderate', 'high', 'critical'];
const LEVEL_MIN_SCORE: Record<RiskLevel, number> = { low: 0, moderate: 20, high: 45, critical: 70 };

function higherOf(a: RiskLevel, b: RiskLevel): RiskLevel {
  return LEVEL_ORDER.indexOf(a) >= LEVEL_ORDER.indexOf(b) ? a : b;
}

function hasDangerousVitals(s: Partial<SignalReading>): boolean {
  return (
    (s.temperature != null && s.temperature >= 39.5) ||
    (s.systolic != null && s.systolic >= 180) ||
    (s.diastolic != null && s.diastolic >= 120) ||
    (s.heartRate != null && (s.heartRate >= 140 || s.heartRate < 40)) ||
    (s.glucose != null && s.glucose <= 50)
  );
}

export function calculateRisk(
  selectedSymptomIds: string[],
  signals: Partial<SignalReading>,
): { score: number; level: RiskLevel } {
  const symptomScore = SYMPTOM_QUESTIONS.filter((q) =>
    selectedSymptomIds.includes(q.id),
  ).reduce((sum, q) => sum + q.weight, 0);

  let signalBonus = 0;
  if (signals.temperature != null && signals.temperature >= 39) signalBonus += 15;
  else if (signals.temperature != null && signals.temperature >= 38) signalBonus += 8;

  if (signals.heartRate != null && signals.heartRate >= 120) signalBonus += 10;
  else if (signals.heartRate != null && signals.heartRate <= 45) signalBonus += 10;

  if (signals.spo2 != null && signals.spo2 < 92) signalBonus += 15;
  else if (signals.spo2 != null && signals.spo2 < 95) signalBonus += 7;

  if (signals.systolic != null && signals.systolic >= 180) signalBonus += 10;
  if (signals.diastolic != null && signals.diastolic >= 120) signalBonus += 10;

  if (signals.respiratoryRate != null && signals.respiratoryRate >= 25) signalBonus += 8;
  if (signals.glucose != null && signals.glucose >= 250) signalBonus += 10;
  else if (signals.glucose != null && signals.glucose <= 50) signalBonus += 12;

  const raw = symptomScore + signalBonus;
  const normalized = Math.min(100, Math.round((raw / (MAX_RAW_SCORE + 50)) * 100));

  let level: RiskLevel = 'low';
  if (normalized >= 70) level = 'critical';
  else if (normalized >= 45) level = 'high';
  else if (normalized >= 20) level = 'moderate';

  // Safety floors: a dangerous symptom or reading is never shown as "low", whatever the points add up to.
  const severeCount = SEVERE_SYMPTOM_IDS.filter((id) => selectedSymptomIds.includes(id)).length;
  const emergencySelected = EMERGENCY_SYMPTOM_IDS.some((id) => selectedSymptomIds.includes(id));

  let floor: RiskLevel = 'low';
  if (severeCount >= 1) floor = 'high';
  if (emergencySelected || severeCount >= 2) floor = 'critical';
  if (signals.spo2 != null && signals.spo2 < 92) floor = 'critical';
  else if (hasDangerousVitals(signals)) floor = higherOf(floor, 'high');

  level = higherOf(level, floor);

  return { score: Math.max(normalized, LEVEL_MIN_SCORE[level]), level };
}

export function shouldTriggerAlarm(
  selectedSymptomIds: string[],
  signals: Partial<SignalReading>,
  level: RiskLevel,
): { trigger: boolean; reasons: string[] } {
  const reasons: string[] = [];

  if (level === 'critical') reasons.push('Critical risk level reached');

  const severeSelected = SEVERE_SYMPTOM_IDS.filter((id) => selectedSymptomIds.includes(id));
  const severeLabels: Record<string, string> = {
    chest_pain: 'Chest pain flagged',
    arm_pain: 'Radiating arm/jaw pain flagged',
    breath_shortness: 'Severe shortness of breath',
    cough_blood: 'Coughing up blood',
    confusion: 'Confusion or speech difficulty',
    limb_weakness: 'Sudden limb weakness or numbness',
    seizure: 'Seizure reported',
    vaginal_bleeding: 'Unusual vaginal bleeding',
    severe_abdominal_pain: 'Severe abdominal pain',
    decreased_fetal_movement: 'Decreased fetal movement',
    blood_stool: 'Blood in stool',
    vision_changes: 'Sudden vision changes',
  };
  severeSelected.forEach((id) => {
    if (severeLabels[id]) reasons.push(severeLabels[id]);
  });

  if (signals.spo2 != null && signals.spo2 < 92) reasons.push('Critical hypoxia (O₂ below 92%)');
  if (signals.temperature != null && signals.temperature >= 39.5) reasons.push('Dangerously high fever');
  if (signals.systolic != null && signals.systolic >= 180) reasons.push('Hypertensive crisis');
  if (signals.diastolic != null && signals.diastolic >= 120) reasons.push('Dangerously high lower blood pressure number');
  if (signals.heartRate != null && signals.heartRate >= 140) reasons.push('Dangerously high heart rate');
  if (signals.heartRate != null && signals.heartRate < 40) reasons.push('Dangerously low heart rate');
  if (signals.glucose != null && signals.glucose <= 50) reasons.push('Severe hypoglycemia');

  return { trigger: reasons.length > 0, reasons };
}

export function buildInsights(
  selectedSymptomIds: string[],
  signals: Partial<SignalReading>,
): string[] {
  const insights: string[] = [];

  const selected = SYMPTOM_QUESTIONS.filter((q) => selectedSymptomIds.includes(q.id));
  const categories = [...new Set(selected.map((s) => s.category))];
  categories.forEach((cat) => {
    const count = selected.filter((s) => s.category === cat).length;
    insights.push(`${count} warning sign${count > 1 ? 's' : ''} flagged in ${cat}.`);
  });

  if (signals.temperature != null && signals.temperature >= 38) {
    insights.push(`Elevated body temperature detected (${signals.temperature.toFixed(1)}°C).`);
  }
  if (signals.heartRate != null && (signals.heartRate >= 120 || signals.heartRate <= 45)) {
    insights.push(`Heart rate outside the normal resting range (${signals.heartRate} bpm).`);
  }
  if (signals.spo2 != null && signals.spo2 < 95) {
    insights.push(`Blood oxygen saturation below the healthy threshold (${signals.spo2}%).`);
  }
  if (signals.systolic != null && signals.diastolic != null && (signals.systolic >= 140 || signals.diastolic >= 90)) {
    insights.push(`Blood pressure reading of ${signals.systolic}/${signals.diastolic} mmHg is elevated.`);
  }
  if (signals.glucose != null && (signals.glucose >= 200 || signals.glucose <= 60)) {
    insights.push(`Blood glucose level (${signals.glucose} mg/dL) is outside the normal range.`);
  }
  if (signals.respiratoryRate != null && signals.respiratoryRate >= 25) {
    insights.push(`Elevated respiratory rate (${signals.respiratoryRate} breaths/min).`);
  }

  if (insights.length === 0) {
    insights.push('None of the warning signs you were asked about were selected. This does not mean you are healthy.');
    const hasSignals = Object.values(signals).some((v) => v != null);
    if (hasSignals) {
      insights.push('None of the readings you entered crossed the warning limits used here.');
    }
  }

  return insights;
}

export function buildRecommendations(
  level: RiskLevel,
  selectedSymptomIds: string[],
  signals: Partial<SignalReading>,
): string[] {
  const recs: string[] = [];

  switch (level) {
    case 'low':
      recs.push('Continue monitoring your health daily and stay hydrated.');
      recs.push('Maintain regular rest and a balanced diet.');
      recs.push('Re-assess in 24 hours or if new symptoms appear.');
      recs.push('If you feel unwell, see a doctor anyway, whatever this result says.');
      break;
    case 'moderate':
      recs.push('Rest and increase fluid intake. Avoid strenuous activity.');
      recs.push('Monitor your symptoms closely over the next 12–24 hours.');
      recs.push('Visit a local clinic if symptoms worsen or do not improve.');
      break;
    case 'high':
      recs.push('Seek medical attention within the next few hours.');
      recs.push('Avoid physical exertion and stay near someone who can help.');
      recs.push('Bring this assessment with you to show a healthcare worker.');
      break;
    case 'critical':
      recs.push('Seek emergency medical care immediately.');
      recs.push(`Call ${EMERGENCY_NUMBER} now, or go to the nearest emergency facility. Do not delay.`);
      recs.push('Do not drive yourself if you feel faint, confused or unwell.');
      break;
  }

  if (selectedSymptomIds.includes('chest_pain')) {
    recs.unshift('Chest pain can be serious — prioritize urgent medical evaluation.');
  }
  if (signals.spo2 != null && signals.spo2 < 92) {
    recs.unshift('Low oxygen saturation — seek care with oxygen support available.');
  }
  if (signals.temperature != null && signals.temperature >= 39) {
    recs.unshift('High fever — use fever-reducing measures and seek medical advice.');
  }
  if (selectedSymptomIds.includes('seizure')) {
    recs.unshift('Seizure activity — seek immediate neurological evaluation.');
  }
  if (selectedSymptomIds.includes('limb_weakness')) {
    recs.unshift('Sudden weakness can indicate stroke — seek emergency care now.');
  }

  return recs;
}

export const RISK_CONFIG: Record<
  RiskLevel,
  { label: string; color: string; bg: string; ring: string; text: string; dot: string; border: string }
> = {
  low: { label: 'Low Risk', color: 'emerald', bg: 'bg-emerald-50', ring: 'ring-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500', border: 'border-emerald-200' },
  moderate: { label: 'Moderate Risk', color: 'amber', bg: 'bg-amber-50', ring: 'ring-amber-200', text: 'text-amber-700', dot: 'bg-amber-500', border: 'border-amber-200' },
  high: { label: 'High Risk', color: 'orange', bg: 'bg-orange-50', ring: 'ring-orange-200', text: 'text-orange-700', dot: 'bg-orange-500', border: 'border-orange-200' },
  critical: { label: 'Critical', color: 'rose', bg: 'bg-rose-50', ring: 'ring-rose-200', text: 'text-rose-700', dot: 'bg-rose-500', border: 'border-rose-200' },
};

// --- Pregnancy assessment data ---

export const PREGNANCY_SYMPTOMS: { id: string; label: string; description: string; severe?: boolean }[] = [
  { id: 'morning_sickness', label: 'Nausea / morning sickness', description: 'Feeling nauseous, especially in the morning' },
  { id: 'breast_tenderness', label: 'Breast tenderness', description: 'Swollen or sensitive breasts' },
  { id: 'fatigue', label: 'Increased fatigue', description: 'Feeling more tired than usual' },
  { id: 'food_aversion', label: 'Food cravings or aversions', description: 'Strong reactions to certain foods or smells' },
  { id: 'frequent_urination', label: 'Frequent urination', description: 'Needing to urinate more often' },
  { id: 'mood_swings', label: 'Mood swings', description: 'Emotional changes and irritability' },
  { id: 'spotting', label: 'Light spotting', description: 'Light bleeding in early pregnancy', severe: true },
  { id: 'cramping', label: 'Abdominal cramping', description: 'Mild to moderate cramps in the lower abdomen', severe: true },
  { id: 'severe_headache_preg', label: 'Severe headache', description: 'Persistent or unusually severe headache', severe: true },
  { id: 'vision_disturbance', label: 'Vision disturbances', description: 'Blurriness, spots, or light sensitivity', severe: true },
  { id: 'upper_abdominal_pain', label: 'Upper abdominal pain', description: 'Pain under the ribs, right side', severe: true },
  { id: 'sudden_swelling', label: 'Sudden swelling of face/hands', description: 'Rapid swelling, especially in face and hands', severe: true },
];

export const PREECLAMPSIA_SIGNS = ['severe_headache_preg', 'vision_disturbance', 'upper_abdominal_pain', 'sudden_swelling'];

export function assessPregnancyRisk(symptoms: string[], basalTemp: number | null, missedCycle: boolean): { level: RiskLevel; flags: string[] } {
  const flags: string[] = [];
  let score = 0;

  if (missedCycle) { score += 5; flags.push('Missed menstrual cycle logged'); }
  if (basalTemp != null && basalTemp >= 37.0) { score += 5; flags.push('Elevated basal body temperature'); }

  const severeSelected = symptoms.filter((s) => PREGNANCY_SYMPTOMS.find((p) => p.id === s)?.severe);
  severeSelected.forEach((s) => {
    score += 15;
    const label = PREGNANCY_SYMPTOMS.find((p) => p.id === s)?.label;
    if (label) flags.push(`Warning: ${label}`);
  });

  const preeclampsiaHits = severeSelected.filter((s) => PREECLAMPSIA_SIGNS.includes(s));
  if (preeclampsiaHits.length >= 2) {
    score += 20;
    flags.push('PREECLAMPSIA WARNING — multiple signs detected. Seek immediate medical evaluation.');
  } else if (preeclampsiaHits.length === 1) {
    // One of these signs alone is enough to need a check the same day.
    score = Math.max(score, 30);
    flags.push('This can be a sign of a pregnancy complication. Contact your doctor or midwife today.');
  }

  const mildSelected = symptoms.filter((s) => !PREGNANCY_SYMPTOMS.find((p) => p.id === s)?.severe);
  score += mildSelected.length * 3;

  let level: RiskLevel = 'low';
  if (score >= 50) level = 'critical';
  else if (score >= 30) level = 'high';
  else if (score >= 15) level = 'moderate';

  if (flags.length === 0) flags.push('No concerning warning signs detected.');

  return { level, flags };
}

// --- Mental wellness data ---

export const MOOD_OPTIONS: { value: import('./types').MoodLevel; label: string; emoji: string; color: string; score: number }[] = [
  { value: 'great', label: 'Great', emoji: '😄', color: 'emerald', score: 5 },
  { value: 'good', label: 'Good', emoji: '🙂', color: 'teal', score: 4 },
  { value: 'okay', label: 'Okay', emoji: '😐', color: 'sky', score: 3 },
  { value: 'low', label: 'Low', emoji: '😕', color: 'amber', score: 2 },
  { value: 'poor', label: 'Poor', emoji: '😢', color: 'rose', score: 1 },
];

export const MOOD_TAGS = ['Anxious', 'Calm', 'Energetic', 'Tired', 'Focused', 'Irritable', 'Grateful', 'Stressed', 'Hopeful', 'Overwhelmed'];

// --- Telemedicine providers ---
// SAMPLE DATA ONLY: these doctors, ratings and time slots are invented.
// Never show them to real users as if they were real people or real availability.

export const PROVIDERS: import('./types').Provider[] = [
  { id: 'p1', name: 'Dr. Amara Okafor', specialty: 'General Practice', rating: 4.8, available: true, nextSlot: 'Today, 2:00 PM', avatarColor: 'bg-teal-500', bio: 'Primary care physician with 12 years of experience in community health.' },
  { id: 'p2', name: 'Dr. James Chen', specialty: 'Cardiology', rating: 4.9, available: true, nextSlot: 'Today, 4:30 PM', avatarColor: 'bg-rose-500', bio: 'Cardiologist specializing in preventive heart health and hypertension management.' },
  { id: 'p3', name: 'Dr. Sofia Reyes', specialty: 'Obstetrics & Gynecology', rating: 4.7, available: false, nextSlot: 'Tomorrow, 9:00 AM', avatarColor: 'bg-pink-500', bio: 'OB-GYN focused on maternal care, prenatal screening, and high-risk pregnancy.' },
  { id: 'p4', name: 'Dr. Ibrahim Touré', specialty: 'Pediatrics', rating: 4.6, available: true, nextSlot: 'Today, 6:00 PM', avatarColor: 'bg-sky-500', bio: 'Pediatrician with expertise in child development and infectious disease.' },
  { id: 'p5', name: 'Dr. Lena Petrova', specialty: 'Mental Health', rating: 4.9, available: true, nextSlot: 'Today, 3:15 PM', avatarColor: 'bg-violet-500', bio: 'Psychiatrist and therapist specializing in anxiety, depression, and stress management.' },
  { id: 'p6', name: 'Dr. Kwame Mensah', specialty: 'Emergency Medicine', rating: 4.8, available: true, nextSlot: 'Available now', avatarColor: 'bg-orange-500', bio: 'Emergency physician available for urgent triage and rapid consultation.' },
];

// --- Health articles ---

export interface HealthArticle {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  readTime: string;
  icon: string;
}

export const HEALTH_ARTICLES: HealthArticle[] = [
  {
    id: 'a1',
    title: '5 Signs of Hypertension You Shouldn\'t Ignore',
    category: 'Cardiovascular',
    excerpt: 'High blood pressure often has no symptoms, but these warning signs warrant a check-up.',
    content: 'Hypertension is called the "silent killer" because it rarely produces symptoms until it causes serious damage. Watch for persistent headaches, dizziness, shortness of breath, nosebleeds, and vision changes. Regular blood pressure monitoring is the most reliable way to catch it early. If your readings consistently exceed 140/90 mmHg, consult a healthcare provider. Lifestyle changes — reducing salt, increasing physical activity, managing stress — can significantly lower your risk.',
    readTime: '4 min',
    icon: 'heart',
  },
  {
    id: 'a2',
    title: 'Recognizing Early Preeclampsia Warning Signs',
    category: 'Maternal Care',
    excerpt: 'Preeclampsia can develop quickly during pregnancy. Know what to watch for.',
    content: 'Preeclampsia is a serious pregnancy complication characterized by high blood pressure and signs of damage to organs, often the liver and kidneys. It typically begins after 20 weeks of pregnancy. Key warning signs include severe headaches, vision changes (blurriness, light sensitivity), upper abdominal pain, and sudden swelling of the face and hands. If you experience any of these, seek medical attention immediately. Regular prenatal check-ups and blood pressure monitoring are essential for early detection.',
    readTime: '5 min',
    icon: 'baby',
  },
  {
    id: 'a3',
    title: 'Managing Stress for Better Heart Health',
    category: 'Mental Wellness',
    excerpt: 'Chronic stress directly impacts your cardiovascular system. Here\'s how to break the cycle.',
    content: 'Chronic stress raises cortisol and adrenaline, which over time increase blood pressure, inflammation, and the risk of heart disease. Practical strategies: practice deep breathing for 5 minutes daily, maintain a consistent sleep schedule, limit caffeine, and build in micro-breaks throughout your day. Even 10 minutes of mindful walking can lower stress hormones. Tracking your mood and stress levels over time helps you identify patterns and triggers.',
    readTime: '3 min',
    icon: 'brain',
  },
  {
    id: 'a4',
    title: 'Understanding Blood Oxygen Levels',
    category: 'Respiratory',
    excerpt: 'What your SpO2 reading means and when to be concerned.',
    content: 'Blood oxygen saturation (SpO2) measures how much oxygen your blood is carrying. Normal levels are 95–100%. Readings between 90–94% warrant medical attention, and below 90% is a medical emergency. Low SpO2 can indicate respiratory infections, asthma, COPD, or other lung conditions. If you have a pulse oximeter at home, monitor trends rather than single readings. Persistent low readings should always be evaluated by a healthcare professional.',
    readTime: '3 min',
    icon: 'lungs',
  },
  {
    id: 'a5',
    title: 'Preventive Care Checklist for Every Age',
    category: 'Preventive Care',
    excerpt: 'Essential screenings and habits that keep you healthy at every stage of life.',
    content: 'Preventive care is your first line of defense. In your 20s–30s: annual physical, blood pressure check, dental exam, and mental health screening. In your 40s: add cholesterol and blood sugar screening. In your 50s+: add cancer screenings (colonoscopy, mammogram), bone density, and vision exams. Vaccinations should be kept up to date throughout life. The most powerful preventive habits remain universal: don\'t smoke, stay active, eat whole foods, and sleep 7–9 hours.',
    readTime: '6 min',
    icon: 'shield',
  },
  {
    id: 'a6',
    title: 'Hereditary Conditions: What Your Family Tree Tells You',
    category: 'Family Health',
    excerpt: 'Mapping your family\'s health history can reveal hidden risks and guide preventive care.',
    content: 'A family health history is one of the most powerful predictive tools in medicine. Conditions like hypertension, type 2 diabetes, sickle cell trait, certain cancers, and heart disease often run in families. If a close relative has been diagnosed, your own risk increases. Document conditions for parents, grandparents, and siblings. Share this information with your healthcare provider — it can guide which screenings you need and when to start them. Genetic marker testing can further refine your risk profile.',
    readTime: '5 min',
    icon: 'tree',
  },
  {
    id: 'a7',
    title: 'Daily Habits That Strengthen Your Immune System',
    category: 'Wellness',
    excerpt: 'Small, consistent choices that help your body fight off illness.',
    content: 'Your immune system thrives on consistency. Prioritize 7–9 hours of sleep — sleep deprivation directly suppresses immune function. Eat a rainbow of fruits and vegetables for antioxidants and vitamins. Stay hydrated; even mild dehydration affects immune cell transport. Moderate exercise (30 minutes daily) boosts circulation of immune cells. Manage stress through breathing or meditation. And don\'t forget hand hygiene — simple soap and water remains one of the most effective preventive tools.',
    readTime: '4 min',
    icon: 'shield',
  },
];

// --- Hereditary conditions for family tree ---

export const HEREDITARY_CONDITIONS = [
  'Hypertension', 'Type 2 Diabetes', 'Sickle Cell Trait', 'Breast Cancer', 'Prostate Cancer',
  'Heart Disease', 'Asthma', 'Stroke', 'Alzheimer\'s', 'Thyroid Disorder',
  'Kidney Disease', 'Liver Disease', 'Epilepsy', 'Mental Health Condition',
];

export const DNA_MARKERS = [
  'BRCA1', 'BRCA2', 'APOE-e4', 'MTHFR', 'HFE (Hereditary Hemochromatosis)',
  'Sickle Cell (HBB)', 'Factor V Leiden', 'Lynch Syndrome (MLH1/MSH2)',
  'Familial Hypercholesterolemia (LDLR)', 'Alpha-1 Antitrypsin (SERPINA1)',
];