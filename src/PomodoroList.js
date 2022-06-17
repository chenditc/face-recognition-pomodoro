import { useState } from 'react';
import { Card } from 'antd';
import { Timeline } from 'antd';
import { Checkbox } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';

import { css } from '@emotion/css'

function PomodoroCard(props) {
  const record = props.record
  const index = props.index
  function formatSeconds(seconds) {
    const roundSeconds = Math.floor(seconds)
    if (roundSeconds < 60) {
      return `${roundSeconds}s`
    }
    if (roundSeconds < 3600) {
      const minutes = Math.floor(roundSeconds / 60);
      const secondsResidual = roundSeconds % 60;
      return `${minutes}m`
    }
    const minutes = Math.floor(roundSeconds / 60);
    const minutesResidual = minutes % 60;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutesResidual}m`
  }

  return (
    <Card title={`Pomodoro #${index}`}>
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
        width: 4em;
        height: 4em;
        text-align: center;
        vertical-align: middle;
        display: inline-block;
        line-height: 4em;
        font-size: 2em;
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
            font-size: 2em;
            font-weight: bold;
            margin: 0;
          `
        }>
          From {new Date(record.startTime).toLocaleTimeString()}
        </p>
        </div>

      </div>

    </Card>
  )
}

function PomodoroList(props) {
  const mergedTimeTable = props.mergedTimeTable
  const [todayOnly, setTodayOnly] = useState(true)

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
                <Timeline.Item dot={<ClockCircleOutlined />} key={index}>
                  <PomodoroCard record={record} index={index + 1} />
                </Timeline.Item>
              )
            }).reverse()
        }
      </Timeline>
    </div>
  )
}

export default PomodoroList