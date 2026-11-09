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
  let saved = false;
  try {
    localStorage.setItem(KEY, JSON.stringify([full, ...loadVitals()].slice(0, 500)));
    saved = true;
  } catch {
    /* storage unavailable: the reading is still shown on screen, and the app warns the person below */
  }
  window.dispatchEvent(new CustomEvent(saved ? 'healing:storage-ok' : 'healing:storage-error', { detail: { key: 'vitals' } }));
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

type PulseAnalysis = {
  result: { bpm: number; quality: 'good' | 'fair' } | null;
  info: string;
};

// How the fingertip pulse is found: the heartbeat makes a tiny, repeating change in the red level.
// Slow drift is much bigger than that change, so instead of looking for single beats we look for
// one repeating rhythm in the 42 to 180 beats a minute range, and require the same rhythm to show
// up in three overlapping stretches of the scan.
const PULSE_HZ = 30;
const BAND_LO = 0.7; // 42 beats a minute
const BAND_HI = 3.0; // 180 beats a minute
const FREQ_STEP = 0.05;
const SETTLE_MS = 3000; // finger settling and camera exposure adjusting
const MIN_CLARITY = 15; // how many times stronger the rhythm must be than the background
const MAX_DRIFT_HZ = 0.1; // how far the three stretches may disagree

function bandSpectrum(x: number[], hz: number): { freqs: number[]; power: number[] } {
  const n = x.length;
  const mean = x.reduce((a, b) => a + b, 0) / n;
  const freqs: number[] = [];
  const power: number[] = [];
  for (let f = BAND_LO; f <= BAND_HI + 1e-9; f += FREQ_STEP) {
    let re = 0;
    let im = 0;
    for (let i = 0; i < n; i++) {
      const w = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (n - 1));
      const ang = (2 * Math.PI * f * i) / hz;
      const v = (x[i] - mean) * w;
      re += v * Math.cos(ang);
      im += v * Math.sin(ang);
    }
    freqs.push(f);
    power.push(re * re + im * im);
  }
  return { freqs, power };
}

// Picks the strongest rhythm. If a rhythm at half that frequency is also strong, the strong one was
// probably the second echo of the heartbeat, so the slower one is used.
function pickRhythm(freqs: number[], power: number[]): { f: number; clarity: number } {
  let k = 0;
  for (let i = 1; i < power.length; i++) if (power[i] > power[k]) k = i;
  let f = freqs[k];
  const half = f / 2;
  if (half >= BAND_LO) {
    let m = -1;
    for (let i = 0; i < freqs.length; i++) {
      if (Math.abs(freqs[i] - half) <= 0.1 && (m < 0 || power[i] > power[m])) m = i;
    }
    if (m >= 0 && power[m] >= 0.5 * power[k]) {
      k = m;
      f = freqs[m];
    }
  }
  const rest = power.filter((_, i) => Math.abs(freqs[i] - f) > 0.2).sort((a, b) => a - b);
  const background = rest.length ? rest[Math.floor(rest.length / 2)] : 0;
  let peak = 0;
  for (let i = 0; i < freqs.length; i++) if (Math.abs(freqs[i] - f) <= 0.05) peak = Math.max(peak, power[i]);
  return { f, clarity: background > 0 ? peak / background : 0 };
}

// Cleans the red-level trace: skips the settling seconds, keeps only the changes from frame to
// frame (which removes slow drift), and clips sudden jolts.
function pulseTrace(samples: Sample[]): number[] {
  if (samples.length < 2) return [];
  const t0 = samples[0].t;
  const settled = samples.filter((s) => s.t - t0 >= SETTLE_MS);
  const sig = resample(settled, PULSE_HZ);
  if (sig.length < 10) return [];
  const smooth = movingAverage(sig, 3);
  const diff: number[] = [];
  for (let i = 1; i < smooth.length; i++) diff.push(smooth[i] - smooth[i - 1]);
  const sorted = [...diff].sort((a, b) => a - b);
  const med = sorted[Math.floor(sorted.length / 2)];
  const dev = diff.map((v) => Math.abs(v - med)).sort((a, b) => a - b);
  const sigma = Math.max(1.4826 * dev[Math.floor(dev.length / 2)], 1e-6);
  return diff.map((v) => Math.max(-4 * sigma, Math.min(4 * sigma, v)));
}

function analyzePulse(samples: Sample[]): PulseAnalysis {
  if (samples.length < 100) return { result: null, info: `only ${samples.length} frames` };
  const x = pulseTrace(samples);
  if (x.length < PULSE_HZ * 12) {
    return { result: null, info: `too little steady signal (${Math.round(x.length / PULSE_HZ)}s after settling)` };
  }

  const full = bandSpectrum(x, PULSE_HZ);
  const main = pickRhythm(full.freqs, full.power);

  const win = PULSE_HZ * 10;
  const gap = Math.floor((x.length - win) / 2);
  const seen: number[] = [];
  for (let s = 0; s < 3; s++) {
    const part = x.slice(s * gap, s * gap + win);
    const sp = bandSpectrum(part, PULSE_HZ);
    seen.push(pickRhythm(sp.freqs, sp.power).f);
  }
  const bpmOf = (f: number) => Math.round(f * 60);
  const spread = Math.max(...seen.map((f) => Math.abs(f - main.f)));
  const info = `rhythm ${bpmOf(main.f)} per min, clarity ${main.clarity.toFixed(1)}, windows ${seen.map(bpmOf).join('/')}`;

  if (main.f < BAND_LO + 0.1 || main.f > BAND_HI - 0.1) {
    return { result: null, info: `${info}; rhythm at the edge of the range, probably not a heartbeat` };
  }
  if (main.clarity < MIN_CLARITY) {
    return { result: null, info: `${info}; no clear rhythm (clarity needs ${MIN_CLARITY} or more)` };
  }
  if (spread > MAX_DRIFT_HZ) {
    return { result: null, info: `${info}; the rhythm changed during the scan` };
  }

  return {
    result: { bpm: bpmOf(main.f), quality: main.clarity >= 25 && spread <= 0.07 ? 'good' : 'fair' },
    info,
  };
}

export function estimatePulse(samples: Sample[]): { bpm: number; quality: 'good' | 'fair' } | null {
  return analyzePulse(samples).result;
}

// Plain-language note on why a scan did or did not give a pulse. Used by the test mode only.
export function explainPulse(samples: Sample[]): string {
  return analyzePulse(samples).info;
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