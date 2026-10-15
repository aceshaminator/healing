import { FR_CORE, HA, IG, YO } from './locales.local';
import { INFO_EN, INFO_FR } from './locales.info';
import { NAV_EN, NAV_FR } from './locales.nav';
import { VIT_EN, VIT_FR } from './locales.vitals';
import { PLAN_EN, PLAN_FR } from './locales.plan';
import { CHECKS_EN, CHECKS_FR } from './locales.checks';
import { MAT_EN, MAT_FR } from './locales.maternal';
import { CH_EN, CH_FR } from './locales.charts';
import { TRK_EN, TRK_FR } from './locales.tracker';
import { CARE_EN, CARE_FR } from './locales.care';
import { REC_EN, REC_FR } from './locales.records';
import { SICK_EN, SICK_FR } from './locales.sick';
export type Dictionary = Record<string, string>;

// English is the full set. Every other language may be partial: missing lines show in English.
// The other languages below are DRAFTS. They must be checked by a native speaker and a health
// professional before real people rely on them.

const en: Dictionary = {
  'lang.title': 'Choose your language',
  'country.title': 'Choose your country',
  'country.help': 'This shows the right emergency number.',
  'country.other': 'Other / not listed',
  'country.own': 'Your local emergency number',
  'country.number': 'Emergency number: {number}',
  'country.invalid': 'Enter 2 to 6 digits.',
  'common.continue': 'Continue',
  'common.skip': 'Skip for now',
  'welcome.title': 'Welcome to Healing',
  'welcome.enter': 'Enter Healing Portal →',
  'sos.title': 'EMERGENCY SOS',
  'sos.message': 'Tap the red button to call {number} now. If you pressed SOS by mistake, close this window.',
  'sos.call': 'Call {number} now',
  'sos.close': 'Close',
  'sos.unset':
    'Your emergency number is not set. 112 works on many phones in many countries, but not everywhere. Set your number in Settings.',
  'service.police': 'Police',
  'service.fire': 'Fire brigade',
};

const fr: Dictionary = {
  'lang.title': 'Choisissez votre langue',
  'country.title': 'Choisissez votre pays',
  'country.help': "Cela permet d'afficher le bon numéro d'urgence.",
  'country.other': 'Autre / non listé',
  'country.own': "Votre numéro d'urgence local",
  'country.number': "Numéro d'urgence : {number}",
  'country.invalid': 'Entrez 2 à 6 chiffres.',
  'common.continue': 'Continuer',
  'common.skip': "Passer pour l'instant",
  'welcome.title': 'Bienvenue sur Healing',
  'welcome.enter': 'Entrer dans Healing →',
  'sos.title': 'URGENCE SOS',
  'sos.message':
    'Appuyez sur le bouton rouge pour appeler le {number} maintenant. Si vous avez appuyé sur SOS par erreur, fermez cette fenêtre.',
  'sos.call': 'Appeler le {number} maintenant',
  'sos.close': 'Fermer',
  'sos.unset':
    "Votre numéro d'urgence n'est pas défini. Le 112 fonctionne sur de nombreux téléphones dans de nombreux pays, mais pas partout. Définissez votre numéro dans les Réglages.",
  'service.police': 'Police',
  'service.fire': 'Sapeurs-pompiers',
};


const es: Dictionary = {
  'lang.title': 'Elija su idioma',
  'country.title': 'Elija su país',
  'country.help': 'Esto muestra el número de emergencia correcto.',
  'country.other': 'Otro / no aparece',
  'country.own': 'Su número de emergencia local',
  'country.number': 'Número de emergencia: {number}',
  'country.invalid': 'Ingrese de 2 a 6 dígitos.',
  'common.continue': 'Continuar',
  'common.skip': 'Omitir por ahora',
  'welcome.title': 'Bienvenido a Healing',
  'welcome.enter': 'Entrar a Healing →',
  'sos.title': 'EMERGENCIA SOS',
  'sos.message':
    'Toque el botón rojo para llamar al {number} ahora. Si presionó SOS por error, cierre esta ventana.',
  'sos.call': 'Llamar al {number} ahora',
  'sos.close': 'Cerrar',
  'sos.unset':
    'Su número de emergencia no está configurado. El 112 funciona en muchos teléfonos de muchos países, pero no en todos. Configure su número en Ajustes.',
  'service.police': 'Police',
  'service.fire': 'Sapeurs-pompiers',
};

const pt: Dictionary = {
  'lang.title': 'Escolha seu idioma',
  'country.title': 'Escolha seu país',
  'country.help': 'Isso mostra o número de emergência correto.',
  'country.other': 'Outro / não listado',
  'country.own': 'Seu número de emergência local',
  'country.number': 'Número de emergência: {number}',
  'country.invalid': 'Digite de 2 a 6 dígitos.',
  'common.continue': 'Continuar',
  'common.skip': 'Pular por enquanto',
  'welcome.title': 'Bem-vindo ao Healing',
  'welcome.enter': 'Entrar no Healing →',
  'sos.title': 'EMERGÊNCIA SOS',
  'sos.message':
    'Toque no botão vermelho para ligar para o {number} agora. Se você tocou em SOS por engano, feche esta janela.',
  'sos.call': 'Ligar para o {number} agora',
  'sos.close': 'Fechar',
  'sos.unset':
    'Seu número de emergência não está definido. O 112 funciona em muitos celulares em muitos países, mas não em todos. Defina seu número em Configurações.',
};

const sw: Dictionary = {
  'lang.title': 'Chagua lugha yako',
  'country.title': 'Chagua nchi yako',
  'country.help': 'Hii inaonyesha nambari sahihi ya dharura.',
  'country.other': 'Nyingine / haipo kwenye orodha',
  'country.own': 'Nambari yako ya dharura ya eneo lako',
  'country.number': 'Nambari ya dharura: {number}',
  'country.invalid': 'Weka tarakimu 2 hadi 6.',
  'common.continue': 'Endelea',
  'common.skip': 'Ruka kwa sasa',
  'welcome.title': 'Karibu Healing',
  'welcome.enter': 'Ingia Healing →',
  'sos.title': 'DHARURA SOS',
  'sos.message':
    'Bonyeza kitufe chekundu kupiga simu {number} sasa. Ikiwa umebonyeza SOS kwa makosa, funga dirisha hili.',
  'sos.call': 'Piga {number} sasa',
  'sos.close': 'Funga',
  'sos.unset':
    'Nambari yako ya dharura haijawekwa. 112 hufanya kazi kwenye simu nyingi katika nchi nyingi, lakini si kila mahali. Weka nambari yako katika Mipangilio.',
};

const ar: Dictionary = {
  'lang.title': 'اختر لغتك',
  'country.title': 'اختر بلدك',
  'country.help': 'يعرض هذا رقم الطوارئ الصحيح.',
  'country.other': 'أخرى / غير مدرجة',
  'country.own': 'رقم الطوارئ المحلي لديك',
  'country.number': 'رقم الطوارئ: {number}',
  'country.invalid': 'أدخل من 2 إلى 6 أرقام.',
  'common.continue': 'متابعة',
  'common.skip': 'تخطَّ الآن',
  'welcome.title': 'مرحبًا بك في Healing',
  'welcome.enter': 'ادخل إلى Healing ←',
  'sos.title': 'طوارئ SOS',
  'sos.message':
    'اضغط على الزر الأحمر للاتصال بالرقم {number} الآن. إذا ضغطت على SOS بالخطأ، أغلق هذه النافذة.',
  'sos.call': 'اتصل بالرقم {number} الآن',
  'sos.close': 'إغلاق',
  'sos.unset':
    'لم يتم تعيين رقم الطوارئ الخاص بك. يعمل الرقم 112 على كثير من الهواتف في كثير من البلدان، لكن ليس في كل مكان. عيّن رقمك في الإعدادات.',
};

const hi: Dictionary = {
  'lang.title': 'अपनी भाषा चुनें',
  'country.title': 'अपना देश चुनें',
  'country.help': 'इससे सही आपातकालीन नंबर दिखता है।',
  'country.other': 'अन्य / सूची में नहीं',
  'country.own': 'आपके यहाँ का आपातकालीन नंबर',
  'country.number': 'आपातकालीन नंबर: {number}',
  'country.invalid': '2 से 6 अंक दर्ज करें।',
  'common.continue': 'जारी रखें',
  'common.skip': 'अभी छोड़ें',
  'welcome.title': 'Healing में आपका स्वागत है',
  'welcome.enter': 'Healing में प्रवेश करें →',
  'sos.title': 'आपातकाल SOS',
  'sos.message':
    'अभी {number} पर कॉल करने के लिए लाल बटन दबाएँ। अगर आपने गलती से SOS दबा दिया है, तो इस विंडो को बंद करें।',
  'sos.call': 'अभी {number} पर कॉल करें',
  'sos.close': 'बंद करें',
  'sos.unset':
    'आपका आपातकालीन नंबर सेट नहीं है। 112 कई देशों में कई फ़ोन पर काम करता है, लेकिन हर जगह नहीं। सेटिंग्स में अपना नंबर सेट करें।',
};

const ru: Dictionary = {
  'lang.title': 'Выберите язык',
  'country.title': 'Выберите страну',
  'country.help': 'Так будет показан правильный номер экстренной службы.',
  'country.other': 'Другая / нет в списке',
  'country.own': 'Местный номер экстренной службы',
  'country.number': 'Номер экстренной службы: {number}',
  'country.invalid': 'Введите от 2 до 6 цифр.',
  'common.continue': 'Продолжить',
  'common.skip': 'Пропустить',
  'welcome.title': 'Добро пожаловать в Healing',
  'welcome.enter': 'Войти в Healing →',
  'sos.title': 'ЭКСТРЕННЫЙ SOS',
  'sos.message':
    'Нажмите красную кнопку, чтобы позвонить по номеру {number} прямо сейчас. Если вы нажали SOS по ошибке, закройте это окно.',
  'sos.call': 'Позвонить по номеру {number}',
  'sos.close': 'Закрыть',
  'sos.unset':
    'Ваш номер экстренной службы не задан. Номер 112 работает на многих телефонах во многих странах, но не везде. Укажите свой номер в настройках.',
};

const uk: Dictionary = {
  'lang.title': 'Оберіть мову',
  'country.title': 'Оберіть країну',
  'country.help': 'Так буде показано правильний номер екстреної служби.',
  'country.other': 'Інша / немає в списку',
  'country.own': 'Місцевий номер екстреної служби',
  'country.number': 'Номер екстреної служби: {number}',
  'country.invalid': 'Введіть від 2 до 6 цифр.',
  'common.continue': 'Продовжити',
  'common.skip': 'Пропустити',
  'welcome.title': 'Ласкаво просимо до Healing',
  'welcome.enter': 'Увійти до Healing →',
  'sos.title': 'ЕКСТРЕНА ДОПОМОГА SOS',
  'sos.message':
    'Натисніть червону кнопку, щоб зателефонувати за номером {number} просто зараз. Якщо ви натиснули SOS помилково, закрийте це вікно.',
  'sos.call': 'Зателефонувати за номером {number}',
  'sos.close': 'Закрити',
  'sos.unset':
    'Ваш номер екстреної служби не вказано. Номер 112 працює на багатьох телефонах у багатьох країнах, але не скрізь. Вкажіть свій номер у налаштуваннях.',
};

export const DICTIONARIES: Record<string, Dictionary> = {
  en: { ...en, ...NAV_EN, ...PLAN_EN, ...CHECKS_EN, ...MAT_EN, ...VIT_EN, ...CH_EN, ...TRK_EN, ...CARE_EN, ...REC_EN, ...INFO_EN, ...SICK_EN },
  fr: { ...fr, ...FR_CORE, ...NAV_FR, ...PLAN_FR, ...CHECKS_FR, ...MAT_FR, ...VIT_FR, ...CH_FR, ...TRK_FR, ...CARE_FR, ...REC_FR, ...INFO_FR, ...SICK_FR },
  ha: HA,
  ig: IG,
  yo: YO,
  es,
  pt,
  sw,
  ar,
  hi,
  ru,
  uk,
};