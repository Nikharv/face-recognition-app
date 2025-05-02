<template>
  <div class="camera-container">
    <div class="video-container">
      <video
        ref="videoElement"
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
          <div class="face-label" v-if="face.emotion">
            {{ face.emotion }}
          </div>
        </div>
      </div>
    </div>

    <div class="controls mt-3">
      <button
        class="btn btn-primary me-2"
        @click="toggleCamera"
        :disabled="isLoading"
      >
        {{ isCameraActive ? 'Stop Camera' : 'Start Camera' }}
      </button>
      <button
        class="btn btn-success me-2"
        @click="captureFrame"
        :disabled="!isCameraActive || isLoading"
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
          :disabled="isLoading"
        >
          Upload Image
        </button>
      </div>
    </div>

    <div v-if="error" class="alert alert-danger mt-3">
      {{ error }}
    </div>

    <div v-if="detectedFaces.length > 0" class="faces-container mt-3">
      <h4>Detected Faces: {{ detectedFaces.length }}</h4>
      <div v-for="face in detectedFaces" :key="face.id" class="face-info">
        <div class="face-details">
          <p>Face ID: {{ face.id }}</p>
          <p>Position: ({{ Math.round(face.boundingBox.x) }}, {{ Math.round(face.boundingBox.y) }})</p>
          <p>Size: {{ Math.round(face.boundingBox.width) }}x{{ Math.round(face.boundingBox.height) }}</p>
          <p v-if="face.age">Age: {{ Math.round(face.age) }}</p>
          <p v-if="face.gender">Gender: {{ face.gender }}</p>
          <p v-if="face.emotion">Emotion: {{ face.emotion }}</p>
          <p v-if="face.confidence">Confidence: {{ Math.round(face.confidence * 100) }}%</p>
        </div>
      </div>
    </div>

    <div v-if="frameHistory.length > 0" class="frame-history mt-4">
      <h4>Captured Frames</h4>
      <div class="frame-grid">
        <div v-for="frame in frameHistory" :key="frame.id" class="frame-item">
          <img :src="frame.imageData" class="frame-image" @click="viewFrameDetails(frame)" />
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
    const videoElement = ref<HTMLVideoElement | null>(null);
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

    const toggleCamera = async () => {
      try {
        isLoading.value = true;
        error.value = null;

        if (isCameraActive.value) {
          stopCamera();
        } else {
          await startCamera();
        }
      } catch (err) {
        error.value = (err as Error).message;
      } finally {
        isLoading.value = false;
      }
    };

    const startCamera = async () => {
      if (!videoElement.value) return;
      
      try {
        await cameraService.startCamera(videoElement.value);
        isCameraActive.value = true;
        store.setCameraActive(true);
        
        await faceDetectionService.initialize();
        detectionInterval.value = window.setInterval(detectFaces, 100);
      } catch (err) {
        error.value = (err as Error).message;
        stopCamera();
      }
    };

    const stopCamera = () => {
      if (detectionInterval.value) {
        clearInterval(detectionInterval.value);
        detectionInterval.value = null;
      }
      
      cameraService.stopCamera();
      faceDetectionService.dispose();
      isCameraActive.value = false;
      store.setCameraActive(false);
      detectedFaces.value = [];
      store.setDetectedFaces([]);
    };

    const detectFaces = async () => {
      if (!videoElement.value || !isCameraActive.value) return;
      
      try {
        const detections = await faceDetectionService.detectFaces(videoElement.value);
        detectedFaces.value = detections.map((detection, index) => {
          const box = detection.detection.box;
          const expressions = detection.expressions;
          const emotion = Object.entries(expressions)
            .sort(([, a], [, b]) => b - a)[0][0];
          
          return {
            id: `face-${index}`,
            boundingBox: {
              x: box.x,
              y: box.y,
              width: box.width,
              height: box.height,
            },
            age: detection.age,
            gender: detection.gender,
            emotion: emotion,
            confidence: detection.detection.score,
          };
        });
        store.setDetectedFaces(detectedFaces.value);
      } catch (err) {
        console.error('Face detection error:', err);
      }
    };

    const triggerFileUpload = () => {
      fileInput.value?.click();
    };

    const handleFileUpload = async (event: Event) => {
      const input = event.target as HTMLInputElement;
      if (!input.files?.length) return;

      try {
        isLoading.value = true;
        error.value = null;
        
        const file = input.files[0];
        const reader = new FileReader();
        
        reader.onload = async (e) => {
          const imageUrl = e.target?.result as string;
          store.setUploadedImage(imageUrl);
          
          const img = new Image();
          img.src = imageUrl;
          
          await new Promise((resolve) => {
            img.onload = resolve;
          });
          
          if (canvasElement.value) {
            const ctx = canvasElement.value.getContext('2d');
            if (ctx) {
              canvasElement.value.width = img.width;
              canvasElement.value.height = img.height;
              ctx.drawImage(img, 0, 0);
              
              // Initialize face detection if not already done
              if (!faceDetectionService.isInitialized) {
                await faceDetectionService.initialize();
              }
              
              const detections = await faceDetectionService.detectFaces(img);
              const faces = detections.map((detection, index) => {
                const box = detection.detection.box;
                const expressions = detection.expressions;
                const emotion = Object.entries(expressions)
                  .sort(([, a], [, b]) => b - a)[0][0];
                
                return {
                  id: `face-${index}`,
                  boundingBox: {
                    x: box.x,
                    y: box.y,
                    width: box.width,
                    height: box.height,
                  },
                  age: detection.age,
                  gender: detection.gender,
                  emotion: emotion,
                  confidence: detection.detection.score,
                };
              });

              // Add frame to history
              store.addFrameToHistory({
                id: `frame-${Date.now()}`,
                imageData: imageUrl,
                timestamp: Date.now(),
                faces,
              });

              // Update current faces
              detectedFaces.value = faces;
              store.setDetectedFaces(faces);
            }
          }
        };
        
        reader.readAsDataURL(file);
      } catch (err) {
        error.value = (err as Error).message;
      } finally {
        isLoading.value = false;
      }
    };

    const captureFrame = async () => {
      try {
        isLoading.value = true;
        error.value = null;
        
        if (!videoElement.value) return;
        
        // Create a temporary canvas to capture the video frame
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = videoElement.value.videoWidth;
        tempCanvas.height = videoElement.value.videoHeight;
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) return;
        
        // Draw the current video frame to the canvas
        tempCtx.drawImage(videoElement.value, 0, 0);
        const imageData = tempCanvas.toDataURL('image/jpeg');
        store.setCapturedImage(imageData);
        
        if (canvasElement.value) {
          const ctx = canvasElement.value.getContext('2d');
          if (ctx) {
            canvasElement.value.width = tempCanvas.width;
            canvasElement.value.height = tempCanvas.height;
            ctx.drawImage(tempCanvas, 0, 0);

            // Detect faces in the captured frame
            const detections = await faceDetectionService.detectFaces(tempCanvas);
            const faces = detections.map((detection, index) => {
              const box = detection.detection.box;
              const expressions = detection.expressions;
              const emotion = Object.entries(expressions)
                .sort(([, a], [, b]) => b - a)[0][0];
              
              return {
                id: `face-${index}`,
                boundingBox: {
                  x: box.x,
                  y: box.y,
                  width: box.width,
                  height: box.height,
                },
                age: detection.age,
                gender: detection.gender,
                emotion: emotion,
                confidence: detection.detection.score,
              };
            });

            // Add frame to history
            store.addFrameToHistory({
              id: `frame-${Date.now()}`,
              imageData,
              timestamp: Date.now(),
              faces,
            });

            // Update current faces
            detectedFaces.value = faces;
            store.setDetectedFaces(faces);
          }
        }
      } catch (err) {
        error.value = (err as Error).message;
      } finally {
        isLoading.value = false;
      }
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
      const scale = videoElement.value ? videoElement.value.offsetWidth / videoElement.value.videoWidth : 1;
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

    onUnmounted(() => {
      stopCamera();
    });

    return {
      videoElement,
      canvasElement,
      fileInput,
      isCameraActive,
      isLoading,
      error,
      detectedFaces,
      toggleCamera,
      captureFrame,
      getFaceBoxStyle,
      triggerFileUpload,
      handleFileUpload,
      frameHistory: computed(() => store.frameHistory),
      selectedFrame,
      viewFrameDetails,
      deleteFrame,
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

.faces-container {
  position: relative;
}

.face-info {
  margin-top: 10px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.face-details {
  margin-top: 5px;
  font-size: 14px;
}

.frame-history {
  margin-top: 2rem;
}

.frame-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.frame-item {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;
}

.frame-item:hover {
  transform: scale(1.02);
}

.frame-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.frame-info {
  padding: 0.5rem;
  background-color: #f8f9fa;
  font-size: 0.9rem;
}

.modal {
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-dialog {
  margin-top: 2rem;
}

.face-info {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 4px;
}
</style> 