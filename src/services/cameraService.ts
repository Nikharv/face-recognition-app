export class CameraService {
  private stream: MediaStream | null = null;

  async startCamera(video: HTMLVideoElement) {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = this.stream;
      await video.play();
    } catch (err) {
      console.log('Camera error:', err);
      throw new Error('Could not start camera');
    }
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }

  captureFrame() {
    if (!this.stream) {
      throw new Error('Camera not started');
    }

    const canvas = document.createElement('canvas');
    const videoTrack = this.stream.getVideoTracks()[0];
    const settings = videoTrack.getSettings();
    
    canvas.width = settings.width || 640;
    canvas.height = settings.height || 480;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    const video = document.createElement('video');
    video.srcObject = this.stream;
    ctx.drawImage(video, 0, 0);
    
    return canvas.toDataURL('image/jpeg');
  }

  isCameraActive() {
    return this.stream !== null;
  }
} 