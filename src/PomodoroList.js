import { useContext } from 'react';
import { Card } from 'antd';
//import {Card} from '@rmwc/card';
//import '@rmwc/card/styles';

import { Timeline } from 'antd';
import { ClockCircleOutlined, SmileOutlined } from '@ant-design/icons';

import { css } from '@emotion/css'
import { PomoConfigsContext } from './PomoConfigsContext'

function formatSeconds(seconds) {
  const roundSeconds = Math.floor(seconds)
  if (roundSeconds < 60) {
    return `${roundSeconds}s`
  }
  if (roundSeconds < 3600) {
    const minutes = Math.floor(roundSeconds / 60);
    return `${minutes}m`
  }
  const minutes = Math.floor(roundSeconds / 60);
  const minutesResidual = minutes % 60;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutesResidual}m`
}

function PomodoroCard(props) {
  const record = props.record
  const index = props.index

  return (
    <>

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
            margin: 0;
          `
        }>
          From {new Date(record.startTime).toLocaleTimeString()}
        </p>
        </div>

      </div>

    </Card>
    </>
  )
}

function PomodoroList(props) {
  const mergedTimeTable = props.mergedTimeTable
  const PomoConfigs = useContext(PomoConfigsContext)

  const showTimeSlots = mergedTimeTable
    .filter((record => {
      if (PomoConfigs.history.onlyShowToday) {
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
        <h3>Pomodoro History</h3>
      </div>
      <Timeline mode="left">
        {
          showTimeSlots
            .map((record, index, array) => {
              if (record.detected) {
                return (
                <Timeline.Item dot={<ClockCircleOutlined />} key={index}>
                  <PomodoroCard record={record} index={index + 1} />
                </Timeline.Item>
                )
              }
              else {
                return (
                  <Timeline.Item color="green" dot={<SmileOutlined />} key={index}>
                    <p> Rest for {formatSeconds(record.timePeriod)} </p>
                  </Timeline.Item>
                )
              }
            }).reverse()
        }
      </Timeline>
    </div>
  )
}

export default PomodoroList