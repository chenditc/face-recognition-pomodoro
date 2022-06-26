import React from 'react';

const defaultPomoConfigs = {
  alertStudySeconds: 25 * 60,
  alertRestSeconds: 5 * 60,
  enableNotification: false,
  notificationIntervalSeconds: 60,
  notificationIntervalMultiplier: 2,
  tempMissingSeconds: 60,
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
  enableDetection: false,
  playerUrl: "https://www.youtube.com/watch?v=q4YyeEM9jsc",
  focusNotificationText: "Time to focus!",
  restNotificationText: "Let's take a break."
}
const PomoConfigsContext = React.createContext(defaultPomoConfigs);

export { defaultPomoConfigs, PomoConfigsContext}