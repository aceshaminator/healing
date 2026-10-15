export type Crisis = 'selfharm' | 'emergency' | null;

// Words that suggest an emergency or thoughts of self-harm, in the languages we have so far (English and French).
// They only catch some wording, and a missing match never means a symptom is safe.

const EMERGENCY: RegExp[] = [
  // English
  /chest (pain|tight)/i,
  /(trouble|difficulty|hard to) breath/i,
  /can'?t breathe/i,
  /short(ness)? of breath/i,
  /seizure|convuls/i,
  /\b(fainted|fainting|collapsed|unconscious)\b/i,
  /(coughing|vomiting) (up )?blood|blood in (my )?stool|black stool/i,
  /sudden (weakness|numbness)|face droop|slurred|can'?t speak|trouble speaking/i,
  /\bstroke\b/i,
  /heavy bleeding/i,
  /swollen (face|tongue|throat)|throat (closing|swelling)/i,
  // French (with and without accents)
  /douleurs? (dans|a|à) la poitrine|poitrine (serr|oppress)/i,
  /(difficult[ée]s?|mal|du mal|peine) (a|à) respirer/i,
  /(ne peux|n'arrive) pas (a|à)? ?respirer|essouffl/i,
  /convuls|crise d'?[ée]pilep/i,
  /[ée]vanou|perte de connaissance|inconscient/i,
  /crach\w* (du )?sang|vomi\w* (du )?sang|sang dans (les )?selles|selles noires/i,
  /h[ée]morragie|saignement (abondant|important)/i,
  /faiblesse soudaine|engourdissement soudain|paralys|visage (qui )?(tombe|affaiss)|difficult[ée] (a|à) parler|parole (brouill|difficile)/i,
  /\bavc\b|accident vasculaire/i,
  /gonfl\w* (du |de la )?(visage|langue|gorge)|gorge (qui )?(se )?(ferme|serre)/i,
];

const SELF_HARM: RegExp[] = [
  // English
  /suicid/i,
  /\bkill(ing)? myself\b/i,
  /\bend(ing)? (it all|my life|my own life)\b/i,
  /\bwant(ed)? to die\b/i,
  /\bi wan die\b/i,
  /\bi no wan live\b/i,
  /\bhurt(ing)? myself\b/i,
  /\bself[- ]?harm/i,
  // French
  /\bme tuer\b/i,
  /envie de mourir|veux mourir|vouloir mourir|en finir avec (la vie|tout)|je veux en finir/i,
  /(me|m') ?faire du mal|me blesser|automutil/i,
  /mettre fin (a|à) (mes jours|ma vie)/i,
];

export function detectCrisis(text: string): Crisis {
  if (SELF_HARM.some((p) => p.test(text))) return 'selfharm';
  if (EMERGENCY.some((p) => p.test(text))) return 'emergency';
  return null;
}