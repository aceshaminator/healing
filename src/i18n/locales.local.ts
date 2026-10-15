import type { Dictionary } from './locales';

// Translations supplied for the 16 emergency lines.
// They are DRAFTS until a native speaker and a health professional have checked them.
// Lines marked REVIEW are questions for the reviewer.

// French replaces the earlier draft for these 16 lines.
export const FR_CORE: Dictionary = {
  'lang.title': "Choisissez votre langue",
  'country.title': "Choisissez votre pays",
  'country.help': "Cela affiche le bon numéro d'urgence.",
  'country.other': "Autre / non listé",
  'country.own': "Votre numéro d'urgence local",
  'country.number': "Numéro d'urgence : {number}",
  'country.invalid': "Entrez 2 à 6 chiffres.",
  'common.continue': "Continuer",
  'common.skip': "Passer pour l'instant",
  'welcome.title': "Bienvenue sur Healing",
  'welcome.enter': "Entrer dans le portail Healing →",
  'sos.title': "SOS URGENCE",
  'sos.message':
    "Appuyez sur le bouton rouge pour appeler le {number} maintenant. Si vous avez appuyé sur SOS par erreur, fermez cette fenêtre.",
  'sos.call': "Appeler le {number} maintenant",
  'sos.close': "Fermer",
  'sos.unset':
    "Votre numéro d'urgence n'est pas défini. Le 112 fonctionne sur de nombreux téléphones dans de nombreux pays, mais pas partout. Définissez votre numéro dans les Paramètres.",
};

export const IG: Dictionary = {
  // REVIEW: is "Yọrọ" the right word for "choose"? I would expect "Họrọ".
  'lang.title': "Yọrọ asụsụ gị",
  'country.title': "Yọrọ ala gị",
  'country.help': "Nke a na-egosi nọmba mberede kwesịrị ekwesị.",
  'country.other': "Ọzọ / edepụtaghị ya",
  'country.own': "Nọmba mberede ala gị",
  'country.number': "Nọmba mberede: {number}",
  // REVIEW: "Fanye dijit": is this the natural way to say "enter digits"?
  'country.invalid': "Fanye dijit 2 ruo 6.",
  'common.continue': "Gaa n'ihu",
  // REVIEW: does "Gbanahụ" mean "skip"?
  'common.skip': "Gbanahụ maka ugbua",
  'welcome.title': "Nnọọ na Healing",
  // REVIEW: does "Kpọtụrụ" mean "enter"? I would expect "Banye".
  'welcome.enter': "Kpọtụrụ Portul Healing →",
  'sos.title': "MBEREDE SOS",
  // REVIEW (important): "mụrụ anya Uhie" for "red" (capital U in the middle of a sentence), "Efọkọrọ na" for "if",
  // and "na mberede" can read as "in an emergency" instead of "by mistake". This sentence is for people who pressed SOS by mistake.
  'sos.message':
    "Kpatụ bọtịnụ mụrụ anya Uhie ka ịkpọọ {number} ugbua. Efọkọrọ na ị pịrị SOS na mberede, mmechie windo a.",
  'sos.call': "Kpọọ {number} ugbua",
  // REVIEW: "Mmechie" is a noun. A button usually uses a command ("Mechie").
  'sos.close': "Mmechie",
  'sos.unset':
    "Edobeghị nọmba mberede gị. 112 na-arụ ọrụ n'ọtụtụ ekwentị n'ọtụtụ ala, mana ọ bụghị ebe niile. Dozie nọmba gị na Nhọrọ (Settings).",
};

export const YO: Dictionary = {
  // REVIEW: "Aṣayan ..." means "your language choice" (a noun). Should it be a command like "Yan ..."?
  'lang.title': "Aṣayan ede rẹ",
  'country.title': "Aṣayan orilẹ-ede rẹ",
  'country.help': "Eyi n fi nọmba pajawiri tó tọ han.",
  'country.other': "Omiran / ti kò sí lori àtẹ",
  'country.own': "Nọmba pajawiri adugbo rẹ",
  'country.number': "Nọmba pajawiri: {number}",
  // REVIEW: "kọdù" for "digits"?
  'country.invalid': "Tẹ kọdù lati ori meji si mẹfa (2 - 6).",
  'common.continue': "Tẹsiwaju",
  // REVIEW: "Fò ó da lẹẹkan na" for "Skip for now" is unclear to me.
  'common.skip': "Fò ó da lẹẹkan na",
  // REVIEW: should "Ẹ ku abọ" be "Ẹ káàbọ̀"?
  'welcome.title': "Ẹ ku abọ si Healing",
  'welcome.enter': "Wọlé sí Inú Portal Healing →",
  'sos.title': "PAJAWIRI SOS",
  // REVIEW: "pẹlu" adds "also / too" at the end. Is that intended?
  'sos.message':
    "Tẹ bọtini pupa yii lati pe {number} ni bayi. Ti o ba tẹ SOS fún àṣìṣe, pa ferese yii pẹlu.",
  'sos.call': "Pe {number} ni bayi",
  // REVIEW: "Ti i pa" for the "Close" button?
  'sos.close': "Ti i pa",
  'sos.unset':
    "A kò tii ṣeto nọmba pajawiri rẹ. 112 n ṣiṣẹ lori ọpọlọpọ foonu ni ọpọlọpọ orilẹ-ede, ṣugbọn kii ṣe gbogbo ibi. Ṣeto nọmba rẹ ni Ibi Ṣeto (Settings).",
};

export const HA: Dictionary = {
  // REVIEW: "-ka" addresses a man and "yankinku" below is plural. Choose one form that suits all users.
  'lang.title': "Zaɓi harshenka",
  'country.title': "Zaɓi ƙasarka",
  'country.help': "Wannan yana nuna lambar gaggawa da ta dace.",
  'country.other': "Wani / ba a jera ba",
  'country.own': "Lambar gaggawa ta yankinku",
  'country.number': "Lambar gaggawa: {number}",
  'country.invalid': "Shigar da lambobi 2 zuwa 6.",
  'common.continue': "Ci gaba",
  'common.skip': "Tsallake a yanzu",
  'welcome.title': "Barka da zuwa Healing",
  'welcome.enter': "Shiga Shafin Healing →",
  'sos.title': "GAGGAWA TA SOS",
  'sos.message':
    "Taɓa jan maɓallin don kiran {number} yanzu. Idan ka danna SOS ta kuskure, rufe wannan shafin.",
  'sos.call': "Kira {number} yanzu",
  'sos.close': "Rufe",
  // REVIEW: is "Tsara-tsara" the word phones use for "Settings"? Some phones may say "Saituna".
  'sos.unset':
    "Ba a saita lambar gaggawarka ba. Lambar 112 tana aiki a wayoyi da yawa a ƙasashe da yawa, amma ba ko'ina ba. Saita lambarka a Tsara-tsara (Settings).",
};