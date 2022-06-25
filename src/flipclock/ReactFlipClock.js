import { useEffect, useRef } from 'react';

import FlipClock from 'flipclock';
import 'flipclock/dist/flipclock.css';
import './flipclock.css'

function ReactFlipClock(props) {
  // From example: 
  // https://github.com/objectivehtml/FlipClock/blob/v0.10.8/examples/load-new-clock-face.html
  const flipclockRef = useRef(null);
  const flipclockElement = useRef(null);
  const startTime = props.startTime;

  useEffect(() => {
    if (flipclockElement.current === null) {
      flipclockElement.current = new FlipClock(flipclockRef.current, new Date(startTime), {
        face: 'HourCounter',
        showLabels: false,
      });
      flipclockElement.current.originalValue = new Date(startTime);
      flipclockElement.current.value = new Date();
      flipclockElement.current.start()
      //console.log(flipclockElement.current)
    }

    if (
      // Start time changed
      (startTime !== flipclockElement.current.originalValue.toJSON()) ||
      // Some times the clock is out of sync, we need to manually sync them
      (Math.abs(new Date() - flipclockElement.current.value.value) > 1000)
    ) {
      flipclockElement.current.originalValue = new Date(startTime);
      flipclockElement.current.value = new Date();
    }
  })

  return (
    <div ref={flipclockRef} />
  )
}

export default ReactFlipClock;