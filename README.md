# Face Recognition Web Application

A real-time face detection and recognition web application built with Vue.js, TypeScript, and face-api.js. This application allows users to detect faces in real-time using their webcam or uploaded images, with features like emotion detection, age and gender estimation, and face tracking.

## Live Demo

Check out the live application at: [https://face-recog-webapp-8b0d5085c1e8.herokuapp.com/](https://face-recog-webapp-8b0d5085c1e8.herokuapp.com/)

## Features

- **Real-time Face Detection**: Detect faces in real-time using your webcam
- **Image Upload**: Upload images for face detection
- **Emotion Recognition**: Detect emotions (happy, sad, angry, etc.) on detected faces
- **Age & Gender Estimation**: Estimate age and gender of detected faces
- **Face Tracking**: Track multiple faces simultaneously
- **Responsive Design**: Works on both desktop and mobile devices
- **User-Friendly Interface**: Simple and intuitive controls

## Tech Stack

- **Frontend**: Vue.js 3, TypeScript, Bootstrap 5
- **Face Detection**: face-api.js
- **State Management**: Pinia
- **Routing**: Vue Router
- **Build Tool**: Vite
- **Deployment**: Heroku

## Project Structure

```
face-recognition-app/
├── src/
│   ├── components/
│   │   └── CameraComponent.vue    # Main component for camera and face detection
│   ├── services/
│   │   ├── cameraService.ts       # Handles camera operations
│   │   └── faceDetectionService.ts # Manages face detection and recognition
│   ├── store/
│   │   ├── actions.ts             # Pinia store actions
│   │   └── types.ts               # TypeScript interfaces and types
│   ├── views/
│   │   ├── HomeView.vue           # Main application view
│   │   └── AboutView.vue          # About page
│   ├── router/
│   │   └── index.ts               # Vue Router configuration
│   └── main.ts                    # Application entry point
├── public/                        # Static assets
├── server.js                      # Express server for Heroku deployment
└── package.json                   # Project dependencies and scripts
```

## Key Files Explained

### `src/components/CameraComponent.vue`
The main component that handles:
- Camera initialization and control
- Face detection display
- Image upload functionality
- Real-time emotion, age, and gender display
- User interface for camera controls

### `src/services/cameraService.ts`
Manages camera operations:
- Starting and stopping the camera
- Capturing frames
- Handling camera permissions
- Error handling for camera operations

### `src/services/faceDetectionService.ts`
Handles face detection and recognition:
- Loading face detection models
- Detecting faces in images/video
- Extracting face features (emotions, age, gender)
- Managing face detection state

### `src/store/actions.ts`
State management using Pinia:
- Managing application state
- Handling face detection results
- Managing camera status
- Error state management

### `src/store/types.ts`
TypeScript type definitions:
- Face interface for detected faces
- AppState interface for global state
- Type definitions for face detection results

## Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm or yarn

### Installation
1. Clone the repository:
```bash
git clone https://github.com/yourusername/face-recognition-app.git
cd face-recognition-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## How It Works

1. **Camera Initialization**:
   - The application requests camera access
   - Initializes face detection models
   - Sets up real-time video feed

2. **Face Detection**:
   - Captures frames from the video feed
   - Detects faces using face-api.js
   - Extracts face features (emotions, age, gender)

3. **Display Results**:
   - Draws bounding boxes around detected faces
   - Shows emotion labels
   - Displays age and gender information
   - Updates in real-time

## Acknowledgments

- [face-api.js](https://github.com/justadudewhohacks/face-api.js) for face detection capabilities
