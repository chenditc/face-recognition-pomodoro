import { useContext } from 'react';
import { Timeline } from 'antd';
import { ClockCircleOutlined, SmileOutlined } from '@ant-design/icons';

import { PomoConfigsContext } from '../UserConfigs/PomoConfigsContext'
import { formatSeconds, PomodoroCard } from './PomodoroTimeCard';

import { Button } from '@rmwc/button';
import '@rmwc/button/styles';
import { Tooltip } from '@rmwc/tooltip';
import '@rmwc/tooltip/styles';


import {css} from '@emotion/css'
import { useI18n } from '../i18n';

function RestTimeLineItem(props) {
  const { locale, t } = useI18n();
  const record = props.record;
  const onDeleteRestSession = props.onDeleteRestSession;

  return (
    <Timeline.Item color="green" dot={<SmileOutlined />}>
      <div className={
        css`
          display: flex;
          justify-content: space-between;
        `
      }>
        <p>{t('history.restFor', { duration: formatSeconds(record.timePeriod, false, locale) })}</p>
        <Tooltip content={t('history.removeRestTooltip')} showArrow>
          <Button label={t('common.remove')} onClick={() => { onDeleteRestSession(record.startTime) }} />
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
          key={record.startTime}
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
