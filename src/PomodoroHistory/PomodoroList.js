import { useContext } from 'react';
import { Timeline } from 'antd';
import { ClockCircleOutlined, SmileOutlined } from '@ant-design/icons';

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
  )
}

export default PomodoroList