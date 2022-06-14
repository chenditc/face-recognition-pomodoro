import { useEffect, useRef, useState } from 'react';
import useInterval from 'use-interval'
import FlipClock from 'flipclock';
import { Collapse } from 'react-collapse';

import PeriodicFaceDetection from './PeriodicFaceDetection';

import './App.css';
import 'flipclock/dist/flipclock.css';
import { computeReshapedDimensions } from 'face-api.js/build/commonjs/utils';

function ReactFlipClock(props) {
  // From example: 
  // https://github.com/objectivehtml/FlipClock/blob/v0.10.8/examples/load-new-clock-face.html
  const flipclockRef = useRef(null);
  const flipclockElement = useRef(null);
  const startTime = props.startTime;

  useEffect(() => {
    // Recreate flip clock every time start time changed.
    if (flipclockElement.current === null) {
      flipclockElement.current = new FlipClock(flipclockRef.current, startTime, {
        face: 'HourCounter',
        showLabels: false,
      });
      //console.log(flipclockElement.current)
    }
    else {
      if (startTime.getMilliseconds() !== flipclockElement.current.originalValue.getMilliseconds()) {
        flipclockElement.current.originalValue = startTime;
        flipclockElement.current.value = new Date();
      }
      // Some times the clock is out of sync, we need to manually sync them
      if (Math.abs(new Date() - flipclockElement.current.value.value) > 1000) {
        flipclockElement.current.originalValue = startTime;
        flipclockElement.current.value = new Date();
      }
    }
  })

  return (
    <div ref={flipclockRef} />
  )
}

function HealthMonitor(props) {
  const detectionInterval = 5;
  const [continousTimeTable, setContinousTimeTable] = useState([])
  const [mergedTimeTable, setMergedTimeTable] = useState([{
    startTime: new Date(),
    endTime: new Date(),
    detected: true,
    timePeriod: 0
  }])
  const [continueFaceTime, setContinueFaceTime] = useState(0) // in seconds
  const [continueRestTime, setContinueRestTime] = useState(0)
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
    if (lastTimeSlot.detected) {
      setContinueFaceTime(lastTimeSlot.timePeriod)
      if (lastTimeSlot.timePeriod > alertStudySeconds) {
        sendNotification("该休息啦")
      }
    }
    else {
      setContinueRestTime(lastTimeSlot.timePeriod)
      if (lastTimeSlot.timePeriod > alertRestSeconds) {
        sendNotification("休息够啦")
      }
    }

  }, 500, true)

  function formatFromSeconds(inputSeconds) {
    const seconds = Math.floor(inputSeconds % 60);
    const minutes = Math.floor(inputSeconds / 60) % 60;
    const hours = Math.floor(inputSeconds / 3600);
    if (hours > 0) {
      return `${hours}:${minutes}:${seconds}`
    }
    return `${minutes}:${seconds}`
  }

  const counterStartTime = mergedTimeTable.at(-1).startTime
  const studyMessage = `持续学习了 ${formatFromSeconds(continueFaceTime)}`
  return (
    <div>
      <p> {studyMessage} </p>
      <p> 休息了 {formatFromSeconds(continueRestTime)} </p>
      <ReactFlipClock clockFace='TwelveHourClock' startTime={counterStartTime} />
      <Collapse isOpened={true}>

        <PeriodicFaceDetection
          detectionInterval={detectionInterval}
          onFaceDetectionResult={onFaceDetectionResult}
        />
      </Collapse>
    </div>
  )
}

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <HealthMonitor />
      </header>
    </div>
  );
}

export default App;
