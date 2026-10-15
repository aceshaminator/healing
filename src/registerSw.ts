// Registers the service worker that keeps the app on the phone so it opens with no signal.
// It only runs in the built app, so it never gets in the way while you are developing.
export function registerServiceWorker() {
  // Ask the browser not to clear saved records when the phone runs low on space. The browser may say no.
  try {
    navigator.storage?.persist?.().catch(() => {});
  } catch {
    /* ignore */
  }

  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;

  const register = () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.warn('Offline install could not start:', error);
    });
  };

  if (document.readyState === 'complete') register();
  else window.addEventListener('load', register, { once: true });
}