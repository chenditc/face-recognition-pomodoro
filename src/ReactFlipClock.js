import { useEffect, useRef } from 'react';
import { css } from '@emotion/css'

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

export default ReactFlipClock;