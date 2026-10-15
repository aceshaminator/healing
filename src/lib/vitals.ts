export type VitalReading = {
  id: number;
  date: string;
  source: 'fingertip' | 'motion' | 'manual';
  pulse?: number;
  systolic?: number;
  diastolic?: number;
  tempC?: number;
  movement?: number;
  rhythmHz?: number;
};

const KEY = 'healing_vitals';

export const SEE_DOCTOR =
  'This is a screening signal, not a diagnosis. Only a doctor and proper medical tests can tell what is going on. The ranges used here are for adults. Please see a doctor, especially if you feel unwell, whatever this result says.';

export function loadVitals(): VitalReading[] {
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function addVital(r: Omit<VitalReading, 'id' | 'date'>): VitalReading {
  const full: VitalReading = { id: Date.now(), date: new Date().toISOString(), ...r };
  try {
    localStorage.setItem(KEY, JSON.stringify([full, ...loadVitals()].slice(0, 500)));
  } catch {
    /* storage unavailable: the reading is still shown on screen */
  }
  return full;
}

export function clearVitals() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

export function notesFor(r: VitalReading): { notes: string[]; urgent: boolean } {
  const notes: string[] = [];
  let urgent = false;

  if (r.pulse !== undefined) {
    if (r.pulse < 60) {
      notes.push(
        `Pulse ${r.pulse} bpm is below the usual resting range of 60 to 100. This can be normal for very fit people, but it can also point to a heart or other problem.`,
      );
    } else if (r.pulse > 100) {
      notes.push(
        `Pulse ${r.pulse} bpm is above the usual resting range of 60 to 100. Exercise, fever, stress, caffeine and illness can all raise it.`,
      );
    } else {
      notes.push(`Pulse ${r.pulse} bpm is within the usual resting range of 60 to 100, if you were resting.`);
    }
    if (r.source === 'fingertip' && (r.pulse < 60 || r.pulse > 100)) {
      notes.push(
        'Phone camera pulse readings can be off by several beats. Rest for a minute and repeat the check, or count your pulse by hand for 30 seconds and double it.',
      );
    }
    if (r.pulse < 40 || r.pulse > 130) urgent = true;
  }

  if (r.systolic !== undefined && r.diastolic !== undefined) {
    const s = r.systolic;
    const d = r.diastolic;
    if (s >= 180 || d >= 120) {
      notes.push(`Blood pressure ${s}/${d} is very high.`);
      urgent = true;
    } else if (s >= 140 || d >= 90) {
      notes.push(`Blood pressure ${s}/${d} is in the high range. Please have it checked by a clinician.`);
    } else if (s < 90 || d < 60) {
      notes.push(`Blood pressure ${s}/${d} is low. If you feel dizzy or faint, get care.`);
    } else if (s >= 130 || d >= 80) {
      notes.push(
        `Blood pressure ${s}/${d} is a little above the ideal of under 120/80. One reading does not confirm anything. Rest, measure again later, and mention it at your next check-up.`,
      );
    } else {
      notes.push(`Blood pressure ${s}/${d} is in the usual range. One reading is not enough to judge your health.`);
    }
  }

  if (r.tempC !== undefined) {
    if (r.tempC >= 39.5 || r.tempC < 35) {
      notes.push(`Temperature ${r.tempC}°C is well outside the usual range.`);
      urgent = true;
    } else if (r.tempC >= 38) {
      notes.push(`Temperature ${r.tempC}°C is a fever.`);
    } else {
      notes.push(`Temperature ${r.tempC}°C is within the usual range of about 36 to 37.5°C.`);
    }
  }

  if (r.movement !== undefined) {
    notes.push(
      `Movement index ${r.movement}. This number is most useful for comparing with your own earlier tests, not against other people.`,
    );
    if (r.rhythmHz !== undefined && r.rhythmHz >= 4 && r.rhythmHz <= 12) {
      notes.push(
        `A clear movement rhythm of ${r.rhythmHz} Hz showed up, in the range where hand tremor usually appears (about 4 to 12 Hz). Caffeine, tiredness and stress can cause this too. If you notice shaking in daily life, tell a doctor.`,
      );
    } else if (r.rhythmHz !== undefined && r.rhythmHz > 0) {
      notes.push(
        `A clear movement rhythm of ${r.rhythmHz} Hz showed up, which is slower than typical hand tremor and is often just body sway.`,
      );
    } else {
      notes.push('No single clear movement rhythm was found in this test.');
    }
  }

  return { notes, urgent };
}

type Sample = { t: number; v: number };

function resample(samples: Sample[], hz: number): number[] {
  const out: number[] = [];
  if (samples.length < 2) return out;
  const t0 = samples[0].t;
  const t1 = samples[samples.length - 1].t;
  const step = 1000 / hz;
  let j = 0;
  for (let t = t0; t <= t1; t += step) {
    while (j < samples.length - 2 && samples[j + 1].t < t) j++;
    const a = samples[j];
    const b = samples[j + 1];
    const span = b.t - a.t || 1;
    const f = Math.min(1, Math.max(0, (t - a.t) / span));
    out.push(a.v + (b.v - a.v) * f);
  }
  return out;
}

function movingAverage(x: number[], w: number): number[] {
  const n = x.length;
  const pre = new Array<number>(n + 1).fill(0);
  for (let i = 0; i < n; i++) pre[i + 1] = pre[i] + x[i];
  const h = Math.floor(w / 2);
  return x.map((_, i) => {
    const a = Math.max(0, i - h);
    const b = Math.min(n, i + h + 1);
    return (pre[b] - pre[a]) / (b - a);
  });
}

export function estimatePulse(samples: Sample[]): { bpm: number; quality: 'good' | 'fair' } | null {
  if (samples.length < 100) return null;
  const hz = 30;
  const sig = resample(samples, hz);
  if (sig.length < hz * 10) return null;

  const trend = movingAverage(sig, 45);
  const hp = sig.map((v, i) => v - trend[i]);
  const sm = movingAverage(hp, 5);
  const mean = sm.reduce((a, b) => a + b, 0) / sm.length;
  const std = Math.sqrt(sm.reduce((a, b) => a + (b - mean) ** 2, 0) / sm.length);
  if (std < 1e-6) return null;

  const minGap = Math.round(0.35 * hz);
  const peaks: number[] = [];
  for (let i = 2; i < sm.length - 2; i++) {
    const v = sm[i];
    if (v > 0.3 * std && v >= sm[i - 1] && v >= sm[i + 1] && v >= sm[i - 2] && v >= sm[i + 2]) {
      const last = peaks[peaks.length - 1];
      if (last === undefined || i - last >= minGap) peaks.push(i);
      else if (v > sm[last]) peaks[peaks.length - 1] = i;
    }
  }

  const intervals: number[] = [];
  for (let i = 1; i < peaks.length; i++) intervals.push((peaks[i] - peaks[i - 1]) / hz);
  const valid = intervals.filter((x) => x >= 0.4 && x <= 1.5);
  if (valid.length < 8) return null;

  const sorted = [...valid].sort((a, b) => a - b);
  const med = sorted[Math.floor(sorted.length / 2)];
  const close = valid.filter((x) => Math.abs(x - med) / med <= 0.2).length;
  const share = close / intervals.length;
  if (share < 0.6) return null;

  return { bpm: Math.round(60 / med), quality: share >= 0.8 ? 'good' : 'fair' };
}

// A rhythm is only reported when one frequency clearly stands out from the rest.
// rhythmHz is 0 when no single rhythm dominates.
const RHYTHM_DOMINANCE = 0.25;

export function analyzeMotion(samples: Sample[]): { movement: number; rhythmHz: number } | null {
  if (samples.length < 100) return null;
  const hz = 50;
  const sig = resample(samples, hz);
  if (sig.length < hz * 8) return null;

  const trend = movingAverage(sig, 25);
  const hp = sig.map((v, i) => v - trend[i]);
  const n = hp.length;
  const rms = Math.sqrt(hp.reduce((a, b) => a + b * b, 0) / n);

  let bestF = 0;
  let bestP = 0;
  let totalP = 0;
  for (let f = 2; f <= 12; f += 0.25) {
    let re = 0;
    let im = 0;
    for (let i = 0; i < n; i++) {
      const w = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (n - 1));
      const ang = (2 * Math.PI * f * i) / hz;
      re += hp[i] * w * Math.cos(ang);
      im += hp[i] * w * Math.sin(ang);
    }
    const p = re * re + im * im;
    totalP += p;
    if (p > bestP) {
      bestP = p;
      bestF = f;
    }
  }

  const dominance = totalP > 0 ? bestP / totalP : 0;
  return {
    movement: Math.round(rms * 1000) / 10,
    rhythmHz: dominance >= RHYTHM_DOMINANCE ? bestF : 0,
  };
}
export type NoteItem = { key: string; vars?: Record<string, string | number> };

// Same rules as notesFor above, but returns translation keys so the screen can show them in any language.
export function noteItemsFor(r: VitalReading): { items: NoteItem[]; urgent: boolean } {
  const items: NoteItem[] = [];
  let urgent = false;

  if (r.pulse !== undefined) {
    if (r.pulse < 60) items.push({ key: 'vit.note.pulse.low', vars: { pulse: r.pulse } });
    else if (r.pulse > 100) items.push({ key: 'vit.note.pulse.high', vars: { pulse: r.pulse } });
    else items.push({ key: 'vit.note.pulse.ok', vars: { pulse: r.pulse } });
    if (r.source === 'fingertip' && (r.pulse < 60 || r.pulse > 100)) items.push({ key: 'vit.note.pulse.camera' });
    if (r.pulse < 40 || r.pulse > 130) urgent = true;
  }

  if (r.systolic !== undefined && r.diastolic !== undefined) {
    const s = r.systolic;
    const d = r.diastolic;
    const vars = { s, d };
    if (s >= 180 || d >= 120) {
      items.push({ key: 'vit.note.bp.veryhigh', vars });
      urgent = true;
    } else if (s >= 140 || d >= 90) items.push({ key: 'vit.note.bp.high', vars });
    else if (s < 90 || d < 60) items.push({ key: 'vit.note.bp.low', vars });
    else if (s >= 130 || d >= 80) items.push({ key: 'vit.note.bp.elevated', vars });
    else items.push({ key: 'vit.note.bp.ok', vars });
  }

  if (r.tempC !== undefined) {
    const vars = { temp: r.tempC };
    if (r.tempC >= 39.5 || r.tempC < 35) {
      items.push({ key: 'vit.note.temp.extreme', vars });
      urgent = true;
    } else if (r.tempC >= 38) items.push({ key: 'vit.note.temp.fever', vars });
    else items.push({ key: 'vit.note.temp.ok', vars });
  }

  if (r.movement !== undefined) {
    items.push({ key: 'vit.note.move', vars: { movement: r.movement } });
    if (r.rhythmHz !== undefined && r.rhythmHz >= 4 && r.rhythmHz <= 12) {
      items.push({ key: 'vit.note.move.tremor', vars: { hz: r.rhythmHz } });
    } else if (r.rhythmHz !== undefined && r.rhythmHz > 0) {
      items.push({ key: 'vit.note.move.slow', vars: { hz: r.rhythmHz } });
    } else {
      items.push({ key: 'vit.note.move.none' });
    }
  }

  return { items, urgent };
}