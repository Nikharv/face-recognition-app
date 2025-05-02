import * as faceapi from 'face-api.js';

export class FaceDetectionService {
  private isInitialized = false;
  private readonly modelUrl = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('Loading face detection models...');
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(this.modelUrl),
        faceapi.nets.faceLandmark68Net.loadFromUri(this.modelUrl),
        faceapi.nets.faceRecognitionNet.loadFromUri(this.modelUrl),
        faceapi.nets.faceExpressionNet.loadFromUri(this.modelUrl),
        faceapi.nets.ageGenderNet.loadFromUri(this.modelUrl)
      ]);
      console.log('Models loaded successfully');
      this.isInitialized = true;
    } catch (error) {
      console.error('Error loading models:', error);
      throw new Error(`Failed to initialize face detection: ${(error as Error).message}`);
    }
  }

  async detectFaces(image: HTMLImageElement | HTMLVideoElement): Promise<faceapi.WithFaceExpressions<faceapi.WithAgeAndGender<faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }>>>[]> {
    if (!this.isInitialized) {
      throw new Error('Face detection not initialized');
    }

    try {
      const detections = await faceapi.detectAllFaces(image, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions()
        .withAgeAndGender();
      return detections;
    } catch (error) {
      console.error('Error detecting faces:', error);
      throw new Error(`Failed to detect faces: ${(error as Error).message}`);
    }
  }

  dispose(): void {
    this.isInitialized = false;
  }
} 