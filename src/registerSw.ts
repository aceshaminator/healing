// Registers the service worker that keeps the app on the phone so it opens with no signal.
// It only runs in the built app, so it never gets in the way while you are developing.
// When a newer copy has downloaded, it announces it so the app can offer "Update now".

let waitingWorker: ServiceWorker | null = null;
let updateRequested = false;
let reloading = false;

function announce(worker: ServiceWorker) {
  waitingWorker = worker;
  window.dispatchEvent(new Event('healing:update-ready'));
}

export function updateIsWaiting(): boolean {
  return waitingWorker !== null;
}

// Called when the person taps "Update now".
export function applyUpdate() {
  updateRequested = true;
  if (waitingWorker) waitingWorker.postMessage({ type: 'SKIP_WAITING' });
  else window.location.reload();
}

export function registerServiceWorker() {
  // Ask the browser not to clear saved records when the phone runs low on space. The browser may say no.
  try {
    navigator.storage?.persist?.().catch(() => {});
  } catch {
    /* ignore */
  }

  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;

  // When the new copy takes over after the person asked for it, reload once so the screen matches it.
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!updateRequested || reloading) return;
    reloading = true;
    window.location.reload();
  });

  const register = () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        // A newer copy was already downloaded and is waiting.
        if (reg.waiting && navigator.serviceWorker.controller) announce(reg.waiting);

        reg.addEventListener('updatefound', () => {
          const worker = reg.installing;
          if (!worker) return;
          worker.addEventListener('statechange', () => {
            if (worker.state === 'installed' && navigator.serviceWorker.controller) announce(worker);
          });
        });

        // Look for a newer copy when the app comes back to the screen, and once an hour.
        const check = () => {
          reg.update().catch(() => {});
        };
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') check();
        });
        window.setInterval(check, 60 * 60 * 1000);
      })
      .catch((error) => {
        console.warn('Offline install could not start:', error);
      });
  };

  if (document.readyState === 'complete') register();
  else window.addEventListener('load', register, { once: true });
}