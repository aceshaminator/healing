export interface VitalLog {
  id: string;
  date: string;
  symptoms: string[];
  notes?: string;
}

export interface RelativeCondition {
  relation: string;
  condition: string;
}

export interface CaregiverInfo {
  name: string;
  email: string;
  phone: string;
}
// --- Types used by lib/assessment.ts ---

export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';

export type MoodLevel = 'great' | 'good' | 'okay' | 'low' | 'poor';

export interface SignalReading {
  heartRate?: number | null;
  temperature?: number | null;
  spo2?: number | null;
  systolic?: number | null;
  diastolic?: number | null;
  respiratoryRate?: number | null;
  glucose?: number | null;
}

export interface SymptomQuestion {
  id: string;
  category: string;
  question: string;
  description: string;
  weight: number;
  severe?: boolean;
}

export interface Provider {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  available: boolean;
  nextSlot: string;
  avatarColor: string;
  bio: string;
}