import React from 'react';

const defaultPomoConfigs = {
  alertStudySeconds: 25 * 60,
  alertRestSeconds: 5 * 60,
  enableNotification: false,
  notificationIntervalSeconds: 60,
  notificationIntervalMultiplier: 1.5,
  tempMissingSeconds: 60,
  history: {
    maxLocalStorageTimeSlot: 100,
    showPomodoroHistory: true,
    onlyShowToday: true,
  },
  faceRecognition: {
    minDetectionInterval: 5,
    maxDetectionInterval: 40,
    scoreThreshold: 0.65,
    showFaceRecognitionStatus: false,
    showFaceRecognitionCanvas: false,
    showCameraPreview: false,
  },
  postureReminder: {
    enabled: true,
    intervalMinutes: 30,
    notificationText: "You've been sitting for a while. Time to switch posture!",
  },
  enableDetection: false,
  enablePlayer: false,
  playerUrl: "https://www.youtube.com/watch?v=tfBVp0Zi2iE",
  focusNotificationText: "Time to focus!",
  restNotificationText: "Let's take a break."
}
const PomoConfigsContext = React.createContext(defaultPomoConfigs);

export { defaultPomoConfigs, PomoConfigsContext}