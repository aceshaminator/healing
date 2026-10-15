import React, { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useI18n } from '../i18n/I18nProvider';
import { getEmergencyNumber } from '../i18n/regions';

interface Appointment {
  id: string;
  doctorName: string;
  specialty: string;
  date: string; // YYYY-MM-DD
  time: string; // "14:30", older entries may hold text like "2:00 PM" or "TBD"
  location: string;
  notes: string;
}

interface AppointmentTrackerProps {
  onBack?: () => void;
}

type TFn = (key: string, vars?: Record<string, string | number>) => string;

// Older versions added this sample appointment for everyone. It is hidden.
function isSample(a: Appointment) {
  return a.id === '1' && a.doctorName === 'Dr. Sarah Chen' && a.specialty === 'Ophthalmology';
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function parseDate(iso: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}

function todayStart(): Date {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
}

function daysFromToday(iso: string): number | null {
  const d = parseDate(iso);
  if (!d) return null;
  return Math.round((d.getTime() - todayStart().getTime()) / 86400000);
}

// Dates and times follow the app language.
function showDate(iso: string, lang: string): string {
  const d = parseDate(iso);
  if (!d) return iso;
  const o: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
  try {
    return d.toLocaleDateString(lang, o);
  } catch {
    return d.toLocaleDateString(undefined, o);
  }
}

function parseTime(value: string): { h: number; m: number } | null {
  const s = value.trim();
  let m = /^(\d{1,2}):(\d{2})$/.exec(s);
  if (m) {
    const h = Number(m[1]);
    const mi = Number(m[2]);
    return h < 24 && mi < 60 ? { h, m: mi } : null;
  }
  m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(s);
  if (m) {
    const h12 = Number(m[1]);
    const mi = Number(m[2]);
    if (h12 < 1 || h12 > 12 || mi > 59) return null;
    return { h: (h12 % 12) + (m[3].toUpperCase() === 'PM' ? 12 : 0), m: mi };
  }
  return null;
}

function showTime(value: string, lang: string): string {
  const p = parseTime(value);
  if (!p) return value;
  const d = new Date();
  d.setHours(p.h, p.m, 0, 0);
  const o: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit' };
  try {
    return d.toLocaleTimeString(lang, o);
  } catch {
    return d.toLocaleTimeString(undefined, o);
  }
}

function whenLabel(a: Appointment, t: TFn): string {
  const diff = daysFromToday(a.date);
  if (diff === null) return '';
  if (diff === 0) return t('apt.when.today');
  if (diff === 1) return t('apt.when.tomorrow');
  if (diff > 1) return t('apt.when.in', { n: diff });
  return diff === -1 ? t('apt.when.yesterday') : t('apt.when.ago', { n: -diff });
}

function icsEscape(s: string) {
  return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

function ymd(d: Date) {
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
}

// Makes a calendar file (.ics). Opening it adds the appointment, with alarms, to the phone's calendar.
function downloadReminder(a: Appointment, t: TFn): boolean {
  const day = parseDate(a.date);
  if (!day) return false;
  const tm = parseTime(a.time);
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Healing by VisionAce//EN',
    'BEGIN:VEVENT',
    `UID:${a.id}@healing`,
    `DTSTAMP:${stamp}`,
  ];
  if (tm) {
    const start = new Date(day.getFullYear(), day.getMonth(), day.getDate(), tm.h, tm.m);
    const end = new Date(day.getFullYear(), day.getMonth(), day.getDate(), tm.h + 1, tm.m);
    const f = (d: Date) => `${ymd(d)}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
    lines.push(`DTSTART:${f(start)}`, `DTEND:${f(end)}`);
  } else {
    const next = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1);
    lines.push(`DTSTART;VALUE=DATE:${ymd(day)}`, `DTEND;VALUE=DATE:${ymd(next)}`);
  }
  lines.push(`SUMMARY:${icsEscape(t('apt.ics.summary', { name: a.doctorName }))}`);
  if (a.location) lines.push(`LOCATION:${icsEscape(a.location)}`);
  if (a.notes) lines.push(`DESCRIPTION:${icsEscape(a.notes)}`);
  const triggers = tm ? ['-P1D', '-PT2H'] : ['-PT15H'];
  triggers.forEach((tr) =>
    lines.push('BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${icsEscape(t('apt.ics.alarm'))}`, `TRIGGER:${tr}`, 'END:VALARM'),
  );
  lines.push('END:VEVENT', 'END:VCALENDAR');

  try {
    const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'appointment.ics';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  } catch {
    return false;
  }
}

const fieldClass =
  'min-h-[44px] w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-400 focus:border-emerald-400 focus:outline-none';

export function AppointmentTracker({ onBack }: AppointmentTrackerProps) {
  const { t, lang } = useI18n();
  const emergencyNumber = getEmergencyNumber();
  const [rawAppointments, setAppointments] = useLocalStorage<Appointment[]>('healing_appointments', []);
  const appointments = rawAppointments.filter((a) => !isSample(a));

  const [doctorName, setDoctorName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleAddAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorName.trim()) {
      setError(t('apt.err.name'));
      return;
    }
    if (!parseDate(date)) {
      setError(t('apt.err.date'));
      return;
    }
    setError('');

    const newAppointment: Appointment = {
      id: Date.now().toString(),
      doctorName: doctorName.trim(),
      specialty: specialty.trim(),
      date,
      time,
      location: location.trim(),
      notes: notes.trim(),
    };

    setAppointments([...appointments, newAppointment]);
    setDoctorName('');
    setSpecialty('');
    setDate('');
    setTime('');
    setLocation('');
    setNotes('');
    setMessage(t('apt.saved'));
  };

  const handleDelete = (apt: Appointment) => {
    if (window.confirm(t('apt.confirm.delete', { name: apt.doctorName, date: showDate(apt.date, lang) }))) {
      setAppointments(appointments.filter((a) => a.id !== apt.id));
    }
  };

  const handleReminder = (apt: Appointment) => {
    setMessage(downloadReminder(apt, t) ? t('apt.cal.ok') : t('apt.cal.fail'));
  };

  const sorted = [...appointments].sort((a, b) => a.date.localeCompare(b.date));
  const upcoming = sorted.filter((a) => (daysFromToday(a.date) ?? -1) >= 0);
  const past = sorted.filter((a) => (daysFromToday(a.date) ?? -1) < 0).reverse();

  const renderCard = (apt: Appointment, isUpcoming: boolean) => {
    const when = whenLabel(apt, t);
    const dateText = showDate(apt.date, lang);
    return (
      <div key={apt.id} className="space-y-3 rounded-xl border border-slate-700 bg-slate-900 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-base font-bold text-slate-100">{apt.doctorName}</h4>
              {apt.specialty && (
                <span className="rounded-full border border-slate-600 bg-slate-800 px-2 py-0.5 text-xs text-slate-200">
                  {apt.specialty}
                </span>
              )}
              {when && (
                <span
                  className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${
                    isUpcoming
                      ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-200'
                      : 'border-slate-600 text-slate-300'
                  }`}
                >
                  {when}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm font-medium text-emerald-300">
              {apt.time ? t('apt.line.time', { date: dateText, time: showTime(apt.time, lang) }) : dateText}
              {apt.location ? ` • ${apt.location}` : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleDelete(apt)}
            aria-label={t('apt.delete.aria', { name: apt.doctorName })}
            className="min-h-[44px] min-w-[44px] rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-red-300"
          >
            ✕
          </button>
        </div>

        {apt.notes && (
          <p className="rounded-md border border-slate-700 bg-slate-950/60 p-2.5 text-sm text-slate-100">{apt.notes}</p>
        )}

        {isUpcoming && (
          <button
            type="button"
            onClick={() => handleReminder(apt)}
            className="min-h-[44px] rounded-lg border border-slate-500 bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-700"
          >
            {t('apt.cal.btn')}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between rounded-2xl border border-slate-700 bg-slate-900 p-6">
        <div>
          <h2 className="text-xl font-bold text-white">{t('apt.title')}</h2>
          <p className="mt-1 text-sm text-slate-300">{t('apt.sub')}</p>
        </div>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="min-h-[44px] rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-sm font-semibold text-slate-200 transition-colors hover:bg-slate-700"
          >
            &larr; {t('common.back')}
          </button>
        )}
      </div>

      <div className="space-y-2 rounded-2xl border border-amber-400/40 bg-amber-400/10 p-4 text-sm leading-relaxed text-amber-100">
        <p>{t('apt.notice.1')}</p>
        <p>{t('apt.notice.2', { number: emergencyNumber })}</p>
        <a href={`tel:${emergencyNumber}`} className="inline-flex min-h-[44px] items-center font-bold underline">
          {t('sos.call', { number: emergencyNumber })}
        </a>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Form Column */}
        <div className="h-fit rounded-2xl border border-slate-700 bg-slate-900 p-5">
          <h3 className="mb-4 text-sm font-semibold text-emerald-300">{t('apt.form.title')}</h3>
          <form onSubmit={handleAddAppointment} noValidate className="space-y-4">
            <div>
              <label htmlFor="apt-name" className="mb-1 block text-sm text-slate-200">
                {t('apt.doctor')}
              </label>
              <input
                id="apt-name"
                type="text"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                placeholder={t('apt.doctor.ph')}
                className={fieldClass}
              />
            </div>

            <div>
              <label htmlFor="apt-specialty" className="mb-1 block text-sm text-slate-200">
                {t('apt.specialty')}
              </label>
              <input
                id="apt-specialty"
                type="text"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                placeholder={t('apt.specialty.ph')}
                className={fieldClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="apt-date" className="mb-1 block text-sm text-slate-200">
                  {t('apt.date')}
                </label>
                <input
                  id="apt-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={fieldClass}
                />
              </div>
              <div>
                <label htmlFor="apt-time" className="mb-1 block text-sm text-slate-200">
                  {t('apt.time')}
                </label>
                <input
                  id="apt-time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className={fieldClass}
                />
              </div>
            </div>

            <div>
              <label htmlFor="apt-location" className="mb-1 block text-sm text-slate-200">
                {t('apt.place')}
              </label>
              <input
                id="apt-location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={t('apt.place.ph')}
                className={fieldClass}
              />
            </div>

            <div>
              <label htmlFor="apt-notes" className="mb-1 block text-sm text-slate-200">
                {t('apt.notes')}
              </label>
              <textarea
                id="apt-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('apt.notes.ph')}
                rows={3}
                className={`${fieldClass} resize-none`}
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-amber-200">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="min-h-[48px] w-full rounded-lg bg-emerald-500 py-2 text-sm font-bold text-slate-950 transition-colors hover:bg-emerald-400"
            >
              {t('apt.save')}
            </button>
          </form>
        </div>

        {/* Appointments List Column */}
        <div className="space-y-5 lg:col-span-2">
          {message && (
            <p role="status" className="rounded-xl border border-slate-600 bg-slate-950 p-3 text-sm text-slate-100">
              {message}
            </p>
          )}

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-200">{t('apt.upcoming', { count: upcoming.length })}</h3>
            {upcoming.length === 0 ? (
              <div className="rounded-2xl border border-slate-700 bg-slate-900 p-8 text-center text-sm text-slate-300">
                {t('apt.upcoming.empty')}
              </div>
            ) : (
              upcoming.map((a) => renderCard(a, true))
            )}
          </div>

          {past.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-200">{t('apt.past', { count: past.length })}</h3>
              {past.map((a) => renderCard(a, false))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AppointmentTracker;