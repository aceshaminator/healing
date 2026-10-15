import type { Dictionary } from './locales';

// Health checks (pulse, steadiness, readings). French is a DRAFT: a native speaker and a health professional must check it.

export const VIT_EN: Dictionary = {
  'vit.title': 'Health checks',
  'vit.intro':
    'Optional checks you choose to run. Nothing is sent anywhere, and no photos or video are saved. Only the numbers are kept on this device. Results are screening signals, not diagnoses.',
  'vit.consent':
    'I understand these checks do not diagnose anything and I will see a doctor for proper medical tests. I allow Healing to use my camera and motion sensors when I start a check.',
  'vit.cancel': 'Cancel',
  'vit.urgent.title': 'This reading may need urgent care.',
  'vit.urgent.body': 'If you feel unwell, get medical help now.',
  'vit.result.title': 'Your result',
  'vit.quality.fair': 'The signal was only fair. Treat this number as rough and try again.',
  'vit.viewcharts': 'View vital charts',
  'vit.pulse.title': 'Fingertip pulse',
  'vit.pulse.text':
    'Sit and rest for a minute. Cover the back camera and flash with a fingertip, press gently, and hold still for {seconds} seconds.',
  'vit.pulse.start': 'Start pulse check',
  'vit.motion.title': 'Hand steadiness',
  'vit.motion.text':
    'Hold your phone out with both hands and keep still for {seconds} seconds. It measures how much your hands move, and compares best with your own earlier tests.',
  'vit.motion.start': 'Start steadiness test',
  'vit.manual.title': 'Enter a reading yourself',
  'vit.manual.text': 'Use numbers from a blood pressure monitor, a thermometer or a clinic visit. Fill in what you have.',
  'vit.f.pulse': 'Pulse (bpm)',
  'vit.f.pulse.ph': 'e.g. 72',
  'vit.f.temp': 'Temperature (°C)',
  'vit.f.temp.ph': 'e.g. 36.8',
  'vit.f.sys': 'Blood pressure, top',
  'vit.f.sys.ph': 'e.g. 120',
  'vit.f.dia': 'Blood pressure, bottom',
  'vit.f.dia.ph': 'e.g. 80',
  'vit.save': 'Save reading',
  'vit.err.camera.secure':
    'The camera needs a secure (https) connection. Open Healing from its https address and try again.',
  'vit.err.camera.denied': 'Camera permission was not given, so the scan cannot run.',
  'vit.err.camera.start': 'Could not start the camera.',
  'vit.err.camera.frames': 'This browser cannot read camera frames.',
  'vit.err.noclear':
    'We could not get a clear reading. Rest for a minute, keep your finger still and covering both the lens and the flash, then try again.',
  'vit.err.motion.secure':
    'Motion sensors need a secure (https) connection. Open Healing from its https address and try again.',
  'vit.err.motion.none': 'This device does not report motion. Try on a phone.',
  'vit.err.motion.denied': 'Motion permission was not given, so the test cannot run.',
  'vit.err.motion.notenough':
    'This device did not report enough motion data. Laptops and some browsers cannot run this test. Try on a phone.',
  'vit.err.manual.empty': 'Enter at least one value.',
  'vit.err.manual.bp': 'Enter both blood pressure numbers, or leave both empty.',
  'vit.err.manual.range': 'One of the values looks out of range. Please check it.',
  'vit.err.manual.order': 'The top blood pressure number should be higher than the bottom one.',
  'vit.hint.cover': 'Cover the camera lens and flash fully with your fingertip. Press gently.',
  'vit.hint.still': 'Hold still and breathe normally...',
  'vit.hint.motion.prep': 'Hold your phone out in front of you with both hands and keep still. Starting in 3 seconds...',
  'vit.hint.motion.rec': 'Recording. Keep still...',
  'vit.seeDoctor':
    'This is a screening signal, not a diagnosis. Only a doctor and proper medical tests can tell what is going on. The ranges used here are for adults. Please see a doctor, especially if you feel unwell, whatever this result says.',
  'vit.note.pulse.low':
    'Pulse {pulse} bpm is below the usual resting range of 60 to 100. This can be normal for very fit people, but it can also point to a heart or other problem.',
  'vit.note.pulse.high':
    'Pulse {pulse} bpm is above the usual resting range of 60 to 100. Exercise, fever, stress, caffeine and illness can all raise it.',
  'vit.note.pulse.ok': 'Pulse {pulse} bpm is within the usual resting range of 60 to 100, if you were resting.',
  'vit.note.pulse.camera':
    'Phone camera pulse readings can be off by several beats. Rest for a minute and repeat the check, or count your pulse by hand for 30 seconds and double it.',
  'vit.note.bp.veryhigh': 'Blood pressure {s}/{d} is very high.',
  'vit.note.bp.high': 'Blood pressure {s}/{d} is in the high range. Please have it checked by a clinician.',
  'vit.note.bp.low': 'Blood pressure {s}/{d} is low. If you feel dizzy or faint, get care.',
  'vit.note.bp.elevated':
    'Blood pressure {s}/{d} is a little above the ideal of under 120/80. One reading does not confirm anything. Rest, measure again later, and mention it at your next check-up.',
  'vit.note.bp.ok': 'Blood pressure {s}/{d} is in the usual range. One reading is not enough to judge your health.',
  'vit.note.temp.extreme': 'Temperature {temp}°C is well outside the usual range.',
  'vit.note.temp.fever': 'Temperature {temp}°C is a fever.',
  'vit.note.temp.ok': 'Temperature {temp}°C is within the usual range of about 36 to 37.5°C.',
  'vit.note.move':
    'Movement index {movement}. This number is most useful for comparing with your own earlier tests, not against other people.',
  'vit.note.move.tremor':
    'A clear movement rhythm of {hz} Hz showed up, in the range where hand tremor usually appears (about 4 to 12 Hz). Caffeine, tiredness and stress can cause this too. If you notice shaking in daily life, tell a doctor.',
  'vit.note.move.slow':
    'A clear movement rhythm of {hz} Hz showed up, which is slower than typical hand tremor and is often just body sway.',
  'vit.note.move.none': 'No single clear movement rhythm was found in this test.',
};

export const VIT_FR: Dictionary = {
  'vit.title': 'Contrôles de santé',
  'vit.intro':
    'Contrôles facultatifs que vous choisissez de lancer. Rien n’est envoyé nulle part, et aucune photo ni vidéo n’est enregistrée. Seuls les chiffres sont conservés sur cet appareil. Les résultats sont des signaux de dépistage, pas des diagnostics.',
  'vit.consent':
    'Je comprends que ces contrôles ne posent aucun diagnostic et que je consulterai un médecin pour de vrais examens médicaux. J’autorise Healing à utiliser mon appareil photo et mes capteurs de mouvement quand je lance un contrôle.',
  'vit.cancel': 'Annuler',
  'vit.urgent.title': 'Cette mesure peut nécessiter des soins urgents.',
  'vit.urgent.body': 'Si vous vous sentez mal, demandez de l’aide médicale maintenant.',
  'vit.result.title': 'Votre résultat',
  'vit.quality.fair': 'Le signal n’était que moyen. Considérez ce chiffre comme approximatif et recommencez.',
  'vit.viewcharts': 'Voir les courbes',
  'vit.pulse.title': 'Pouls au doigt',
  'vit.pulse.text':
    'Asseyez-vous et reposez-vous une minute. Couvrez l’appareil photo arrière et le flash avec le bout du doigt, appuyez doucement et restez immobile pendant {seconds} secondes.',
  'vit.pulse.start': 'Lancer la mesure du pouls',
  'vit.motion.title': 'Stabilité de la main',
  'vit.motion.text':
    'Tenez votre téléphone devant vous à deux mains et restez immobile pendant {seconds} secondes. Cela mesure à quel point vos mains bougent, et se compare surtout à vos propres tests précédents.',
  'vit.motion.start': 'Lancer le test de stabilité',
  'vit.manual.title': 'Saisir une mesure vous-même',
  'vit.manual.text':
    'Utilisez des chiffres d’un tensiomètre, d’un thermomètre ou d’une consultation. Remplissez ce que vous avez.',
  'vit.f.pulse': 'Pouls (battements/min)',
  'vit.f.pulse.ph': 'Ex. : 72',
  'vit.f.temp': 'Température (°C)',
  'vit.f.temp.ph': 'Ex. : 36,8',
  'vit.f.sys': 'Tension, chiffre du haut',
  'vit.f.sys.ph': 'Ex. : 120',
  'vit.f.dia': 'Tension, chiffre du bas',
  'vit.f.dia.ph': 'Ex. : 80',
  'vit.save': 'Enregistrer la mesure',
  'vit.err.camera.secure':
    'L’appareil photo nécessite une connexion sécurisée (https). Ouvrez Healing depuis son adresse https et réessayez.',
  'vit.err.camera.denied':
    'L’accès à l’appareil photo n’a pas été autorisé, la mesure ne peut donc pas être lancée.',
  'vit.err.camera.start': 'Impossible de démarrer l’appareil photo.',
  'vit.err.camera.frames': 'Ce navigateur ne peut pas lire les images de l’appareil photo.',
  'vit.err.noclear':
    'Nous n’avons pas obtenu de mesure claire. Reposez-vous une minute, gardez le doigt immobile en couvrant à la fois l’objectif et le flash, puis réessayez.',
  'vit.err.motion.secure':
    'Les capteurs de mouvement nécessitent une connexion sécurisée (https). Ouvrez Healing depuis son adresse https et réessayez.',
  'vit.err.motion.none': 'Cet appareil ne signale pas les mouvements. Essayez sur un téléphone.',
  'vit.err.motion.denied':
    'L’accès aux capteurs de mouvement n’a pas été autorisé, le test ne peut donc pas être lancé.',
  'vit.err.motion.notenough':
    'Cet appareil n’a pas fourni assez de données de mouvement. Les ordinateurs portables et certains navigateurs ne peuvent pas faire ce test. Essayez sur un téléphone.',
  'vit.err.manual.empty': 'Saisissez au moins une valeur.',
  'vit.err.manual.bp': 'Saisissez les deux chiffres de la tension, ou laissez les deux vides.',
  'vit.err.manual.range': 'Une des valeurs semble hors limites. Veuillez la vérifier.',
  'vit.err.manual.order': 'Le chiffre du haut de la tension doit être plus grand que celui du bas.',
  'vit.hint.cover': 'Couvrez entièrement l’objectif et le flash avec le bout du doigt. Appuyez doucement.',
  'vit.hint.still': 'Restez immobile et respirez normalement...',
  'vit.hint.motion.prep':
    'Tenez votre téléphone devant vous à deux mains et restez immobile. Début dans 3 secondes...',
  'vit.hint.motion.rec': 'Enregistrement. Restez immobile...',
  'vit.seeDoctor':
    'Ceci est un signal de dépistage, pas un diagnostic. Seuls un médecin et de vrais examens médicaux peuvent dire ce qui se passe. Les valeurs utilisées ici sont celles des adultes. Veuillez consulter un médecin, surtout si vous vous sentez mal, quel que soit ce résultat.',
  'vit.note.pulse.low':
    'Un pouls de {pulse} battements/min est en dessous de la plage habituelle au repos, de 60 à 100. Cela peut être normal chez les personnes très sportives, mais cela peut aussi indiquer un problème cardiaque ou autre.',
  'vit.note.pulse.high':
    'Un pouls de {pulse} battements/min est au-dessus de la plage habituelle au repos, de 60 à 100. L’effort, la fièvre, le stress, la caféine et la maladie peuvent tous l’augmenter.',
  'vit.note.pulse.ok':
    'Un pouls de {pulse} battements/min est dans la plage habituelle au repos, de 60 à 100, si vous étiez au repos.',
  'vit.note.pulse.camera':
    'Les mesures du pouls avec l’appareil photo du téléphone peuvent se tromper de plusieurs battements. Reposez-vous une minute et recommencez, ou comptez votre pouls à la main pendant 30 secondes et multipliez par deux.',
  'vit.note.bp.veryhigh': 'La tension {s}/{d} est très élevée.',
  'vit.note.bp.high': 'La tension {s}/{d} est dans la zone élevée. Faites-la contrôler par un soignant.',
  'vit.note.bp.low': 'La tension {s}/{d} est basse. Si vous avez des vertiges ou un malaise, demandez des soins.',
  'vit.note.bp.elevated':
    'La tension {s}/{d} est un peu au-dessus de l’idéal, inférieur à 120/80. Une seule mesure ne confirme rien. Reposez-vous, mesurez de nouveau plus tard et parlez-en lors de votre prochain contrôle.',
  'vit.note.bp.ok':
    'La tension {s}/{d} est dans la plage habituelle. Une seule mesure ne suffit pas pour juger de votre santé.',
  'vit.note.temp.extreme': 'Une température de {temp} °C est très en dehors de la plage habituelle.',
  'vit.note.temp.fever': 'Une température de {temp} °C correspond à de la fièvre.',
  'vit.note.temp.ok': 'Une température de {temp} °C est dans la plage habituelle, d’environ 36 à 37,5 °C.',
  'vit.note.move':
    'Indice de mouvement {movement}. Ce chiffre est surtout utile pour se comparer à vos propres tests précédents, pas à d’autres personnes.',
  'vit.note.move.tremor':
    'Un rythme de mouvement net de {hz} Hz est apparu, dans la plage où apparaît habituellement le tremblement de la main (environ 4 à 12 Hz). La caféine, la fatigue et le stress peuvent aussi le provoquer. Si vous remarquez des tremblements dans la vie de tous les jours, parlez-en à un médecin.',
  'vit.note.move.slow':
    'Un rythme de mouvement net de {hz} Hz est apparu, plus lent qu’un tremblement de main typique, et c’est souvent simplement un balancement du corps.',
  'vit.note.move.none': 'Aucun rythme de mouvement net n’a été trouvé pendant ce test.',
};