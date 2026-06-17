import React, { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { X, RefreshCw, Download } from 'lucide-react';

// ─── SW update banner ────────────────────────────────────────────────────────

export const PwaUpdatePrompt: React.FC = () => {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  const dismiss = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  if (!offlineReady && !needRefresh) return null;

  return (
    <div
      role="alert"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-primary text-white rounded-xl px-4 py-3 shadow-xl z-[200] flex items-center gap-3"
    >
      <div className="flex-1 min-w-0">
        {offlineReady ? (
          <p className="text-sm font-medium">Application prête hors ligne ✓</p>
        ) : (
          <>
            <p className="text-sm font-semibold">Nouvelle version disponible</p>
            <p className="text-xs opacity-80 mt-0.5">Rechargez pour obtenir les dernières mises à jour.</p>
          </>
        )}
      </div>

      {needRefresh && (
        <button
          onClick={() => updateServiceWorker(true)}
          className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0"
        >
          <RefreshCw size={13} />
          Mettre à jour
        </button>
      )}

      <button
        onClick={dismiss}
        className="text-white/70 hover:text-white transition-colors shrink-0"
        aria-label="Fermer"
      >
        <X size={16} />
      </button>
    </div>
  );
};

// ─── Install prompt (A2HS) ───────────────────────────────────────────────────

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const install = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  };

  if (!deferredPrompt || dismissed) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white border border-border rounded-xl px-4 py-3 shadow-xl z-[200] flex items-center gap-3">
      <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
        <Download size={20} className="text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text-900">Installer l'application</p>
        <p className="text-xs text-text-500 mt-0.5">Accès rapide depuis votre écran d'accueil</p>
      </div>
      <div className="flex flex-col gap-1.5 shrink-0">
        <button
          onClick={install}
          className="bg-primary text-white px-3 py-1 rounded-lg text-xs font-semibold hover:brightness-105 transition"
        >
          Installer
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="text-text-300 text-xs text-center hover:text-text-500 transition"
        >
          Plus tard
        </button>
      </div>
    </div>
  );
};
