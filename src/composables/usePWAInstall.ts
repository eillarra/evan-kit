import { ref, onMounted } from 'vue';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

export function usePWAInstall() {
  const deferredPrompt = ref<BeforeInstallPromptEvent | null>(null);
  const isInstallable = ref(false);
  const isInstalled = ref(false);

  const checkIfInstalled = () => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      isInstalled.value = true;
      return true;
    }

    // Check for iOS PWA
    if ((window.navigator as NavigatorWithStandalone).standalone === true) {
      isInstalled.value = true;
      return true;
    }

    return false;
  };

  const showInstallPrompt = async () => {
    if (!deferredPrompt.value) return false;

    try {
      await deferredPrompt.value.prompt();
      const choiceResult = await deferredPrompt.value.userChoice;

      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
        isInstalled.value = true;
      }

      deferredPrompt.value = null;
      isInstallable.value = false;

      return choiceResult.outcome === 'accepted';
    } catch (error) {
      console.warn('Error showing install prompt:', error);
      return false;
    }
  };

  const initializePWAInstall = () => {
    // Check if already installed
    if (checkIfInstalled()) {
      return;
    }

    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault();
      deferredPrompt.value = e as BeforeInstallPromptEvent;
      isInstallable.value = true;
    });

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed');
      isInstalled.value = true;
      isInstallable.value = false;
      deferredPrompt.value = null;
    });
  };

  onMounted(() => {
    initializePWAInstall();
  });

  return {
    isInstallable,
    isInstalled,
    showInstallPrompt,
  };
}
