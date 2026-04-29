import Card from 'antd/lib/card';
import { css } from '@emotion/css'
import { formatDuration, getLocaleTimeCode, useI18n } from '../i18n';

export function formatSeconds(seconds, preserveSeconds = false, locale) {
    return formatDuration(seconds, preserveSeconds, locale)
  }

export function PomodoroCard(props) {
    const i18n = useI18n();
    const locale = props.locale || i18n.locale;
    const t = props.t || i18n.t;
    const record = props.record
    const index = props.index

    const title = index ? t('history.pomodoroCardTitle', { index }) : undefined;
    const localeTimeCode = getLocaleTimeCode(locale);
  
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
            {formatSeconds(record.timePeriod, false, locale)}
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
            {new Date(record.startTime).toLocaleTimeString(localeTimeCode, { hour: '2-digit', minute: '2-digit' })} - {new Date(record.endTime).toLocaleTimeString(localeTimeCode, { hour: '2-digit', minute: '2-digit' })}
          </p>
          </div>
  
        </div>
  
      </Card>
      </>
    )
  }
