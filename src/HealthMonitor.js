import { useState } from 'react';
import useInterval from 'use-interval'
import { css } from '@emotion/css'
import PlayCircleOutlined from '@ant-design/icons/PlayCircleOutlined';
import { useLocalStorageState } from 'ahooks';
import { Button } from 'antd';
import useSound from 'use-sound';

import PeriodicFaceDetection from './PeriodicFaceDetection';
import ReactFlipClock from './ReactFlipClock.js'
import PomodoroList from './PomodoroList';
import IconOverTextButton from './IconOverTextButton';

function HealthMonitor(props) {
  const detectionInterval = 5;
  const [mergedTimeTable, setMergedTimeTable] = useLocalStorageState('mergedTimeTable', {
    defaultValue: [{
      startTime: new Date().toJSON(),
      endTime: new Date().toJSON(),
      detected: true,
      timePeriod: 0,
      pinnedSession: false
    }],
  });

  const alertStudySeconds = 25 * 60;
  const alertRestSeconds = 5 * 60;
  const notificationIntervalSeconds = 60;
  const [notificationHistory, setNotificationHistory] = useState({})
  const [play] = useSound(process.env.PUBLIC_URL + '/sounds/dingbell.aac');

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
    play();
    new Notification(message);
    notificationHistory[message] = new Date()
    setNotificationHistory(notificationHistory);
    console.log(message)
  }

  function addNewTimeTableSession(pinnedSession) {
    const NewMergedTimeTable = mergedTimeTable.slice()
    NewMergedTimeTable.push({
      startTime: NewMergedTimeTable.at(-1).endTime,
      endTime: new Date().toJSON(),
      detected: true,
      timePeriod: 0,
      pinnedSession: pinnedSession
    })
    setMergedTimeTable(NewMergedTimeTable);
  }

  function onFaceDetectionResult(detection) {
    // calculate continue time
    const NewMergedTimeTable = mergedTimeTable.slice()
    const currDetected = (detection !== undefined)
    if (NewMergedTimeTable.at(-1).detected !== currDetected
      && (NewMergedTimeTable.at(-1).timePeriod < tempMissingSeconds)
      && (NewMergedTimeTable.length > 1)
      && (!NewMergedTimeTable.at(-1).pinnedSession)) {
      // If last section is less than tempMissingSeconds seconds
      // remove last section so that we have a more continous time range.
      NewMergedTimeTable.pop()
    }

    if (NewMergedTimeTable.at(-1).detected !== currDetected) {
      NewMergedTimeTable.push({
        startTime: NewMergedTimeTable.at(-1).endTime,
        endTime: new Date().toJSON(),
        detected: currDetected,
        timePeriod: 0,
        pinnedSession: true
      })
    }
    else {
      NewMergedTimeTable.at(-1).endTime = new Date().toJSON()
      NewMergedTimeTable.at(-1).timePeriod = (new Date() - new Date(NewMergedTimeTable.at(-1).startTime)) / 1000
    }
    setMergedTimeTable(NewMergedTimeTable);
  }

  useInterval(() => {
    Notification.requestPermission()

    // Update continue face time and continue rest time
    const lastTimeSlot = mergedTimeTable.at(-1)
    lastTimeSlot.timePeriod = (new Date() - new Date(lastTimeSlot.startTime)) / 1000
    if (lastTimeSlot.detected && (lastTimeSlot.timePeriod > alertStudySeconds)) {
      sendNotification("该休息啦")
    }

    if (!lastTimeSlot.detected && (lastTimeSlot.timePeriod > alertRestSeconds)) {
      sendNotification("休息够啦")
    }
  }, 500, true)

  const statusMessage = mergedTimeTable.at(-1).detected ? "WORKING" : "REST";

  return (
    <div className={css`margin: 0 15px;`}>
      <p className={
        css`
          font-size: 20vw;
          margin: 0 auto;
          text-align: center;
        `
      }> {statusMessage} </p>

      <ReactFlipClock clockFace='TwelveHourClock' startTime={mergedTimeTable.at(-1).startTime} />

      <div className={
        css`
          display: flex;
          flex-wrap: wrap;
          justify-content: space-around;
        `
      }>
        <IconOverTextButton
          onClick={() => addNewTimeTableSession(true)}
          text="New Session"
          icon={PlayCircleOutlined} />
        <PeriodicFaceDetection
          detectionInterval={detectionInterval}
          onFaceDetectionResult={onFaceDetectionResult}
        />
      </div>
      <PomodoroList mergedTimeTable={mergedTimeTable} />
    </div>
  )
}

export default HealthMonitor;