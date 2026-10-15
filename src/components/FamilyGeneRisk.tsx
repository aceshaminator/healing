import React, { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useI18n } from '../i18n/I18nProvider';
import { RELATION_OPTIONS, relationKey } from '../i18n/labels';

interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  age: number | string;
  conditions: string;
}

interface FamilyTreeProps {
  onBack?: () => void;
}

// The saved value stays in English underneath. The words on screen are translated.
const STORED_NONE = 'None reported';

function ageNumber(age: number | string): number | null {
  if (typeof age === 'number') return Number.isFinite(age) ? age : null;
  const s = String(age).trim();
  if (s === '') return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

const fieldClass =
  'min-h-[44px] w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-400 focus:border-emerald-400 focus:outline-none';

export function FamilyTree({ onBack }: FamilyTreeProps) {
  const { t } = useI18n();
  const [members, setMembers] = useLocalStorage<FamilyMember[]>('healing_family_members', []);

  const [name, setName] = useState('');
  const [relation, setRelation] = useState('Mother');
  const [age, setAge] = useState('');
  const [conditions, setConditions] = useState('');
  const [formError, setFormError] = useState('');

  const relationLabel = (value: string) => {
    const key = relationKey(value);
    return key ? t(key) : value;
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let ageValue: number | string = 'N/A';
    if (age.trim() !== '') {
      const n = Number(age);
      if (!Number.isFinite(n) || n < 0 || n > 120) {
        setFormError(t('fam.err.age'));
        return;
      }
      ageValue = Math.round(n);
    }
    setFormError('');

    const newMember: FamilyMember = {
      id: Date.now().toString(),
      name: name.trim(),
      relation,
      age: ageValue,
      conditions: conditions.trim() || STORED_NONE,
    };

    setMembers([...members, newMember]);
    setName('');
    setAge('');
    setConditions('');
  };

  const handleDelete = (member: FamilyMember) => {
    if (window.confirm(t('fam.confirm.remove', { name: member.name }))) {
      setMembers(members.filter((m) => m.id !== member.id));
    }
  };

  const handleExportJSON = () => {
    if (!window.confirm(t('fam.confirm.export'))) return;
    const blob = new Blob([JSON.stringify(members, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `family_health_history_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // Opens the phone's print dialog, where you can also choose "Save as PDF".
  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-700 bg-slate-900 p-6">
        <div>
          <h2 className="text-xl font-bold text-white">{t('fam.title')}</h2>
          <p className="mt-1 text-sm text-slate-300">{t('fam.sub')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          {members.length > 0 && (
            <>
              <button
                type="button"
                onClick={handleExportJSON}
                className="min-h-[44px] rounded-lg border border-emerald-500/40 bg-slate-800 px-3 py-1.5 text-sm font-semibold text-emerald-300 transition-colors hover:bg-slate-700"
              >
                {t('fam.export')}
              </button>
              <button
                type="button"
                onClick={handlePrintReport}
                className="min-h-[44px] rounded-lg bg-emerald-500 px-3 py-1.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400"
              >
                {t('fam.print')}
              </button>
            </>
          )}
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
      </div>

      {/* What this is, and what it is not */}
      <div className="space-y-2 rounded-2xl border border-amber-400/40 bg-amber-400/10 p-4 text-sm leading-relaxed text-amber-100 print:hidden">
        <p>{t('fam.note.1')}</p>
        <p>{t('fam.note.2')}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Form Column */}
        <div className="h-fit rounded-2xl border border-slate-700 bg-slate-900 p-5 print:hidden">
          <h3 className="mb-4 text-sm font-semibold text-emerald-300">{t('fam.form.title')}</h3>
          <form onSubmit={handleAddMember} className="space-y-4">
            <div>
              <label htmlFor="fam-name" className="mb-1 block text-sm text-slate-200">
                {t('fam.name')}
              </label>
              <input
                id="fam-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('fam.name.ph')}
                className={fieldClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="fam-relation" className="mb-1 block text-sm text-slate-200">
                  {t('fam.relation')}
                </label>
                <select
                  id="fam-relation"
                  value={relation}
                  onChange={(e) => setRelation(e.target.value)}
                  className={fieldClass}
                >
                  {RELATION_OPTIONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {t(r.key)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="fam-age" className="mb-1 block text-sm text-slate-200">
                  {t('fam.age')}
                </label>
                <input
                  id="fam-age"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={120}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder={t('fam.age.ph')}
                  className={fieldClass}
                />
              </div>
            </div>

            <div>
              <label htmlFor="fam-conditions" className="mb-1 block text-sm text-slate-200">
                {t('fam.conditions')}
              </label>
              <textarea
                id="fam-conditions"
                value={conditions}
                onChange={(e) => setConditions(e.target.value)}
                placeholder={t('fam.conditions.ph')}
                rows={3}
                className={`${fieldClass} resize-none`}
              />
            </div>

            {formError && (
              <p role="alert" className="text-sm text-amber-200">
                {formError}
              </p>
            )}

            <button
              type="submit"
              className="min-h-[48px] w-full rounded-lg bg-emerald-500 py-2 text-sm font-bold text-slate-950 transition-colors hover:bg-emerald-400"
            >
              {t('fam.add')}
            </button>
          </form>
        </div>

        {/* Member Cards Grid */}
        <div className="space-y-3 lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-200">{t('fam.list.title', { count: members.length })}</h3>

          {members.length === 0 ? (
            <div className="rounded-2xl border border-slate-700 bg-slate-900 p-8 text-center text-sm text-slate-300">
              {t('fam.list.empty')}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {members.map((member) => {
                const ageNum = ageNumber(member.age);
                return (
                  <div
                    key={member.id}
                    className="flex flex-col justify-between space-y-2 rounded-xl border border-slate-700 bg-slate-900 p-4"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-base font-bold text-slate-100">{member.name}</h4>
                          <span className="mt-1 inline-block rounded-full bg-slate-800 px-2 py-0.5 text-xs font-medium text-emerald-300">
                            {relationLabel(member.relation)} •{' '}
                            {ageNum !== null ? t('fam.card.age', { age: ageNum }) : t('fam.card.noage')}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDelete(member)}
                          aria-label={t('fam.remove.aria', { name: member.name })}
                          className="min-h-[44px] min-w-[44px] rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-red-300 print:hidden"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="mt-3">
                        <span className="block text-xs font-medium text-slate-300">{t('fam.card.conditions')}</span>
                        <p className="mt-0.5 rounded-md border border-slate-700 bg-slate-950/60 p-2 text-sm text-slate-100">
                          {member.conditions === STORED_NONE ? t('fam.none') : member.conditions}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FamilyTree;