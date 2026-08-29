import { useEffect } from 'react';
import { useTutorialStore } from '@/stores/tutorial-store';
import { useAuthStore } from '@/stores/auth-store';

export function useContextualTutorial(pageId: string, delayMs = 600) {
  const { user } = useAuthStore();
  const {
    progress,
    activeTutorial,
    isLoaded,
    fetchProgress,
    startTutorial,
  } = useTutorialStore();

  useEffect(() => {
    if (!isLoaded && user) {
      fetchProgress();
    }
  }, [isLoaded, user, fetchProgress]);

  useEffect(() => {
    // Only trigger if:
    // 1. User is authenticated & has completed initial profile onboarding wizard
    // 2. Tutorial progress is loaded
    // 3. User has NOT seen this page's tutorial yet
    // 4. No other tutorial is active
    if (!user || !user.is_onboarded || !isLoaded) return;
    if (progress[pageId] || activeTutorial) return;

    const timer = setTimeout(() => {
      startTutorial(pageId, false);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [user, user?.is_onboarded, isLoaded, progress, activeTutorial, pageId, delayMs, startTutorial]);
}
