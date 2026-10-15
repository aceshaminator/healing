import type { Dictionary } from './locales';

// Health information, Outbreak information, Talk to a doctor, and the menu frame.
// French is a DRAFT: a native speaker and a health professional must check it.
// The seven health articles are rewritten here. A doctor must check them before real use.

export const INFO_EN: Dictionary = {
  'info.title': 'Health information',
  'info.sub':
    'General information, not medical advice. It is not about your own health, so ask a doctor about your own situation.',
  'info.news.title': 'Latest from official sources',
  'info.news.check': 'Check now',
  'info.news.checking': 'Checking...',
  'info.news.notset': 'News updates are not set up yet. Use the official sources below for the latest information.',
  'info.news.disclaimer':
    'These are headlines from official sources. Healing does not choose what is important or check the details, and an item here does not mean there is an outbreak near you. If you feel unwell, see a doctor or call',
  'info.news.ncdc': 'For questions about infectious diseases, you can call NCDC on',
  'info.news.srclang': 'Headlines and summaries are shown in the language of the official source.',
  'info.news.errsaved': 'Could not update. Showing the news saved on this phone from {when}.',
  'info.news.errnone': 'Could not load the news. Check your internet connection and try again.',
  'info.news.updated': 'List updated {updated}. Checked on this phone {checked}.',
  'info.news.stale':
    'This list has not been updated for {days} days, so newer news may be missing. Check the official sources below.',
  'info.filter.all': 'All',
  'info.filter.outbreak': 'Outbreak reports',
  'info.filter.empty': 'No outbreak reports in the current list.',
  'info.badge.outbreak': 'Outbreak report',
  'info.badge.news': 'News',
  'info.source': 'Source: {name}',
  'info.read.official': 'Read on the official site ↗',
  'info.nodate': 'Date not given',
  'info.unknown': 'unknown',
  'info.basics': 'Health basics (works offline)',
  'info.read': 'Read',
  'info.close': 'Close',
  'info.official.title': 'Official sources',
  'info.official.help': 'These links open official websites in your browser and need an internet connection.',
  'info.src.ncdc.name': 'Nigeria Centre for Disease Control (NCDC)',
  'info.src.ncdc.desc':
    "Nigeria's national public health institute: outbreak updates and guidance on infectious diseases. Its toll-free line is 6232.",
  'info.src.whonews.name': 'World Health Organization: news',
  'info.src.whonews.desc': 'Announcements and new guidance from the World Health Organization.',
  'info.src.whotopics.name': 'World Health Organization: health topics',
  'info.src.whotopics.desc': 'Plain explanations of diseases and health conditions, from A to Z.',
  'info.src.medline.name': 'MedlinePlus',
  'info.src.medline.desc': 'Plain-language health information from the US National Library of Medicine.',

  'art.cat.cardio': 'Cardiovascular',
  'art.cat.maternal': 'Maternal care',
  'art.cat.mental': 'Mental wellness',
  'art.cat.resp': 'Respiratory',
  'art.cat.prev': 'Preventive care',
  'art.cat.family': 'Family health',
  'art.cat.well': 'Wellness',
  'art.a1.title': 'High blood pressure: why you should get it measured',
  'art.a1.excerpt': 'High blood pressure often causes no symptoms, so the only way to know is to measure it.',
  'art.a1.content':
    'High blood pressure is often called the "silent killer" because most people with it feel nothing until it causes serious damage. Severe headaches, chest pain, trouble breathing, confusion or vision changes can mean the pressure is dangerously high and need urgent care, but many people have no warning at all. Regular blood pressure checks are the most reliable way to catch it early. If your readings are often 140/90 or higher, see a health worker or doctor. Eating less salt, being more active and managing stress can help lower it.',
  'art.a2.title': 'Warning signs of preeclampsia in pregnancy',
  'art.a2.excerpt': 'Preeclampsia can develop quickly during pregnancy. Know the warning signs.',
  'art.a2.content':
    'Preeclampsia is a serious complication of pregnancy. It involves high blood pressure and can harm both the mother and the baby. It usually starts after 20 weeks of pregnancy. Warning signs are a severe headache that will not go away, blurred vision or flashing lights, pain in the upper belly under the ribs, and sudden swelling of the face or hands. If you have any of these, get medical help straight away. Regular antenatal check-ups and blood pressure checks are the best way to find it early.',
  'art.a3.title': 'Managing stress for a healthier heart',
  'art.a3.excerpt': 'Long-term stress can affect your body, including your heart. Small daily habits can help.',
  'art.a3.content':
    'Long-term stress can raise blood pressure and make heart problems more likely. Some habits that may help: slow breathing for a few minutes each day, a regular sleep routine, less caffeine, and short breaks during the day. A short walk can help you feel calmer. Writing down your mood and what triggers stress can help you notice patterns. If stress or low mood is affecting your daily life, talk to a health worker or someone you trust.',
  'art.a4.title': 'Understanding blood oxygen levels',
  'art.a4.excerpt': 'What an oxygen reading (SpO2) means and when to worry.',
  'art.a4.content':
    'Blood oxygen saturation (SpO2) shows how much oxygen your blood is carrying. A normal reading is usually 95 to 100 percent. A reading of 90 to 94 percent needs medical advice, and below 90 percent can be an emergency, especially with trouble breathing. Low readings can come from chest infections, asthma, lung disease and other problems. Cold fingers or nail polish can give a wrong reading. If you have a pulse oximeter at home, look at the trend and not a single reading, and get medical help if readings stay low or you feel short of breath.',
  'art.a5.title': 'Preventive care checklist for every age',
  'art.a5.excerpt': 'Check-ups and habits that help keep you healthy at every stage of life.',
  'art.a5.content':
    'Preventive care means looking after your health before problems start. The checks you need depend on your age, your family history and what is available where you live, so ask a health worker what is right for you. In general, adults should have their blood pressure checked regularly, and blood sugar and cholesterol checks become more important with age. Cancer screening, for example for breast and bowel cancer, usually starts in middle age. Keep your vaccinations up to date. Habits that help at every age: do not smoke, stay active, eat plenty of vegetables and whole foods, and get enough sleep.',
  'art.a6.title': 'Family health history: what your relatives can tell you',
  'art.a6.excerpt': 'Knowing which conditions run in your family can help your doctor guide your check-ups.',
  'art.a6.content':
    'Some conditions, such as high blood pressure, diabetes, sickle cell trait, certain cancers and heart disease, often run in families. If a close relative has one, your own chance of having it can be higher. Write down the conditions you know about in your parents, grandparents, brothers and sisters, and show the list to your doctor. It can help them decide which check-ups you need and when to start them. Ask your relatives before you record their health.',
  'art.a7.title': 'Daily habits that help your body stay well',
  'art.a7.excerpt': 'Small, steady choices that support your health.',
  'art.a7.content':
    'Small habits help your body stay well. Aim for 7 to 9 hours of sleep, because poor sleep can weaken your defences. Eat a variety of fruits and vegetables. Drink enough clean water. Moderate exercise, such as 30 minutes of brisk walking on most days, is good for your heart and mood. Manage stress with slow breathing or quiet time. Wash your hands with soap and clean water, especially before eating and after using the toilet. Keeping your vaccinations up to date is one of the best ways to prevent illness.',

  'out.title': 'Outbreak information',
  'out.sub': 'Healing cannot detect disease outbreaks, and it does not show any outbreak data.',
  'out.p':
    'A real outbreak alert needs verified reports from health workers, collected by a health authority. A phone app cannot work that out by itself, so this screen shows no alerts. For real information, use an official source:',
  'out.ncdc.text': 'Ask about infectious diseases, and find official updates and guidance.',
  'out.ncdc.call': 'Call {phone} (toll-free)',
  'out.ncdc.whatsapp': 'WhatsApp {phone}',
  'out.ncdc.open': 'Open ncdc.gov.ng',
  'out.who.title': 'World Health Organization, Africa',
  'out.who.text':
    'Regional news and emergency reports. Also ask your local clinic or health worker about illnesses in your area.',
  'out.who.open': 'Open afro.who.int',
  'out.ill.title': 'If you or someone near you is seriously ill',
  'out.ill.body': "Don't wait for information. Go to the nearest clinic or hospital, or call {number}.",

  'doc.title': 'Talk to a doctor',
  'doc.sub': 'Video consultations with licensed doctors are not available yet.',
  'doc.emerg.title': 'In an emergency',
  'doc.emerg.body': 'Do not wait for this app. Call emergency services or go to the nearest hospital.',
  'doc.own.title': 'See your own doctor',
  'doc.own.body':
    'Share your latest check-ins with a doctor or clinic you already use, by WhatsApp, SMS or email.',
  'doc.share': 'Share my latest check-ins',
  'doc.share.title': 'My Healing check-ins',
  'doc.share.none': 'No check-in has been saved yet.',
  'doc.share.copied': 'Summary copied. Paste it into a message to your doctor.',
  'doc.share.fail1': 'Could not open the share sheet.',
  'doc.share.fail2': 'Could not copy the summary on this device.',
  'doc.summary': 'Make a full summary for my doctor',

  'host.fail.title': 'This screen could not open.',
  'host.fail.body': 'The rest of Healing is not affected.',
  'host.fail.ok': 'OK',
  'host.notfound': '{name} was not found.',
  'host.noopen': '{name} could not be opened.',
  'host.noload': '{name} could not be loaded.',
  'app.storage.title': 'Your latest changes could not be saved on this phone.',
  'app.storage.body':
    'Storage may be full, or blocked in this browser. Open Settings, then Backup and export, to save a copy of your records now.',
  'app.offline': 'No internet connection. Healing still works, and your records are on this phone.',
  'app.offlineReady': '✓ Ready to work with no internet.',
  };

export const INFO_FR: Dictionary = {
  'info.title': 'Informations santé',
  'info.sub':
    'Informations générales, pas des conseils médicaux. Elles ne concernent pas votre propre santé : demandez à un médecin pour votre situation.',
  'info.news.title': 'Dernières informations des sources officielles',
  'info.news.check': 'Vérifier maintenant',
  'info.news.checking': 'Vérification...',
  'info.news.notset':
    'Les actualités ne sont pas encore configurées. Utilisez les sources officielles ci-dessous pour les dernières informations.',
  'info.news.disclaimer':
    'Ce sont des titres provenant de sources officielles. Healing ne choisit pas ce qui est important et ne vérifie pas les détails, et un élément affiché ici ne signifie pas qu’il y a une épidémie près de chez vous. Si vous vous sentez mal, consultez un médecin ou appelez le',
  'info.news.ncdc': 'Pour toute question sur les maladies infectieuses, vous pouvez appeler le NCDC au',
  'info.news.srclang': 'Les titres et résumés sont affichés dans la langue de la source officielle.',
  'info.news.errsaved': 'Mise à jour impossible. Affichage des actualités enregistrées sur ce téléphone le {when}.',
  'info.news.errnone': 'Impossible de charger les actualités. Vérifiez votre connexion internet et réessayez.',
  'info.news.updated': 'Liste mise à jour le {updated}. Vérifiée sur ce téléphone le {checked}.',
  'info.news.stale':
    'Cette liste n’a pas été mise à jour depuis {days} jours, il peut donc manquer des actualités récentes. Consultez les sources officielles ci-dessous.',
  'info.filter.all': 'Tout',
  'info.filter.outbreak': 'Alertes épidémiques',
  'info.filter.empty': 'Aucune alerte épidémique dans la liste actuelle.',
  'info.badge.outbreak': 'Alerte épidémique',
  'info.badge.news': 'Actualité',
  'info.source': 'Source : {name}',
  'info.read.official': 'Lire sur le site officiel ↗',
  'info.nodate': 'Date non indiquée',
  'info.unknown': 'inconnue',
  'info.basics': 'Notions de santé (fonctionne hors ligne)',
  'info.read': 'Lire',
  'info.close': 'Fermer',
  'info.official.title': 'Sources officielles',
  'info.official.help':
    'Ces liens ouvrent des sites officiels dans votre navigateur et nécessitent une connexion internet.',
  'info.src.ncdc.name': 'Centre nigérian de contrôle des maladies (NCDC)',
  'info.src.ncdc.desc':
    'L’institut national de santé publique du Nigeria : actualités sur les épidémies et conseils sur les maladies infectieuses. Sa ligne gratuite est le 6232.',
  'info.src.whonews.name': 'Organisation mondiale de la santé : actualités',
  'info.src.whonews.desc': 'Annonces et nouvelles recommandations de l’Organisation mondiale de la santé.',
  'info.src.whotopics.name': 'Organisation mondiale de la santé : thèmes de santé',
  'info.src.whotopics.desc': 'Explications simples sur les maladies et les problèmes de santé, de A à Z.',
  'info.src.medline.name': 'MedlinePlus',
  'info.src.medline.desc':
    'Informations de santé en langage simple de la Bibliothèque nationale de médecine des États-Unis.',
  'app.offline': 'Pas de connexion internet. Healing fonctionne toujours, et vos données sont sur ce téléphone.',
  'app.offlineReady': '✓ Prêt à fonctionner sans internet.',
  'art.cat.cardio': 'Cardiovasculaire',
  'art.cat.maternal': 'Santé maternelle',
  'art.cat.mental': 'Bien-être mental',
  'art.cat.resp': 'Respiratoire',
  'art.cat.prev': 'Prévention',
  'art.cat.family': 'Santé familiale',
  'art.cat.well': 'Bien-être',
  'art.a1.title': 'Hypertension : pourquoi il faut mesurer sa tension',
  'art.a1.excerpt':
    'L’hypertension ne cause souvent aucun symptôme : le seul moyen de la repérer est de mesurer la tension.',
  'art.a1.content':
    'L’hypertension est souvent appelée le « tueur silencieux », car la plupart des personnes qui en souffrent ne ressentent rien jusqu’à ce qu’elle cause de graves dégâts. Un fort mal de tête, une douleur à la poitrine, une difficulté à respirer, une confusion ou des troubles de la vision peuvent indiquer une tension dangereusement élevée et nécessitent des soins urgents, mais beaucoup de personnes n’ont aucun signe d’alerte. Mesurer régulièrement la tension est le moyen le plus fiable de la repérer tôt. Si vos mesures sont souvent de 140/90 ou plus, consultez un agent de santé ou un médecin. Manger moins salé, bouger davantage et gérer le stress peuvent aider à la faire baisser.',
  'art.a2.title': 'Signes d’alerte de la pré-éclampsie pendant la grossesse',
  'art.a2.excerpt': 'La pré-éclampsie peut apparaître rapidement pendant la grossesse. Connaissez les signes d’alerte.',
  'art.a2.content':
    'La pré-éclampsie est une complication grave de la grossesse. Elle s’accompagne d’une tension élevée et peut nuire à la mère comme au bébé. Elle commence généralement après 20 semaines de grossesse. Les signes d’alerte sont : un fort mal de tête qui ne passe pas, une vision floue ou des éclairs lumineux, une douleur en haut du ventre, sous les côtes, et un gonflement soudain du visage ou des mains. Si vous avez l’un de ces signes, demandez de l’aide médicale tout de suite. Les consultations prénatales et les contrôles réguliers de la tension sont le meilleur moyen de la repérer tôt.',
  'art.a3.title': 'Gérer le stress pour un cœur en meilleure santé',
  'art.a3.excerpt':
    'Un stress qui dure peut affecter votre corps, y compris votre cœur. De petites habitudes quotidiennes peuvent aider.',
  'art.a3.content':
    'Un stress qui dure peut faire monter la tension et rendre les problèmes de cœur plus probables. Quelques habitudes qui peuvent aider : respirer lentement quelques minutes chaque jour, avoir des horaires de sommeil réguliers, boire moins de caféine et faire de courtes pauses dans la journée. Une courte marche peut aider à se sentir plus calme. Noter votre humeur et ce qui déclenche le stress aide à repérer des habitudes. Si le stress ou le moral bas affecte votre vie quotidienne, parlez-en à un agent de santé ou à une personne de confiance.',
  'art.a4.title': 'Comprendre le taux d’oxygène dans le sang',
  'art.a4.excerpt': 'Ce que signifie une mesure d’oxygène (SpO2) et quand s’inquiéter.',
  'art.a4.content':
    'La saturation en oxygène du sang (SpO2) indique la quantité d’oxygène transportée par votre sang. Une mesure normale est généralement de 95 à 100 pour cent. Une mesure de 90 à 94 pour cent demande un avis médical, et en dessous de 90 pour cent, cela peut être une urgence, surtout avec une difficulté à respirer. Des mesures basses peuvent venir d’infections pulmonaires, d’asthme, de maladies des poumons et d’autres problèmes. Des doigts froids ou du vernis à ongles peuvent donner une mesure fausse. Si vous avez un oxymètre à la maison, regardez l’évolution et pas une seule mesure, et demandez de l’aide médicale si les mesures restent basses ou si vous êtes essoufflé(e).',
  'art.a5.title': 'Liste de prévention pour tous les âges',
  'art.a5.excerpt': 'Des contrôles et des habitudes qui aident à rester en bonne santé à chaque étape de la vie.',
  'art.a5.content':
    'La prévention consiste à prendre soin de sa santé avant que les problèmes ne commencent. Les contrôles utiles dépendent de votre âge, de vos antécédents familiaux et de ce qui est disponible là où vous vivez : demandez à un agent de santé ce qui vous convient. En général, les adultes devraient faire contrôler leur tension régulièrement, et les contrôles de la glycémie et du cholestérol deviennent plus importants avec l’âge. Le dépistage des cancers, par exemple du sein et du côlon, commence généralement à l’âge mûr. Gardez vos vaccins à jour. Des habitudes utiles à tout âge : ne pas fumer, rester actif, manger beaucoup de légumes et d’aliments complets, et dormir suffisamment.',
  'art.a6.title': 'Antécédents familiaux : ce que vos proches peuvent vous apprendre',
  'art.a6.excerpt':
    'Savoir quels problèmes de santé existent dans votre famille peut aider votre médecin à orienter vos contrôles.',
  'art.a6.content':
    'Certains problèmes de santé, comme l’hypertension, le diabète, le trait drépanocytaire, certains cancers et les maladies du cœur, sont souvent présents dans les familles. Si un proche en a un, votre propre risque peut être plus élevé. Notez les problèmes de santé que vous connaissez chez vos parents, vos grands-parents, vos frères et sœurs, et montrez la liste à votre médecin. Cela peut l’aider à décider de quels contrôles vous avez besoin et à partir de quand. Demandez à vos proches avant d’enregistrer leur santé.',
  'art.a7.title': 'Habitudes quotidiennes pour rester en bonne santé',
  'art.a7.excerpt': 'De petits choix réguliers qui soutiennent votre santé.',
  'art.a7.content':
    'De petites habitudes aident votre corps à rester en bonne santé. Visez 7 à 9 heures de sommeil, car un mauvais sommeil peut affaiblir vos défenses. Mangez des fruits et des légumes variés. Buvez suffisamment d’eau propre. Une activité physique modérée, comme 30 minutes de marche rapide la plupart des jours, est bonne pour le cœur et le moral. Gérez le stress par une respiration lente ou un moment de calme. Lavez-vous les mains avec du savon et de l’eau propre, surtout avant de manger et après être allé aux toilettes. Garder ses vaccins à jour est l’un des meilleurs moyens de prévenir les maladies.',

  'out.title': 'Informations sur les épidémies',
  'out.sub': 'Healing ne peut pas détecter les épidémies et n’affiche aucune donnée sur les épidémies.',
  'out.p':
    'Une vraie alerte épidémique nécessite des rapports vérifiés d’agents de santé, rassemblés par une autorité sanitaire. Une application de téléphone ne peut pas le déterminer seule : cet écran n’affiche donc aucune alerte. Pour des informations fiables, utilisez une source officielle :',
  'out.ncdc.text':
    'Posez vos questions sur les maladies infectieuses et trouvez des actualités et des conseils officiels.',
  'out.ncdc.call': 'Appeler le {phone} (gratuit)',
  'out.ncdc.whatsapp': 'WhatsApp {phone}',
  'out.ncdc.open': 'Ouvrir ncdc.gov.ng',
  'out.who.title': 'Organisation mondiale de la santé, Afrique',
  'out.who.text':
    'Actualités régionales et rapports d’urgence. Demandez aussi à votre centre de santé ou à un agent de santé quelles maladies circulent près de chez vous.',
  'out.who.open': 'Ouvrir afro.who.int',
  'out.ill.title': 'Si vous ou une personne près de vous êtes gravement malade',
  'out.ill.body':
    'N’attendez pas d’informations. Rendez-vous au centre de santé ou à l’hôpital le plus proche, ou appelez le {number}.',

  'doc.title': 'Parler à un médecin',
  'doc.sub': 'Les consultations vidéo avec des médecins agréés ne sont pas encore disponibles.',
  'doc.emerg.title': 'En cas d’urgence',
  'doc.emerg.body': 'N’attendez pas cette application. Appelez les secours ou rendez-vous à l’hôpital le plus proche.',
  'doc.own.title': 'Consulter votre propre médecin',
  'doc.own.body':
    'Partagez vos derniers bilans avec un médecin ou un centre de santé que vous connaissez déjà, par WhatsApp, SMS ou e-mail.',
  'doc.share': 'Partager mes derniers bilans',
  'doc.share.title': 'Mes bilans Healing',
  'doc.share.none': 'Aucun bilan n’a encore été enregistré.',
  'doc.share.copied': 'Résumé copié. Collez-le dans un message à votre médecin.',
  'doc.share.fail1': 'Impossible d’ouvrir le partage.',
  'doc.share.fail2': 'Impossible de copier le résumé sur cet appareil.',
  'doc.summary': 'Créer un résumé complet pour mon médecin',

  'host.fail.title': 'Cet écran n’a pas pu s’ouvrir.',
  'host.fail.body': 'Le reste de Healing n’est pas affecté.',
  'host.fail.ok': 'OK',
  'host.notfound': '{name} est introuvable.',
  'host.noopen': '{name} n’a pas pu être ouvert.',
  'host.noload': '{name} n’a pas pu être chargé.',
  'app.storage.title': 'Vos dernières modifications n’ont pas pu être enregistrées sur ce téléphone.',
  'app.storage.body':
    'Le stockage est peut-être plein ou bloqué dans ce navigateur. Ouvrez Paramètres, puis Sauvegarde et export, pour enregistrer une copie de vos données maintenant.',
};