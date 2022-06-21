import { useEffect, useState } from 'react';
import useInterval from 'use-interval'
import { css } from '@emotion/css'
import { useLocalStorageState } from 'ahooks';
import useSound from 'use-sound';
import { notification } from 'antd';
import produce from 'immer';
import { useContext } from 'react';

import { Grid, GridCell } from '@rmwc/grid'
import '@rmwc/grid/styles';

import PeriodicFaceDetection from './PeriodicFaceDetection';
import ReactFlipClock from './ReactFlipClock.js'
import PomodoroList from './PomodoroList';
import { PomoConfigsContext } from './PomoConfigsContext'

function HealthMonitor() {
  const PomoConfigs = useContext(PomoConfigsContext);

  const alertStudySeconds = PomoConfigs.alertStudySeconds;
  const alertRestSeconds = PomoConfigs.alertRestSeconds;
  const maxLocalStorageTimeSlot = PomoConfigs.history.maxLocalStorageTimeSlot;

  function getDefaultTimeSlot(detected = true, pinnedSession = false, startTime = null) {
    const usedStateTime = startTime ? startTime : new Date().toJSON();

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
      // Keep only last maxLocalStorageTimeSlot session for now
      return storedTable.slice(0 - maxLocalStorageTimeSlot)
    }
  });

  const lastTimeSlot = mergedTimeTable.at(-1)

  const [notificationHistory, setNotificationHistory] = useState({})
  const [playDingBellSfx] = useSound(process.env.PUBLIC_URL + '/sounds/dingbell.aac');

  const tempMissingSeconds = PomoConfigs.tempMissingSeconds;

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
    if (PomoConfigs.enableNotification) {
      Notification.requestPermission();
    }
  }, [PomoConfigs.enableNotification])

  function sendNotification(message) {
    if (notificationHistory[message] && (
      (new Date() - notificationHistory[message].lastSendTime) < (notificationHistory[message].nextSendInterval * 1000))) {
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

    const nextSendInterval = notificationHistory[message] ?
      notificationHistory[message].nextSendInterval * 2 :
      PomoConfigs.notificationIntervalSeconds;

    notificationHistory[message] = {
      lastSendTime: new Date(),
      nextSendInterval: nextSendInterval
    }
    setNotificationHistory(notificationHistory);
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
        return;
      }

      // If work time not refreshed for some time, start a new session, as computer lock will prevent camera show
      if (draftMergeTable.at(-1).detected && (new Date() - new Date(draftMergeTable.at(-1).endTime)) > 1000 * PomoConfigs.tempMissingSeconds) {
        // Add a rest session
        draftMergeTable.push(getDefaultTimeSlot(false, false, draftMergeTable.at(-1).endTime))
        // Add a work session
        draftMergeTable.push(getDefaultTimeSlot(true, false, new Date()))
        return;
      }

      draftMergeTable.at(-1).endTime = new Date().toJSON()
      draftMergeTable.at(-1).timePeriod = (new Date() - new Date(draftMergeTable.at(-1).startTime)) / 1000

    })
    setMergedTimeTable(NewMergedTimeTable);
  }

  useInterval(() => {
    // Update continue face time and continue rest time
    const timePeriod = (new Date() - new Date(lastTimeSlot.startTime)) / 1000
    if (lastTimeSlot.detected && (timePeriod > alertStudySeconds)) {
      sendNotification("该休息啦")
      return;
    }

    if (!lastTimeSlot.detected && (timePeriod > alertRestSeconds)) {
      sendNotification("休息够啦")
      return;
    }
    if (timePeriod > PomoConfigs.tempMissingSeconds) {
      setNotificationHistory({})
    }
  }, 500, true)

  const statusMessage = lastTimeSlot.detected ? "WORKING" : "REST";

  return (
    <div className={
      css`
      margin: 0 15px;
      max-width: 700px;
      min-width: 350px;
      @media (min-width: 730px) {
        margin: 0 auto;
      }
      `
    }>
      <Grid>
        <GridCell span={12}>
          <p className={
            css`
            font-size: 20vw;
            margin: 0 auto;
            text-align: center;
            @media (min-width: 700px) {
              font-size: 140px;
            }
            @media (max-width: 350px) {
              font-size: 75px;
            }
          `
          }> {statusMessage} </p>
        </GridCell>
        <GridCell span={12}>
        <ReactFlipClock clockFace='TwelveHourClock' startTime={lastTimeSlot.startTime} />
        </GridCell>
        <GridCell span={12}>
        <PeriodicFaceDetection
          onFaceDetectionResult={onFaceDetectionResult}
        />
        </GridCell>
        <GridCell span={12}>
          {
            PomoConfigs.history.showPomodoroHistory ? <PomodoroList mergedTimeTable={mergedTimeTable} /> : <></>
          }
        </GridCell>
      </Grid>      
    </div>
  )
}

export default HealthMonitor;