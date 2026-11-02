import type { Dictionary } from './locales';

// PIN lock, privacy, erase, and the new welcome line. French is a DRAFT: a native speaker must check it.

export const NEXT_EN: Dictionary = {
  'welcome.tagline': 'Healing starts with knowing what to do next.',
  'mod.privacy': 'Privacy, PIN and erase',
  'pin.title': 'Healing is locked',
  'pin.sub': 'Enter your PIN to open your records.',
  'pin.label': 'PIN',
  'pin.unlock': 'Unlock',
  'pin.wrong': 'That PIN is not right. Try again.',
  'pin.wait': 'Too many tries. Wait {s} seconds.',
  'pin.emergency': 'Emergency: call {number}',
  'pin.forgot':
    'If you forget your PIN, the only way back in is to erase everything on this phone. Keep a backup file to bring your records back.',
  'priv.title': 'Privacy',
  'priv.saved.title': 'What is saved on this phone',
  'priv.saved.body':
    'Your check-ins, symptoms, readings, medicines, appointments, mood journal, family history, emergency plan and settings. They stay in this browser, and nothing is saved anywhere else.',
  'priv.leaves.title': 'What leaves this phone',
  'priv.leaves.body':
    'Healing does not send your records to any server. The health news list is downloaded from a public news page. Voice typing in Chrome sends your voice to the browser’s speech service to make text; Healing does not keep the sound. A map link, WhatsApp or SMS message is sent only when you press send, and a doctor summary only when you choose to share it.',
  'priv.limits.title': 'Limits you should know',
  'priv.limits.body':
    'Records are not encrypted on the phone. A PIN keeps casual users out, but a determined person with time could get in. Short PINs can be guessed, which is why the app waits after several wrong tries. Clearing your browser data deletes your records. Backup files are not encrypted either, so keep them safe.',
  'priv.pin.title': 'PIN lock',
  'priv.pin.body':
    'When a PIN is set, Healing asks for it after it has been in the background for a minute. The emergency call stays available on the lock screen.',
  'priv.pin.set': 'Set a PIN (4 to 6 digits)',
  'priv.pin.change': 'Change PIN',
  'priv.pin.confirm': 'Type the PIN again',
  'priv.pin.remove': 'Turn off PIN',
  'priv.pin.bad': 'Use 4 to 6 digits.',
  'priv.pin.mismatch': 'The two PINs do not match.',
  'priv.pin.saved': 'PIN saved.',
  'priv.pin.removed': 'PIN turned off.',
  'priv.pin.unsupported': 'A PIN needs a secure (https) address. Open Healing from its https address and try again.',
  'priv.erase.title': 'Erase everything on this phone',
  'priv.erase.body':
    'This deletes every record, setting and the PIN saved by Healing on this phone. It cannot be undone. Export a backup first if you might need your records.',
  'priv.erase.btn': 'Erase everything',
  'priv.erase.word': 'ERASE',
  'priv.erase.type': 'To confirm, type {word} below.',
  'priv.erase.confirm': 'Erase now',
  'priv.erase.cancel': 'Cancel',
  'priv.erase.wrong': 'That word does not match. Nothing was erased.',
};

export const NEXT_FR: Dictionary = {
  'welcome.tagline': 'La guérison commence par savoir quoi faire ensuite.',
  'mod.privacy': 'Confidentialité, code PIN et effacement',
  'pin.title': 'Healing est verrouillé',
  'pin.sub': 'Saisissez votre code PIN pour ouvrir vos données.',
  'pin.label': 'Code PIN',
  'pin.unlock': 'Ouvrir',
  'pin.wrong': 'Ce code PIN n’est pas correct. Réessayez.',
  'pin.wait': 'Trop d’essais. Attendez {s} secondes.',
  'pin.emergency': 'Urgence : appelez le {number}',
  'pin.forgot':
    'Si vous oubliez votre code PIN, la seule façon de revenir est d’effacer tout sur ce téléphone. Gardez un fichier de sauvegarde pour restaurer vos données.',
  'priv.title': 'Confidentialité',
  'priv.saved.title': 'Ce qui est enregistré sur ce téléphone',
  'priv.saved.body':
    'Vos bilans, symptômes, mesures, médicaments, rendez-vous, journal d’humeur, antécédents familiaux, plan d’urgence et réglages. Ils restent dans ce navigateur, et rien n’est enregistré ailleurs.',
  'priv.leaves.title': 'Ce qui quitte ce téléphone',
  'priv.leaves.body':
    'Healing n’envoie vos données à aucun serveur. La liste d’actualités santé est téléchargée depuis une page d’actualités publique. La dictée vocale de Chrome envoie votre voix au service vocal du navigateur pour produire du texte ; Healing ne garde pas le son. Un lien de carte, un message WhatsApp ou SMS n’est envoyé que lorsque vous appuyez sur envoyer, et un résumé pour le médecin seulement si vous choisissez de le partager.',
  'priv.limits.title': 'Limites à connaître',
  'priv.limits.body':
    'Les données ne sont pas chiffrées sur le téléphone. Un code PIN écarte les curieux, mais une personne déterminée et patiente pourrait y accéder. Les codes courts peuvent être devinés, c’est pourquoi l’application attend après plusieurs erreurs. Effacer les données du navigateur supprime vos données. Les fichiers de sauvegarde ne sont pas chiffrés non plus : gardez-les en lieu sûr.',
  'priv.pin.title': 'Verrouillage par code PIN',
  'priv.pin.body':
    'Quand un code PIN est défini, Healing le demande après une minute passée en arrière-plan. L’appel d’urgence reste disponible sur l’écran de verrouillage.',
  'priv.pin.set': 'Définir un code PIN (4 à 6 chiffres)',
  'priv.pin.change': 'Changer le code PIN',
  'priv.pin.confirm': 'Saisissez à nouveau le code PIN',
  'priv.pin.remove': 'Désactiver le code PIN',
  'priv.pin.bad': 'Utilisez 4 à 6 chiffres.',
  'priv.pin.mismatch': 'Les deux codes PIN ne correspondent pas.',
  'priv.pin.saved': 'Code PIN enregistré.',
  'priv.pin.removed': 'Code PIN désactivé.',
  'priv.pin.unsupported':
    'Un code PIN nécessite une adresse sécurisée (https). Ouvrez Healing depuis son adresse https et réessayez.',
  'priv.erase.title': 'Tout effacer sur ce téléphone',
  'priv.erase.body':
    'Cela supprime tous les dossiers, réglages et le code PIN enregistrés par Healing sur ce téléphone. C’est irréversible. Faites d’abord une sauvegarde si vous pourriez avoir besoin de vos données.',
  'priv.erase.btn': 'Tout effacer',
  'priv.erase.word': 'EFFACER',
  'priv.erase.type': 'Pour confirmer, saisissez {word} ci-dessous.',
  'priv.erase.confirm': 'Effacer maintenant',
  'priv.erase.cancel': 'Annuler',
  'priv.erase.wrong': 'Ce mot ne correspond pas. Rien n’a été effacé.',
};