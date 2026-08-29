import { create } from 'zustand';
import { tutorialApi } from '@/features/tutorial/api';
import { TUTORIAL_DEFINITIONS, TutorialDefinition } from '@/components/onboarding/tutorial-data';

interface TutorialState {
  progress: Record<string, boolean>;
  activeTutorial: string | null;
  currentStepIndex: number;
  isLoading: boolean;
  isLoaded: boolean;

  // Actions
  fetchProgress: () => Promise<void>;
  startTutorial: (pageId: string, force?: boolean) => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTutorial: () => void;
  completeCurrentTutorial: () => Promise<void>;
  resetAllTutorials: () => Promise<void>;
  replayTutorial: (pageId: string) => void;
}

export const useTutorialStore = create<TutorialState>((set, get) => ({
  progress: {},
  activeTutorial: null,
  currentStepIndex: 0,
  isLoading: false,
  isLoaded: false,

  fetchProgress: async () => {
    try {
      set({ isLoading: true });
      const res = await tutorialApi.getProgress();
      set({
        progress: res.progress || {},
        isLoaded: true,
        isLoading: false,
      });
    } catch {
      // Fallback if offline or not logged in yet
      set({ isLoaded: true, isLoading: false });
    }
  },

  startTutorial: (pageId: string, force = false) => {
    const { progress, activeTutorial } = get();
    // Don't start if another tutorial is currently running
    if (activeTutorial && !force) return;

    // Check if tutorial definition exists
    if (!TUTORIAL_DEFINITIONS[pageId]) return;

    // If not forced and already completed, skip
    if (!force && progress[pageId]) return;

    set({
      activeTutorial: pageId,
      currentStepIndex: 0,
    });
  },

  nextStep: () => {
    const { activeTutorial, currentStepIndex } = get();
    if (!activeTutorial) return;

    const def = TUTORIAL_DEFINITIONS[activeTutorial];
    if (!def) return;

    if (currentStepIndex + 1 < def.steps.length) {
      set({ currentStepIndex: currentStepIndex + 1 });
    } else {
      get().completeCurrentTutorial();
    }
  },

  prevStep: () => {
    const { currentStepIndex } = get();
    if (currentStepIndex > 0) {
      set({ currentStepIndex: currentStepIndex - 1 });
    }
  },

  skipTutorial: async () => {
    const { activeTutorial } = get();
    if (!activeTutorial) return;
    // Mark as completed so user is not prompted again immediately
    await get().completeCurrentTutorial();
  },

  completeCurrentTutorial: async () => {
    const { activeTutorial, progress } = get();
    if (!activeTutorial) return;

    const pageToMark = activeTutorial;
    // Close overlay immediately for instant responsive UI feel
    set({
      activeTutorial: null,
      currentStepIndex: 0,
      progress: {
        ...progress,
        [pageToMark]: true,
      },
    });

    try {
      const res = await tutorialApi.completeTutorial({ page: pageToMark });
      if (res && res.progress) {
        set({ progress: res.progress });
      }
    } catch {
      // Fallback local state already updated
    }
  },

  resetAllTutorials: async () => {
    set({ isLoading: true });
    try {
      const res = await tutorialApi.resetTutorials();
      set({
        progress: res.progress || {},
        activeTutorial: null,
        currentStepIndex: 0,
        isLoading: false,
      });
    } catch {
      set({ progress: {}, activeTutorial: null, currentStepIndex: 0, isLoading: false });
    }
  },

  replayTutorial: (pageId: string) => {
    if (!TUTORIAL_DEFINITIONS[pageId]) return;
    const currentProgress = { ...get().progress };
    delete currentProgress[pageId];
    set({
      progress: currentProgress,
      activeTutorial: pageId,
      currentStepIndex: 0,
    });
  },
}));
