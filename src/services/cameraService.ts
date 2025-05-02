export class CameraService {
  private stream: MediaStream | null = null;

  async startCamera(): Promise<MediaStream> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false
      });
      return this.stream;
    } catch (err) {
      throw new Error('Failed to access camera');
    }
  }

  stopCamera(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }

  async captureFrame(video: HTMLVideoElement): Promise<HTMLCanvasElement> {
    const canvas = document.createElement('canvas');
    const videoTrack = this.stream?.getVideoTracks()[0];
    const settings = videoTrack?.getSettings();
    
    canvas.width = settings?.width || video.videoWidth;
    canvas.height = settings?.height || video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    }
    
    return canvas;
  }

  isCameraActive() {
    return this.stream !== null;
  }
} 