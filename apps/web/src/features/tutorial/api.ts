import { apiClient } from '@/lib/api';
import {
  TutorialProgressResponse,
  TutorialCompletePayload,
  TutorialResetResponse,
} from '@financial-os/shared-types';

export const tutorialApi = {
  async getProgress(): Promise<TutorialProgressResponse> {
    return apiClient<TutorialProgressResponse>('/users/tutorial-progress', {
      method: 'GET',
    });
  },

  async completeTutorial(payload: TutorialCompletePayload): Promise<TutorialProgressResponse> {
    return apiClient<TutorialProgressResponse>('/users/tutorial-progress/complete', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async resetTutorials(): Promise<TutorialResetResponse> {
    return apiClient<TutorialResetResponse>('/users/tutorial-progress/reset', {
      method: 'POST',
    });
  },
};
