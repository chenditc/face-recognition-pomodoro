import { useEffect, useState } from 'react';
import useInterval from 'use-interval'
import { css } from '@emotion/css'
import { useLocalStorageState } from 'ahooks';
import useSound from 'use-sound';
import produce from 'immer';
import { useContext, Suspense } from 'react';
import React from 'react';

import { Grid, GridCell } from '@rmwc/grid'
import '@rmwc/grid/styles';
import { Snackbar, SnackbarAction } from '@rmwc/snackbar';
import '@rmwc/snackbar/styles';

import PeriodicFaceDetection from './PeriodicFaceDetection';
import ReactFlipClock from '../flipclock/ReactFlipClock.js'
import { PomoConfigsContext } from '../UserConfigs/PomoConfigsContext'
import { PomoStatus } from '../PomodoroStatus/PomodStatus'

import { formatSeconds } from '../PomodoroHistory/PomodoroTimeCard'

const PlayerWithStatus = React.lazy(() => import('../BackgroundPlayers/PlayerWithStatus'));
const PomodoroList = React.lazy(() => import('../PomodoroHistory/PomodoroList'));
const PomodoroHistoryTimeChart = React.lazy(() => import('../PomodoroHistory/PomodoroTimeChart'));

function HealthMonitor(props) {
  const PomoConfigs = useContext(PomoConfigsContext);

  const alertStudySeconds = PomoConfigs.alertStudySeconds;
  const alertRestSeconds = PomoConfigs.alertRestSeconds;
  const maxLocalStorageTimeSlot = PomoConfigs.history.maxLocalStorageTimeSlot;

  const [snackbarMessage, setSnackBarMessage] = useState("");
  const [snackbarOpen, setSnackBarOpen] = useState(false);
  const [overTime, setOverTime] = useState(false);

  function getDefaultTimeSlot(detected = true, startTime = null) {
    console.log(new Date(), "Added new session: detected:", detected, "startTime", startTime);
    const usedStateTime = startTime ? startTime : new Date().toJSON();
    const timePeriod = Math.floor((new Date() - new Date(usedStateTime)) / 1000);
    return {
      startTime: usedStateTime,
      endTime: new Date().toJSON(),
      detected: detected,
      timePeriod: timePeriod
    }
  }
  const [mergedTimeTable, setMergedTimeTable] = useLocalStorageState('mergedTimeTable', {
    defaultValue: [],
    serializer: (v) => JSON.stringify(v),
    deserializer: (v) => {
      const storedTable = JSON.parse(v)
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

  function sendNotification(message, icon) {
    if (notificationHistory[message] && (
      (new Date() - notificationHistory[message].lastSendTime) < (notificationHistory[message].nextSendInterval * 1000))) {
      // Only send notification every notificationIntervalSeconds
      return;
    }

    // If it's okay let's create a notification
    playDingBellSfx();
    if (webNotificationSupported && Notification.permission === "granted") {
      new Notification(message, { icon: icon, badge: icon });
    }

    setSnackBarOpen(true);
    setSnackBarMessage(message);

    const nextSendInterval = notificationHistory[message] ?
      notificationHistory[message].nextSendInterval * PomoConfigs.notificationIntervalMultiplier :
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
        && (draftMergeTable.at(-1).timePeriod < tempMissingSeconds)) {
        // If last section is less than tempMissingSeconds seconds
        // remove last section so that we have a more continous time range.
        draftMergeTable.pop();
      }

      if (draftMergeTable.length === 0) {
        draftMergeTable.push(getDefaultTimeSlot(currDetected))
        return;
      }

      if (draftMergeTable.at(-1).detected !== currDetected) {
        draftMergeTable.push(getDefaultTimeSlot(currDetected, draftMergeTable.at(-1).endTime))
        return;
      }

      // If work time not refreshed for some time, start a new session, as computer lock will prevent camera show
      if (currDetected && draftMergeTable.at(-1).detected && (new Date() - new Date(draftMergeTable.at(-1).endTime)) > 1000 * PomoConfigs.tempMissingSeconds) {
        // Add a rest session
        draftMergeTable.push(getDefaultTimeSlot(false, draftMergeTable.at(-1).endTime))
        // Add a work session
        draftMergeTable.push(getDefaultTimeSlot(true, new Date().toJSON()))
        return;
      }

      draftMergeTable.at(-1).endTime = new Date().toJSON()
      draftMergeTable.at(-1).timePeriod = (new Date() - new Date(draftMergeTable.at(-1).startTime)) / 1000

    })
    setMergedTimeTable(NewMergedTimeTable);
  }

  function deleteRestSession(startTime) {
    setMergedTimeTable(
      mergedTimeTable.reduce((prevList, currentTimeSlot) => {
        const newList = prevList.slice();
        if ((currentTimeSlot.startTime === startTime) ||
          (prevList.at(-1)
            && prevList.at(-1).endTime === currentTimeSlot.startTime
            && prevList.at(-1).detected === currentTimeSlot.detected)) {
          // Merge slots
          const newObject = {
            ...newList.at(-1),
            endTime: currentTimeSlot.endTime,
            timePeriod: (new Date(prevList.at(-1).endTime) - new Date(prevList.at(-1).startTime)) / 1000
          }
          newList.pop()
          newList.push(newObject);
          return newList;
        }
        newList.push(currentTimeSlot);
        return newList;
      }, [])
    )
  }

  useInterval(() => {
    // Update continue face time and continue rest time
    const timePeriod = (new Date() - new Date(lastTimeSlot.startTime)) / 1000
    if (lastTimeSlot.detected && (timePeriod > alertStudySeconds)) {
      setOverTime(true);
      document.title = PomoConfigs.restNotificationText;
      const iconUrl = "https://chenditc.github.io/face-recognition-pomodoro/images/relax.png"
      sendNotification(PomoConfigs.restNotificationText, iconUrl)
      return;
    }

    if (!lastTimeSlot.detected && (timePeriod > alertRestSeconds)) {
      setOverTime(true);
      document.title = PomoConfigs.focusNotificationText;
      const iconUrl = "https://chenditc.github.io/face-recognition-pomodoro/images/focus.png"
      sendNotification(PomoConfigs.focusNotificationText, iconUrl)
      return;
    }

    document.title = formatSeconds(timePeriod, true);
    setOverTime(false);
    // Only change when there is some item, prevent rerender
    if ((timePeriod > PomoConfigs.tempMissingSeconds) && (Object.keys(notificationHistory).length > 0)) {
      setNotificationHistory({})
    }
  }, 500, true)

  return (
    <>
      {
        PomoConfigs.enablePlayer ?
      <Suspense fallback={<div>Loading...</div>}>
        <PlayerWithStatus focus={lastTimeSlot.detected} overTime={overTime} startTime={lastTimeSlot.startTime} />
      </Suspense> : <></>
      }
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
        <Snackbar
          open={snackbarOpen}
          onClose={() => setSnackBarOpen(false)}
          message={snackbarMessage}
          dismissesOnAction
          action={
            <SnackbarAction
              label="Dismiss"
              onClick={() => console.log('Dismiss notification')}
            />
          }
        />
        <Grid>
          <GridCell span={12}>
            <PomoStatus focus={lastTimeSlot.detected} />
          </GridCell>
          <GridCell span={12}>
            <ReactFlipClock startTime={lastTimeSlot.startTime} />
          </GridCell>
          <GridCell span={12}>
            <PeriodicFaceDetection
              onFaceDetectionResult={onFaceDetectionResult}
            />
          </GridCell>
          {
            PomoConfigs.history.showPomodoroHistory ?
              <GridCell span={12}>
                <h3>Pomodoro History</h3>
                <Suspense fallback={<div>Loading...</div>}>
                  <PomodoroHistoryTimeChart mergedTimeTable={mergedTimeTable} />
                  <PomodoroList mergedTimeTable={mergedTimeTable} onDeleteRestSession={deleteRestSession} />
                </Suspense>
              </GridCell> : <></>
          }
        </Grid>

      </div>
    </>
  )
}

export default HealthMonitor;