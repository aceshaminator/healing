import React from 'react';

interface Props {
  children: React.ReactNode;
}
interface State {
  failed: boolean;
}

// This screen sits outside the translation system, so it reads the saved language itself.
const TEXT: Record<string, { title: string; body: string; call: string; reload: string }> = {
  en: {
    title: 'Something went wrong',
    body: 'Healing could not show this screen. Your records are saved on this phone, and this error does not delete them. If this is a medical emergency, do not wait: call {number}.',
    call: 'Call {number}',
    reload: 'Reload the app',
  },
  fr: {
    title: 'Un problème est survenu',
    body: "Healing n'a pas pu afficher cet écran. Vos données sont enregistrées sur ce téléphone, et cette erreur ne les supprime pas. S'il s'agit d'une urgence médicale, n'attendez pas : appelez le {number}.",
    call: 'Appeler le {number}',
    reload: "Recharger l'application",
  },
};

function read(key: string): string {
  try {
    return localStorage.getItem(key) || '';
  } catch {
    return '';
  }
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error('Healing screen error:', error);
  }

  render() {
    if (!this.state.failed) return this.props.children;

    const number = read('healing_emergency_number') || '112';
    const text = TEXT[read('healing_language')] ?? TEXT.en;

    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070D1F] p-4 text-slate-100">
        <div
          role="alert"
          className="w-full max-w-md space-y-5 rounded-3xl border border-red-500/50 bg-[#0B132B] p-8 text-center shadow-xl"
        >
          <h1 className="text-2xl font-bold text-red-300">{text.title}</h1>
          <p className="text-sm leading-relaxed text-slate-200">{text.body.replace('{number}', number)}</p>
          <a
            href={`tel:${number}`}
            className="flex min-h-[52px] items-center justify-center rounded-xl bg-red-600 px-4 py-3 text-base font-bold text-white transition hover:bg-red-500"
          >
            {text.call.replace('{number}', number)}
          </a>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="min-h-[48px] w-full rounded-xl border border-slate-500 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
          >
            {text.reload}
          </button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;