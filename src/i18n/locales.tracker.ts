import type { Dictionary } from './locales';

// Symptom tracker and Voice notes. French is a DRAFT: a native speaker and a health professional must check it.

export const TRK_EN: Dictionary = {
  'trk.title': 'Symptom tracker',
  'trk.sub': 'Log your symptoms so you can show them to a doctor. Saved on this phone only.',
  'trk.form.title': 'Log a symptom',
  'trk.symptom': 'Symptom',
  'trk.symptom.ph': 'e.g. Dizziness, Cough, Headache',
  'trk.err.symptom': 'Enter the symptom name.',
  'trk.severity': 'How bad',
  'trk.duration': 'How long',
  'trk.duration.ph': 'e.g. 30 mins, 2 days',
  'trk.notes': 'Notes or triggers (optional)',
  'trk.notes.ph': 'What you were doing, what makes it better or worse',
  'trk.save': 'Save symptom',
  'trk.disclaimer':
    'This log only records what you tell it, and the messages here only catch some wording. If you feel unwell, see a doctor, whatever this screen says.',
  'trk.history': 'Symptom history ({count})',
  'trk.empty': 'No symptoms logged yet.',
  'trk.duration.line': 'Duration: {duration} • Logged on {date}',
  'trk.unspecified': 'Unspecified',
  'trk.nonotes': 'No additional details.',
  'trk.confirm.delete': 'Delete "{name}" from your history?',
  'trk.delete.aria': 'Delete {name}',
  'adv.worse.title': 'This is worse than the last time you logged it.',
  'adv.worse.body':
    'Keep an eye on it. If it keeps getting worse, or does not improve in a day or two, please see a doctor.',

  'voice.title': 'Voice notes',
  'voice.recording': '● Recording',
  'voice.standby': '○ Standby',
  'voice.intro': 'Speak your symptoms and Healing turns them into text you can edit and save.',
  'voice.privacy':
    "In many browsers, such as Chrome, voice typing sends your voice to the browser's speech service to turn it into text. Healing does not save the audio. If you prefer, type your note in the Daily check-in instead.",
  'voice.unsupported': 'Voice typing is not available in this browser. Try Chrome on your phone.',
  'voice.mic.start': 'Start recording',
  'voice.mic.stop': 'Stop recording',
  'voice.fb.start': 'Tap the microphone to start.',
  'voice.fb.listening': 'Listening... Speak clearly. Tap the button again to stop.',
  'voice.fb.stopping': 'Stopping...',
  'voice.fb.stopped': 'Stopped. Check the text below, fix any mistakes, then save.',
  'voice.fb.saved': 'Saved on this phone.',
  'voice.err.unsupported':
    'Voice typing is not available in this browser. Try Chrome on your phone, or type your check-in instead.',
  'voice.err.secure':
    'The microphone needs a secure (https) connection. Open Healing from its https address and try again.',
  'voice.err.start': 'Could not start the microphone. Please try again.',
  'voice.err.denied': 'The microphone was not allowed. Allow it in your browser settings and try again.',
  'voice.err.nospeech': 'No speech was heard. Try again, closer to the phone.',
  'voice.err.nomic': 'No microphone was found.',
  'voice.err.network': 'Voice typing needs an internet connection in this browser.',
  'voice.err.lang':
    'Voice typing is not available for this language on this phone. Use your keyboard instead: many phones have a microphone key on the keyboard.',
  'voice.err.default': 'Could not use the microphone. Please try again.',
  'voice.err.save':
    'Could not save on this phone. Storage may be full or blocked in this browser. Your text is still here.',
  'voice.crisis.title': 'What you said may be an emergency.',
  'voice.crisis.body':
    "Please don't wait for this app. Call {number} now or go to the nearest hospital emergency room.",
  'voice.crisis.selfharm':
    ' If you might hurt yourself, tell someone near you right now and ask them to stay with you. Helpline numbers are on the Mental Wellness screen.',
  'voice.edit.label': 'Your text (you can edit it)',
  'voice.save': 'Save on this phone',
  'voice.stopToSave': 'Stop recording to save',
  'voice.stored': 'Captured by voice. Severity was not rated by the person.',
};

export const TRK_FR: Dictionary = {
  'trk.title': 'Suivi des symptômes',
  'trk.sub': 'Notez vos symptômes pour pouvoir les montrer à un médecin. Enregistré uniquement sur ce téléphone.',
  'trk.form.title': 'Noter un symptôme',
  'trk.symptom': 'Symptôme',
  'trk.symptom.ph': 'Ex. : vertiges, toux, mal de tête',
  'trk.err.symptom': 'Saisissez le nom du symptôme.',
  'trk.severity': 'Intensité',
  'trk.duration': 'Depuis combien de temps',
  'trk.duration.ph': 'Ex. : 30 minutes, 2 jours',
  'trk.notes': 'Notes ou déclencheurs (facultatif)',
  'trk.notes.ph': 'Ce que vous faisiez, ce qui améliore ou aggrave les symptômes',
  'trk.save': 'Enregistrer le symptôme',
  'trk.disclaimer':
    'Ce suivi enregistre seulement ce que vous indiquez, et les messages ici ne repèrent que certains mots. Si vous vous sentez mal, consultez un médecin, quoi que dise cet écran.',
  'trk.history': 'Historique des symptômes ({count})',
  'trk.empty': 'Aucun symptôme enregistré pour le moment.',
  'trk.duration.line': 'Durée : {duration} • Noté le {date}',
  'trk.unspecified': 'Non précisée',
  'trk.nonotes': 'Aucun détail supplémentaire.',
  'trk.confirm.delete': 'Supprimer « {name} » de votre historique ?',
  'trk.delete.aria': 'Supprimer {name}',
  'adv.worse.title': 'C’est pire que la dernière fois que vous l’avez noté.',
  'adv.worse.body':
    'Surveillez-le. S’il continue de s’aggraver, ou ne s’améliore pas en un jour ou deux, veuillez consulter un médecin.',

  'voice.title': 'Notes vocales',
  'voice.recording': '● Enregistrement',
  'voice.standby': '○ En attente',
  'voice.intro': 'Dites vos symptômes et Healing les transforme en texte que vous pouvez modifier et enregistrer.',
  'voice.privacy':
    'Dans de nombreux navigateurs, comme Chrome, la dictée vocale envoie votre voix au service vocal du navigateur pour la transformer en texte. Healing n’enregistre pas le son. Si vous préférez, écrivez votre note dans le bilan du jour.',
  'voice.unsupported': 'La dictée vocale n’est pas disponible dans ce navigateur. Essayez Chrome sur votre téléphone.',
  'voice.mic.start': 'Démarrer l’enregistrement',
  'voice.mic.stop': 'Arrêter l’enregistrement',
  'voice.fb.start': 'Appuyez sur le microphone pour commencer.',
  'voice.fb.listening': 'J’écoute... Parlez clairement. Appuyez de nouveau sur le bouton pour arrêter.',
  'voice.fb.stopping': 'Arrêt en cours...',
  'voice.fb.stopped': 'Arrêté. Vérifiez le texte ci-dessous, corrigez les erreurs, puis enregistrez.',
  'voice.fb.saved': 'Enregistré sur ce téléphone.',
  'voice.err.unsupported':
    'La dictée vocale n’est pas disponible dans ce navigateur. Essayez Chrome sur votre téléphone, ou écrivez votre bilan à la place.',
  'voice.err.secure':
    'Le microphone nécessite une connexion sécurisée (https). Ouvrez Healing depuis son adresse https et réessayez.',
  'voice.err.start': 'Impossible de démarrer le microphone. Veuillez réessayer.',
  'voice.err.denied':
    'Le microphone n’a pas été autorisé. Autorisez-le dans les paramètres de votre navigateur et réessayez.',
  'voice.err.nospeech': 'Aucune parole détectée. Réessayez en vous rapprochant du téléphone.',
  'voice.err.nomic': 'Aucun microphone trouvé.',
  'voice.err.network': 'La dictée vocale nécessite une connexion internet dans ce navigateur.',
  'voice.err.lang':
    'La dictée vocale n’est pas disponible dans cette langue sur ce téléphone. Utilisez plutôt votre clavier : beaucoup de téléphones ont une touche microphone sur le clavier.',
  'voice.err.default': 'Impossible d’utiliser le microphone. Veuillez réessayer.',
  'voice.err.save':
    'Impossible d’enregistrer sur ce téléphone. Le stockage est peut-être plein ou bloqué dans ce navigateur. Votre texte est toujours là.',
  'voice.crisis.title': 'Ce que vous avez dit peut être une urgence.',
  'voice.crisis.body':
    'N’attendez pas cette application. Appelez le {number} maintenant ou rendez-vous aux urgences de l’hôpital le plus proche.',
  'voice.crisis.selfharm':
    ' Si vous pensez à vous faire du mal, parlez tout de suite à quelqu’un près de vous et demandez-lui de rester avec vous. Les numéros d’aide se trouvent sur l’écran Bien-être mental.',
  'voice.edit.label': 'Votre texte (vous pouvez le modifier)',
  'voice.save': 'Enregistrer sur ce téléphone',
  'voice.stopToSave': 'Arrêtez l’enregistrement pour enregistrer',
  'voice.stored': 'Saisi par la voix. L’intensité n’a pas été évaluée par la personne.',
};