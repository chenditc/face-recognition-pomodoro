import { useState } from 'react';
import useInterval from 'use-interval'
import { css } from '@emotion/css'

import PeriodicFaceDetection from './PeriodicFaceDetection';
import ReactFlipClock from './ReactFlipClock.js'

function HealthMonitor(props) {
  const detectionInterval = 5;
  const [continousTimeTable, setContinousTimeTable] = useState([])
  const [mergedTimeTable, setMergedTimeTable] = useState([{
    startTime: new Date(),
    endTime: new Date(),
    detected: true,
    timePeriod: 0
  }])
  const alertStudySeconds = 25 * 60;
  const alertRestSeconds = 5 * 60;
  const notificationIntervalSeconds = 60;
  const [notificationHistory, setNotificationHistory] = useState({})
  const tempMissingSeconds = 30;

  function sendNotification(message) {
    if (notificationHistory[message] && (
      (new Date() - notificationHistory[message]) < (notificationIntervalSeconds * 1000))) {
      // Only send notification every notificationIntervalSeconds
      return;
    }

    if (!("Notification" in window)) {
      alert("This browser does not support desktop notification");
      return;
    }
    // Let's check whether notification permissions have already been granted
    if (Notification.permission !== "granted") {
      alert("Please grant notification permission first.")
      return;
    }

    // If it's okay let's create a notification
    new Notification(message);
    notificationHistory[message] = new Date()
    setNotificationHistory(notificationHistory);

  }

  function onFaceDetectionResult(detection) {
    // Add new time slow with detection result
    // TODO: use the detection info to get box area range for smarter detection
    const NewContinousTimeTable = continousTimeTable.slice()
    NewContinousTimeTable.push({ time: new Date(), result: detection })
    setContinousTimeTable(NewContinousTimeTable);

    // calculate continue time
    const NewMergedTimeTable = mergedTimeTable.slice()
    const currDetected = (detection !== undefined)
    if (NewMergedTimeTable.at(-1).detected !== currDetected
      && (NewMergedTimeTable.at(-1).timePeriod < tempMissingSeconds)
      && (NewMergedTimeTable.length > 1)) {
      // If last section is less than tempMissingSeconds seconds
      // remove last section so that we have a more continous time range.
      NewMergedTimeTable.pop()
    }

    if (NewMergedTimeTable.at(-1).detected !== currDetected) {
      NewMergedTimeTable.push({
        startTime: NewMergedTimeTable.at(-1).endTime,
        endTime: new Date(),
        detected: currDetected,
        timePeriod: 0
      })
    }
    else {
      NewMergedTimeTable.at(-1).endTime = new Date()
      NewMergedTimeTable.at(-1).timePeriod = (new Date() - NewMergedTimeTable.at(-1).startTime) / 1000
    }

    setMergedTimeTable(NewMergedTimeTable);
  }

  useInterval(() => {
    Notification.requestPermission()

    // Update continue face time and continue rest time
    const lastTimeSlot = mergedTimeTable.at(-1)
    lastTimeSlot.timePeriod = (new Date() - lastTimeSlot.startTime) / 1000
    if (lastTimeSlot.detected && (lastTimeSlot.timePeriod > alertStudySeconds)) {
      sendNotification("该休息啦")
    }

    if (!lastTimeSlot.detected && (lastTimeSlot.timePeriod > alertRestSeconds)) {
      sendNotification("休息够啦")
    }
  }, 500, true)

  const statusMessage = mergedTimeTable.at(-1).detected ? "WORKING" : "REST";

  return (
    <div>
      <p className={
        css`
          font-size: 20vw;
          margin: 0 auto;
          text-align: center;
        `
      }> {statusMessage} </p>
      <ReactFlipClock clockFace='TwelveHourClock' startTime={mergedTimeTable.at(-1).startTime} />
      <PeriodicFaceDetection
        detectionInterval={detectionInterval}
        onFaceDetectionResult={onFaceDetectionResult}
      />
    </div>
  )
}

export default HealthMonitor;