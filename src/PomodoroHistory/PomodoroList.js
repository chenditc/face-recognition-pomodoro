import { useContext } from 'react';
//import {Card} from '@rmwc/card';
//import '@rmwc/card/styles';

import { Timeline } from 'antd';
import { ClockCircleOutlined, SmileOutlined } from '@ant-design/icons';

import { css } from '@emotion/css'
import { PomoConfigsContext } from '../PomoConfigsContext'
import { formatSeconds, PomodoroCard } from './PomodoroTimeCard';


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