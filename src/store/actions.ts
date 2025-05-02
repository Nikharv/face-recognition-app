import { defineStore } from 'pinia';
import type { AppState, Face, CapturedFrame } from './types';

export const useAppStore = defineStore('app', {
  state: (): AppState => ({
    isCameraActive: false,
    capturedImage: null,
    detectedFaces: [],
    isLoading: false,
    error: null,
    uploadedImage: null,
    frameHistory: [],
  }),

  actions: {
    setCameraActive(isActive: boolean) {
      this.isCameraActive = isActive;
    },

    setCapturedImage(image: string | null) {
      this.capturedImage = image;
    },

    setDetectedFaces(faces: Face[]) {
      this.detectedFaces = faces;
    },

    setLoading(isLoading: boolean) {
      this.isLoading = isLoading;
    },

    setError(error: string | null) {
      this.error = error;
    },

    setUploadedImage(image: string | null) {
      this.uploadedImage = image;
    },

    addFrameToHistory(frame: CapturedFrame) {
      this.frameHistory.push(frame);
    },

    clearState() {
      this.isCameraActive = false;
      this.capturedImage = null;
      this.detectedFaces = [];
      this.isLoading = false;
      this.error = null;
      this.uploadedImage = null;
      this.frameHistory = [];
    },
  },
}); 