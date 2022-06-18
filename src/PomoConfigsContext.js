import React from 'react';

const defaultPomoConfigs = {
  alertStudySeconds: 25 * 60,
  alertRestSeconds: 5 * 60,
  notificationIntervalSeconds: 60,
  tempMissingSeconds: 30,
  maxLocalStorageTimeSlot: 100,
  faceRecognition: {
    detectionInterval: 5,
    modelInputSize: 128,
    scoreThreshold: 0.25,
    showFaceRecognitionStatus: true
  },
  cameraHidden: true,
  enableDetection: true,
}
const PomoConfigsContext = React.createContext(defaultPomoConfigs);

export { defaultPomoConfigs, PomoConfigsContext}