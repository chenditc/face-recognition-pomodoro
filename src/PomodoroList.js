import { useState } from 'react';
import { Card } from 'antd';
import { Timeline } from 'antd';
import { Checkbox } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';

import { css } from '@emotion/css'

function PomodoroList(props) {
  const mergedTimeTable = props.mergedTimeTable
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

export default PomodoroList