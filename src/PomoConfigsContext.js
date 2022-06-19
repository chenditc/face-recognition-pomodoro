import React from 'react';

const defaultPomoConfigs = {
  alertStudySeconds: 25 * 60,
  alertRestSeconds: 5 * 60,
  notificationIntervalSeconds: 60,
  notificationIntervalMultiplier: 2,
  tempMissingSeconds: 30,
  history: {
    maxLocalStorageTimeSlot: 100,
    showPomodoroHistory: true,
    onlyShowToday: true,
  },
  faceRecognition: {
    detectionInterval: 5,
    scoreThreshold: 0.95,
    showFaceRecognitionStatus: true,
    showFaceRecognitionCanvas: false,
    showCameraPreview: false,
  },
  enableDetection: true,
}
const PomoConfigsContext = React.createContext(defaultPomoConfigs);

export { defaultPomoConfigs, PomoConfigsContext}