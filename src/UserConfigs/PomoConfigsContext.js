import React from 'react';
import { defaultLocale, getDefaultNotificationMessages } from '../i18n';

const defaultNotificationMessages = getDefaultNotificationMessages(defaultLocale);

const defaultPomoConfigs = {
  locale: defaultLocale,
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
    missingFaceRetryIntervalSeconds: 1,
    matchStrictness: 'balanced',
    scoreThreshold: 0.55,
    showFaceRecognitionStatus: false,
    showFaceRecognitionCanvas: false,
    showCameraPreview: false,
  },
  postureReminder: {
    enabled: true,
    intervalMinutes: 30,
    notificationText: defaultNotificationMessages.postureReminderText,
  },
  enableDetection: false,
  enablePlayer: false,
  playerUrl: "https://www.youtube.com/watch?v=tfBVp0Zi2iE",
  focusNotificationText: defaultNotificationMessages.focusNotificationText,
  restNotificationText: defaultNotificationMessages.restNotificationText,
}
const PomoConfigsContext = React.createContext(defaultPomoConfigs);

export { defaultPomoConfigs, PomoConfigsContext}
