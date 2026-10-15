import type { Dictionary } from './locales';

// The merged symptom flow. French is a DRAFT: a native speaker and a health professional must check it.

export const SICK_EN: Dictionary = {
  'mod.sickflow': 'Check my symptoms',
  'sick.tab.new': 'New check',
  'sick.tab.history': 'My history ({count})',
  'sick.step1': 'What are you feeling?',
  'sick.tap': 'Tap everything that applies.',
  'sick.other.label': 'Anything else? Type it, or tap the microphone and say it.',
  'sick.other.ph': 'e.g. pain in my knee, cough at night',
  'sick.step2': 'How bad, and for how long?',
  'sick.saved': '✓ Saved in your history.',
  'sick.pregnant.link': 'Pregnant? Check the pregnancy warning signs →',
  'sick.history.empty': 'Nothing saved yet. Your checks will appear here.',
  'sick.item.checkin': 'Check-in',
  'sick.item.voice': 'Voice note',
  'sick.fever.tag': 'Fever',
  'sick.note.moderate':
    'A moderate symptom deserves close monitoring. If it gets worse or does not improve, see a doctor.',
  'sick.view.history': 'View my history',
};

export const SICK_FR: Dictionary = {
  'mod.sickflow': 'Vérifier mes symptômes',
  'sick.tab.new': 'Nouveau contrôle',
  'sick.tab.history': 'Mon historique ({count})',
  'sick.step1': 'Que ressentez-vous ?',
  'sick.tap': 'Touchez tout ce qui correspond.',
  'sick.other.label': 'Autre chose ? Écrivez-le, ou touchez le microphone et dites-le.',
  'sick.other.ph': 'Ex. : douleur au genou, toux la nuit',
  'sick.step2': 'À quel point, et depuis combien de temps ?',
  'sick.saved': '✓ Enregistré dans votre historique.',
  'sick.pregnant.link': 'Enceinte ? Vérifiez les signes d’alerte de la grossesse →',
  'sick.history.empty': 'Rien d’enregistré pour le moment. Vos contrôles apparaîtront ici.',
  'sick.item.checkin': 'Bilan',
  'sick.item.voice': 'Note vocale',
  'sick.fever.tag': 'Fièvre',
  'sick.note.moderate':
    'Un symptôme modéré mérite une surveillance attentive. S’il s’aggrave ou ne s’améliore pas, consultez un médecin.',
  'sick.view.history': 'Voir mon historique',
};