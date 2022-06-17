import { useEffect, useState } from 'react';
import useInterval from 'use-interval'
import { css } from '@emotion/css'
import PlayCircleOutlined from '@ant-design/icons/PlayCircleOutlined';
import { useLocalStorageState } from 'ahooks';
import useSound from 'use-sound';
import { notification } from 'antd';
import produce from 'immer';

import PeriodicFaceDetection from './PeriodicFaceDetection';
import ReactFlipClock from './ReactFlipClock.js'
import PomodoroList from './PomodoroList';
import IconOverTextButton from './IconOverTextButton';

function HealthMonitor(props) {
  const alertStudySeconds = 25 * 60;
  const alertRestSeconds = 5 * 60;
  const detectionInterval = 5;

  function getDefaultTimeSlot(detected = true, pinnedSession = false, startTime = null) {
    const usedStateTime = startTime? startTime : new Date().toJSON();

    return {
      startTime: usedStateTime,
      endTime: new Date().toJSON(),
      detected: detected,
      timePeriod: 0,
      pinnedSession: pinnedSession
    }
  }
  const [mergedTimeTable, setMergedTimeTable] = useLocalStorageState('mergedTimeTable', {
    defaultValue: [getDefaultTimeSlot(true, true)],
    serializer: (v) => JSON.stringify(v),
    deserializer: (v) => {
      const storedTable = JSON.parse(v)
      // Check diff between last end time and current time
      if (new Date() - new Date(storedTable.at(-1).endTime) > alertStudySeconds * 1000) {
        storedTable.push(getDefaultTimeSlot(true, true))
      }
      // Keep only last 100 session for now
      return storedTable.slice(-100)
    }
  });

  const lastTimeSlot = mergedTimeTable.at(-1)

  const notificationIntervalSeconds = 60;
  const [notificationHistory, setNotificationHistory] = useState({})
  const [playDingBellSfx] = useSound(process.env.PUBLIC_URL + '/sounds/dingbell.aac');

  const tempMissingSeconds = 30;

  const [webNotificationSupported, setWebNotificationSupported] = useState(false)

  useEffect(() => {
    const isSupported = 'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window;
    setWebNotificationSupported(isSupported)
    if (!isSupported) {
      console.log("This browser does not support desktop notification")
      return;
    }
    Notification.requestPermission()
  }, [])

  function sendNotification(message) {
    if (notificationHistory[message] && (
      (new Date() - notificationHistory[message]) < (notificationIntervalSeconds * 1000))) {
      // Only send notification every notificationIntervalSeconds
      return;
    }

    // If it's okay let's create a notification
    playDingBellSfx();
    if (webNotificationSupported && Notification.permission === "granted") {
      new Notification(message);
    }
    notification.open({
      message: message,
      duration: 3,
    });
    
    notificationHistory[message] = new Date()
    setNotificationHistory(notificationHistory);
  }

  function addNewTimeTableSession(pinnedSession) {
    setMergedTimeTable(produce(mergedTimeTable, (draftMergeTable) => {
      draftMergeTable.push(getDefaultTimeSlot(true, pinnedSession))
    }));
  }

  function onFaceDetectionResult(detection) {
    // calculate continue time
    const NewMergedTimeTable = produce(mergedTimeTable, (draftMergeTable) => {
      const currDetected = (detection !== undefined)
      if (draftMergeTable.at(-1).detected !== currDetected
        && (draftMergeTable.at(-1).timePeriod < tempMissingSeconds)
        && (draftMergeTable.length > 1)
        && (!draftMergeTable.at(-1).pinnedSession)) {
        // If last section is less than tempMissingSeconds seconds
        // remove last section so that we have a more continous time range.
        draftMergeTable.pop()
      }
  
      if (draftMergeTable.at(-1).detected !== currDetected) {
        draftMergeTable.push(getDefaultTimeSlot(currDetected, false, draftMergeTable.at(-1).endTime))
      }
      else {
        draftMergeTable.at(-1).endTime = new Date().toJSON()
        draftMergeTable.at(-1).timePeriod = (new Date() - new Date(draftMergeTable.at(-1).startTime)) / 1000
      }
    })
    setMergedTimeTable(NewMergedTimeTable);
  }

  useInterval(() => {
    // Update continue face time and continue rest time
    lastTimeSlot.timePeriod = (new Date() - new Date(lastTimeSlot.startTime)) / 1000
    if (lastTimeSlot.detected && (lastTimeSlot.timePeriod > alertStudySeconds)) {
      sendNotification("该休息啦")
    }

    if (!lastTimeSlot.detected && (lastTimeSlot.timePeriod > alertRestSeconds)) {
      sendNotification("休息够啦")
    }
  }, 500, true)

  const statusMessage = lastTimeSlot.detected ? "WORKING" : "REST";

  return (
    <div className={css`margin: 0 15px;`}>
      <p className={
        css`
          font-size: 20vw;
          margin: 0 auto;
          text-align: center;
        `
      }> {statusMessage} </p>

      <ReactFlipClock clockFace='TwelveHourClock' startTime={lastTimeSlot.startTime} />

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