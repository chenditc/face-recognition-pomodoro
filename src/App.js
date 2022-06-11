import { useState } from 'react';
import useInterval from 'use-interval'
import Clock from 'react-clock';

import PeriodicFaceDetection from './PeriodicFaceDetection';

import './App.css';

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
    lastTimeSlot.detected ?
      setContinueFaceTime(lastTimeSlot.timePeriod) :
      setContinueRestTime(lastTimeSlot.timePeriod);

    if (continueFaceTime > alertStudySeconds && lastTimeSlot.detected) {
      // Alert need to rest
      sendNotification("该休息啦")
    }
    if (continueRestTime > alertRestSeconds && !lastTimeSlot.detected) {
      sendNotification("休息够啦")
    }
  }, 500, true)

  const studySeconds = continueFaceTime;
  let studyMessage = `您已经持续学习了 ${studySeconds.toFixed(0)} 秒`
  if (studySeconds > 3600) {
    const studyTimeInHour = studySeconds / 3600
    studyMessage = `您已经持续学习了 ${studyTimeInHour.toFixed(2)} 小时`
  }
  else if (studySeconds > 60) {
    const studyMinutes = studySeconds / 60;
    studyMessage = `您已经持续学习了 ${studyMinutes.toFixed(2)} 分钟`
  }

  return (
    <div>
      <p> {studyMessage} </p>
      <p> 您已经持续休息了 {continueRestTime} 秒 </p>
      <Clock value={new Date()} />
      <PeriodicFaceDetection
        detectionInterval={detectionInterval}
        onFaceDetectionResult={onFaceDetectionResult}
      />
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
