import { useState } from 'react';
import useInterval from 'use-interval'
import { css } from '@emotion/css'
import { useLocalStorageState } from 'ahooks';
import { Button } from 'antd';
import { Card } from 'antd';
import { Timeline } from 'antd';
import { Checkbox } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';

import PeriodicFaceDetection from './PeriodicFaceDetection';
import ReactFlipClock from './ReactFlipClock.js'

function PomodoroList(mergedTimeTable) {
  const [todayOnly, setTodayOnly] = useState(true)

  function formatSeconds(seconds) {
    const roundSeconds = Math.floor(seconds)
    if (roundSeconds < 60) {
      return `${roundSeconds}s`
    }
    if (roundSeconds < 3600) {
      const minutes = Math.floor(roundSeconds / 60);
      const secondsResidual = roundSeconds % 60;
      return `${minutes}m ${secondsResidual}s`
    }
    const minutes = Math.floor(roundSeconds / 60);
    const minutesResidual = minutes % 60;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutesResidual}m`
  }

  const showTimeSlots = mergedTimeTable
    .filter((record) => record.detected)
    .filter((record => {
      if (todayOnly) {
        return (new Date(record.startTime).toDateString() === new Date().toDateString())
      }
      return true
    }))

  console.log(showTimeSlots)
  return (
    <div>
      <div className={
        css`
          display: flex;
          justify-content: space-between;
          margin: 5px auto;
          flex-wrap: wrap;
        `
      }>
        <h3>Pomodoro List</h3>
        <Checkbox checked={todayOnly} onChange={() => setTodayOnly(x => !x)}>Show Today Only </Checkbox>
      </div>
      <Timeline mode="left">
        {
          showTimeSlots
            .map((record, index, array) => {
              return (
                <Timeline.Item
                  dot={
                    <ClockCircleOutlined
                      style={{
                        fontSize: '16px',
                      }}
                    />
                  }>
                  <Card title={`Pomodoro #${index + 1}`}>
                    <p>{new Date(record.startTime).toLocaleTimeString()} : {formatSeconds(record.timePeriod)}</p>
                  </Card>
                </Timeline.Item>
              )
            }).reverse()
        }
      </Timeline>
    </div>
  )
}

function HealthMonitor(props) {
  const detectionInterval = 5;
  const [continousTimeTable, setContinousTimeTable] = useState([])
  const [mergedTimeTable, setMergedTimeTable] = useLocalStorageState('mergedTimeTable', {
    defaultValue: [{
      startTime: new Date().toJSON(),
      endTime: new Date().toJSON(),
      detected: true,
      timePeriod: 0,
      pinnedSession: false
    }],
  });
  /*
  const [mergedTimeTable, setMergedTimeTable] = useState([{
    startTime: new Date(),
    endTime: new Date(),
    detected: true,
    timePeriod: 0
  }])
  */
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
    <div>
      <p className={
        css`
          font-size: 20vw;
          margin: 0 auto;
          text-align: center;
        `
      }> {statusMessage} </p>

      <div className={
        css`
          margin: 0 15px;
        `
      }>
        <ReactFlipClock clockFace='TwelveHourClock' startTime={mergedTimeTable.at(-1).startTime} />
        <Button block onClick={() => addNewTimeTableSession(true)}>
          New Pomodoro Session
        </Button>
      </div>

      <PeriodicFaceDetection
        detectionInterval={detectionInterval}
        onFaceDetectionResult={onFaceDetectionResult}
      />
      <div className={
        css`
          margin: 0 15px
        `
      }>
        {PomodoroList(mergedTimeTable)}
      </div>

    </div>
  )
}

export default HealthMonitor;