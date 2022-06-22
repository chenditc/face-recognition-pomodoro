import { useContext } from 'react';
import { Timeline } from 'antd';
import { ClockCircleOutlined, SmileOutlined } from '@ant-design/icons';

import { PomoConfigsContext } from '../PomoConfigsContext'
import { formatSeconds, PomodoroCard } from './PomodoroTimeCard';

import { Button } from '@rmwc/button';
import '@rmwc/button/styles';
import { Tooltip } from '@rmwc/tooltip';
import '@rmwc/tooltip/styles';


import {css} from '@emotion/css'

function RestTimeLineItem(props) {
  const record = props.record;
  const index = props.index;
  const onDeleteRestSession = props.onDeleteRestSession;

  return (
    <Timeline.Item color="green" dot={<SmileOutlined />} key={record.startTime}>
      <div className={
        css`
          display: flex;
          justify-content: space-between;
        `
      }>
        <p> Rest for {formatSeconds(record.timePeriod)} </p>
        <Tooltip content="Remove this session, and merge adjacent session." showArrow>
          <Button label="Remove" onClick={() => { onDeleteRestSession(record.startTime) }} />
        </Tooltip>
      </div>
    </Timeline.Item>
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

  const pomodoroList = showTimeSlots.filter((x) => x.detected).map(
    (record, index) => {
      return (
        <Timeline.Item record={record} dot={<ClockCircleOutlined />} key={record.startTime}>
          <PomodoroCard record={record} index={index + 1} />
        </Timeline.Item>
      )
    }
  )
  
  const restList = showTimeSlots.filter((x) => !x.detected).map(
    (record, index) => {
      return (
        <RestTimeLineItem
          record={record}
          index={`rest${index}`}
          onDeleteRestSession={props.onDeleteRestSession}
        />
      )
    }
  )

  const timeLineItems = pomodoroList.concat(restList);
  timeLineItems.sort((a, b) => a.props.record.startTime < b.props.record.startTime ? 1 : -1);

  return (
    <Timeline mode="left">
      {timeLineItems}
    </Timeline>
  )
}

export default PomodoroList