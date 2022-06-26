import { Card } from 'antd/lib/card';
import { css } from '@emotion/css'

export function formatSeconds(seconds, preserveSeconds = false) {
    const roundSeconds = Math.floor(seconds)
    if (roundSeconds < 60) {
      return `${roundSeconds}s`
    }
    if (roundSeconds < 3600) {
      const minutes = Math.floor(roundSeconds / 60);
      const secondsResidual = roundSeconds - minutes * 60;
      return preserveSeconds ? `${minutes}m ${secondsResidual}s` : `${minutes}m`;
    }
    const minutes = Math.floor(roundSeconds / 60);
    const minutesResidual = minutes % 60;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutesResidual}m`
  }
  

export function PomodoroCard(props) {
    const record = props.record
    const index = props.index

    const title = index ? `Pomodoro #${index}` : undefined;
  
    return (
      <>
  
  <Card title={title}>
        <div className={
          css`
          display: flex;
          justify-content: space-around;
          align-item: center;
        `
        }>
          <span className={
            css`
          border-radius: 50%;
          background: #b0003a;
          width: 3em;
          height: 3em;
          text-align: center;
          vertical-align: middle;
          display: inline-block;
          line-height: 3em;
          font-size: 1.5em;
          color: white;
          font-weight: bold;
        `
          }>
            {formatSeconds(record.timePeriod)}
          </span>
          <div className={
            css`
              display: flex;
              align-item: center;
              justify-content: space-around;
              flex-direction: column;
            `
          }>
          <p className={
            css`
              font-size: 1.5em;
              font-weight: bold;
              margin: 0 0 0 10px;
            `
          }>
            {new Date(record.startTime).toLocaleTimeString().slice(0, 5)} - {new Date(record.endTime).toLocaleTimeString().slice(0, 5)}
          </p>
          </div>
  
        </div>
  
      </Card>
      </>
    )
  }
