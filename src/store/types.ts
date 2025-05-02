export interface Face {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  age?: number;
  gender?: string;
  emotion?: string;
  confidence: number;
}

export interface CapturedFrame {
  id: number;
  imageData: string;
  timestamp: number;
  faces: Face[];
}

export interface AppState {
  isCameraActive: boolean;
  detectedFaces: Face[];
  error: string | null;
  frameHistory: CapturedFrame[];
}

export interface RootState {
  app: AppState;
} 