import * as faceapi from 'face-api.js';

export class FaceDetectionService {
  private isInit = false;

  async initialize(): Promise<void> {
    if (this.isInit) return;

    try {
      await faceapi.nets.tinyFaceDetector.loadFromUri('https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights');
      await faceapi.nets.faceLandmark68Net.loadFromUri('https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights');
      await faceapi.nets.faceExpressionNet.loadFromUri('https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights');
      await faceapi.nets.ageGenderNet.loadFromUri('https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights');
      this.isInit = true;
    } catch (err) {
      throw new Error('Failed to load face detection models');
    }
  }

  async detectFaces(image: HTMLCanvasElement | HTMLImageElement): Promise<any[]> {
    if (!this.isInit) {
      await this.initialize();
    }

    try {
      const detections = await faceapi.detectAllFaces(image, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions()
        .withAgeAndGender();

      return detections.map((detection, index) => {
        const box = detection.detection.box;
        const expressions = detection.expressions;
        const emotion = Object.entries(expressions)
          .sort(([, a], [, b]) => b - a)[0][0];

        return {
          id: `face-${index}`,
          x: box.x,
          y: box.y,
          width: box.width,
          height: box.height,
          age: Math.round(detection.age),
          gender: detection.gender,
          emotion: emotion,
          confidence: detection.detection.score
        };
      });
    } catch (err) {
      throw new Error('Failed to detect faces');
    }
  }
} 