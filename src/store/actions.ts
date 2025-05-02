import { defineStore } from 'pinia';
import { AppState, Face, CapturedFrame } from './types';

export const useAppStore = defineStore('app', {
  state: (): AppState => ({
    isCameraActive: false,
    detectedFaces: [],
    error: null,
    frameHistory: []
  }),

  actions: {
    setCameraActive(isActive: boolean) {
      this.isCameraActive = isActive;
    },

    setDetectedFaces(faces: Face[]) {
      this.detectedFaces = faces;
    },

    setError(message: string | null) {
      this.error = message;
    },

    addFrameToHistory(frame: CapturedFrame) {
      this.frameHistory.push(frame);
    },

    clearState() {
      this.isCameraActive = false;
      this.detectedFaces = [];
      this.error = null;
    }
  }
}); 