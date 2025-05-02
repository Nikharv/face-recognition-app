<template>
  <div class="camera-container">
    <div class="video-container">
      <video
        ref="videoRef"
        class="video-feed"
        :class="{ 'd-none': !isCameraActive }"
        autoplay
        playsinline
      ></video>
      <canvas
        ref="canvasElement"
        class="video-feed"
        :class="{ 'd-none': isCameraActive }"
      ></canvas>
      <div v-if="isCameraActive" class="face-overlay">
        <div
          v-for="face in detectedFaces"
          :key="face.id"
          class="face-box"
          :style="getFaceBoxStyle(face)"
        >
          <div class="face-label">{{ getEmotionLabel(face) }}</div>
        </div>
      </div>
    </div>

    <div class="controls mt-3">
      <button
        class="btn btn-primary me-2"
        @click="startCamera"
        :disabled="isCameraActive"
      >
        Start Camera
      </button>
      <button
        class="btn btn-danger me-2"
        @click="stopCamera"
        :disabled="!isCameraActive"
      >
        Stop Camera
      </button>
      <button
        class="btn btn-success me-2"
        @click="captureFrame"
        :disabled="!isCameraActive"
      >
        Capture Frame
      </button>
      <div class="upload-container">
        <input
          type="file"
          ref="fileInput"
          accept="image/*"
          @change="handleFileUpload"
          class="d-none"
        />
        <button
          class="btn btn-info"
          @click="triggerFileUpload"
        >
          Upload Image
        </button>
      </div>
    </div>

    <div v-if="error" class="alert alert-danger mt-3">
      {{ error }}
    </div>

    <div v-if="detectedFaces.length > 0" class="face-details">
      <h3>Detected Faces</h3>
      <div v-for="face in detectedFaces" :key="face.id" class="face-info">
        <p>ID: {{ face.id }}</p>
        <p>Position: ({{ Math.round(face.boundingBox.x) }}, {{ Math.round(face.boundingBox.y) }})</p>
        <p>Size: {{ Math.round(face.boundingBox.width) }}x{{ Math.round(face.boundingBox.height) }}</p>
        <p v-if="face.age">Age: {{ Math.round(face.age) }}</p>
        <p v-if="face.gender">Gender: {{ face.gender }}</p>
        <p v-if="face.emotion">Emotion: {{ face.emotion }}</p>
        <p v-if="face.confidence">Confidence: {{ Math.round(face.confidence * 100) }}%</p>
      </div>
    </div>

    <div v-if="frameHistory.length > 0" class="frame-history">
      <h3>Captured Frames</h3>
      <div class="frame-grid">
        <div v-for="frame in frameHistory" :key="frame.id" class="frame-item">
          <img :src="frame.imageData" :alt="'Frame ' + frame.id" @click="viewFrameDetails(frame)" />
          <div class="frame-info">
            <p>Faces: {{ frame.faces.length }}</p>
            <p>Time: {{ new Date(frame.timestamp).toLocaleTimeString() }}</p>
            <button class="btn btn-sm btn-danger mt-2" @click.stop="deleteFrame(frame.id)">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Frame Details Modal -->
    <div v-if="selectedFrame" class="modal" tabindex="-1" role="dialog" style="display: block;">
      <div class="modal-dialog modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Frame Details</h5>
            <button type="button" class="btn-close" @click="selectedFrame = null"></button>
          </div>
          <div class="modal-body">
            <img :src="selectedFrame.imageData" class="img-fluid mb-3" />
            <div v-for="face in selectedFrame.faces" :key="face.id" class="face-info">
              <h6>Face {{ face.id }}</h6>
              <p>Position: ({{ Math.round(face.boundingBox.x) }}, {{ Math.round(face.boundingBox.y) }})</p>
              <p>Size: {{ Math.round(face.boundingBox.width) }}x{{ Math.round(face.boundingBox.height) }}</p>
              <p v-if="face.age">Age: {{ Math.round(face.age) }}</p>
              <p v-if="face.gender">Gender: {{ face.gender }}</p>
              <p v-if="face.emotion">Emotion: {{ face.emotion }}</p>
              <p v-if="face.confidence">Confidence: {{ Math.round(face.confidence * 100) }}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onUnmounted, computed } from 'vue';
import { useAppStore } from '../store/actions';
import { CameraService } from '../services/cameraService';
import { FaceDetectionService } from '../services/faceDetectionService';
import type { Face } from '../store/types';

export default defineComponent({
  name: 'CameraComponent',
  setup() {
    const store = useAppStore();
    const videoRef = ref<HTMLVideoElement | null>(null);
    const canvasElement = ref<HTMLCanvasElement | null>(null);
    const fileInput = ref<HTMLInputElement | null>(null);
    const cameraService = new CameraService();
    const faceDetectionService = new FaceDetectionService();
    const detectionInterval = ref<number | null>(null);

    const isCameraActive = ref(false);
    const isLoading = ref(false);
    const error = ref<string | null>(null);
    const detectedFaces = ref<Face[]>([]);
    const selectedFrame = ref<CapturedFrame | null>(null);

    const { frameHistory } = store;

    const startCamera = async () => {
      try {
        const stream = await cameraService.startCamera();
        if (videoRef.value) {
          videoRef.value.srcObject = stream;
          isCameraActive.value = true;
          error.value = '';
        }
      } catch (err) {
        error.value = 'Failed to start camera';
      }
    };

    const stopCamera = () => {
      cameraService.stopCamera();
      if (videoRef.value) {
        videoRef.value.srcObject = null;
      }
      isCameraActive.value = false;
      store.clearState();
    };

    const captureFrame = async () => {
      if (!videoRef.value) return;

      try {
        const frame = await cameraService.captureFrame(videoRef.value);
        const faces = await faceDetectionService.detectFaces(frame);
        store.setDetectedFaces(faces);
        store.addFrameToHistory({
          id: Date.now(),
          imageData: frame.toDataURL(),
          timestamp: Date.now(),
          faces
        });
      } catch (err) {
        error.value = 'Failed to capture frame';
      }
    };

    const handleFileUpload = async (event: Event) => {
      const input = event.target as HTMLInputElement;
      if (!input.files?.length) return;

      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = async (e) => {
        const img = new Image();
        img.onload = async () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const faces = await faceDetectionService.detectFaces(canvas);
            store.setDetectedFaces(faces);
            store.addFrameToHistory({
              id: Date.now(),
              imageData: canvas.toDataURL(),
              timestamp: Date.now(),
              faces
            });
          }
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    };

    const triggerFileUpload = () => {
      fileInput.value?.click();
    };

    const viewFrameDetails = (frame: CapturedFrame) => {
      selectedFrame.value = frame;
    };

    const deleteFrame = (frameId: string) => {
      const index = store.frameHistory.findIndex(frame => frame.id === frameId);
      if (index !== -1) {
        store.frameHistory.splice(index, 1);
      }
    };

    const getFaceBoxStyle = (face: Face) => {
      const scale = videoRef.value ? videoRef.value.offsetWidth / videoRef.value.videoWidth : 1;
      return {
        position: 'absolute',
        left: `${face.boundingBox.x * scale}px`,
        top: `${face.boundingBox.y * scale}px`,
        width: `${face.boundingBox.width * scale}px`,
        height: `${face.boundingBox.height * scale}px`,
        border: '2px solid #00ff00',
        pointerEvents: 'none',
      };
    };

    const getEmotionLabel = (face: Face) => {
      if (!face.emotion) return '';
      return `${face.emotion} (${(face.confidence * 100).toFixed(0)}%)`;
    };

    onUnmounted(() => {
      stopCamera();
    });

    return {
      videoRef,
      canvasElement,
      fileInput,
      isCameraActive,
      isLoading,
      error,
      detectedFaces,
      startCamera,
      stopCamera,
      captureFrame,
      getFaceBoxStyle,
      triggerFileUpload,
      handleFileUpload,
      frameHistory: computed(() => store.frameHistory),
      selectedFrame,
      viewFrameDetails,
      deleteFrame,
      getEmotionLabel,
    };
  },
});
</script>

<style scoped>
.camera-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.video-container {
  position: relative;
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
}

.video-feed {
  width: 100%;
  height: auto;
  border-radius: 8px;
  background-color: #000;
}

.face-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.face-box {
  position: absolute;
  border: 2px solid #00ff00;
  pointer-events: none;
}

.face-label {
  position: absolute;
  top: -20px;
  left: 0;
  background-color: rgba(0, 255, 0, 0.7);
  color: white;
  padding: 2px 5px;
  border-radius: 3px;
  font-size: 12px;
  white-space: nowrap;
}

.controls {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

.upload-container {
  display: flex;
  align-items: center;
}

.face-details {
  margin-top: 20px;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 8px;
}

.face-info {
  margin: 10px 0;
  padding: 10px;
  background: white;
  border-radius: 4px;
}

.frame-history {
  margin-top: 20px;
}

.frame-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  margin-top: 10px;
}

.frame-item {
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;
}

.frame-item:hover {
  transform: scale(1.02);
}

.frame-item img {
  width: 100%;
  height: auto;
}

.frame-info {
  padding: 8px;
  background: #f5f5f5;
  font-size: 12px;
}

.modal {
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-dialog {
  margin-top: 2rem;
}
</style> 