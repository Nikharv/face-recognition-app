export interface Face {
  id: string;
  name?: string;
  age?: number;
  gender?: string;
  emotion?: string;
  confidence?: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface CapturedFrame {
  id: string;
  imageData: string;
  timestamp: number;
  faces: Face[];
}

export interface AppState {
  isCameraActive: boolean;
  capturedImage: string | null;
  detectedFaces: Face[];
  isLoading: boolean;
  error: string | null;
  uploadedImage: string | null;
  frameHistory: CapturedFrame[];
}

export interface RootState {
  app: AppState;
} 