import { Suspense, useCallback, useContext, useEffect, useRef, useState } from 'react';
import React from 'react';
import useInterval from 'use-interval';
import { css } from '@emotion/css';
import { useLocalStorageState } from 'ahooks';
import useSound from 'use-sound';
import produce from 'immer';

import { Grid, GridCell } from '@rmwc/grid';
import '@rmwc/grid/styles';
import { Snackbar, SnackbarAction } from '@rmwc/snackbar';
import '@rmwc/snackbar/styles';
import { Button } from '@rmwc/button';
import '@rmwc/button/styles';
import { LinearProgress } from '@rmwc/linear-progress';
import '@rmwc/linear-progress/styles';

import PeriodicFaceDetection from './PeriodicFaceDetection';
import ReactFlipClock from '../flipclock/ReactFlipClock.js';
import { PomoConfigsContext } from '../UserConfigs/PomoConfigsContext';
import { PomoStatus, pomoStatusClassName } from '../PomodoroStatus/PomodStatus';
import { useI18n } from '../i18n';
import { isAuthorizedFaceEnrolled } from '../FaceAuthorization/authorizedFaceUtils';
import { formatSeconds } from '../PomodoroHistory/PomodoroTimeCard';

const PlayerWithStatus = React.lazy(() => import('../BackgroundPlayers/PlayerWithStatus'));
const PomodoroList = React.lazy(() => import('../PomodoroHistory/PomodoroList'));
const PomodoroHistoryTimeChart = React.lazy(() => import('../PomodoroHistory/PomodoroTimeChart'));

function getInitialFaceAuthState(isEnrolled) {
  return {
    status: isEnrolled ? 'camera-reconnecting' : 'not-enrolled',
    rawFaceCount: 0,
    similarity: 0,
    cameraReady: false,
  };
}

function getDisplayStatus(faceAuthState, authorizedFaceEnrolled, enrollmentDialogOpen) {
  if (enrollmentDialogOpen) return 'enrolling-face';
  if (!authorizedFaceEnrolled) return 'not-enrolled';
  return faceAuthState?.status || 'camera-reconnecting';
}

function getStatusLabel(status, t) {
  if (status === 'authorized') return t('status.working');
  if (status === 'unknown-face') return t('status.unknownFace');
  if (status === 'not-enrolled') return t('status.noAuthorizedFace');
  if (status === 'profile-incompatible') return t('status.profileIncompatible');
  if (status === 'camera-reconnecting') return t('status.cameraReconnecting');
  if (status === 'enrolling-face') return t('status.enrollingFace');
  return t('status.rest');
}

function getStatusBarCopy(status, t) {
  const styles = {
    authorized: { background: 'rgba(56, 142, 60, 0.12)', border: '#2e7d32', text: '#1b5e20' },
    'no-face': { background: 'rgba(97, 97, 97, 0.12)', border: '#616161', text: '#424242' },
    'unknown-face': { background: 'rgba(198, 40, 40, 0.12)', border: '#c62828', text: '#7f0000' },
    'not-enrolled': { background: 'rgba(21, 101, 192, 0.12)', border: '#1565c0', text: '#0d47a1' },
    'profile-incompatible': { background: 'rgba(255, 143, 0, 0.12)', border: '#ff8f00', text: '#e65100' },
    'camera-reconnecting': { background: 'rgba(239, 108, 0, 0.12)', border: '#ef6c00', text: '#e65100' },
    'enrolling-face': { background: 'rgba(191, 54, 12, 0.12)', border: '#bf360c', text: '#8d2c08' },
  };
  const copy = {
    authorized: t('authBar.authorized'),
    'no-face': t('authBar.noFace'),
    'unknown-face': t('authBar.unknownFace'),
    'not-enrolled': t('authBar.notEnrolled'),
    'profile-incompatible': t('authBar.profileIncompatible'),
    'camera-reconnecting': t('authBar.cameraReconnecting'),
    'enrolling-face': t('authBar.enrollingFace'),
  };

  return {
    ...(styles[status] || styles['no-face']),
    message: copy[status] || copy['no-face'],
  };
}

function EnrollmentPromptCard(props) {
  const { t } = useI18n();

  return (
    <div className={css`
      display: grid;
      gap: 14px;
      padding: 20px;
      border-radius: 24px;
      background:
        radial-gradient(circle at top left, rgba(255, 204, 128, 0.45), transparent 40%),
        linear-gradient(135deg, rgba(21, 101, 192, 0.08), rgba(191, 54, 12, 0.12));
      border: 1px solid rgba(21, 101, 192, 0.14);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.06);
    `}>
      <div className={css`display: grid; gap: 6px;`}>
        <div className={css`
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #1565c0;
        `}>
          {t('config.sections.authorizedFace')}
        </div>
        <div className={css`
          font-size: 26px;
          line-height: 1.1;
          font-weight: 700;
          color: #1f1f1f;
        `}>
          {t('enrollmentPrompt.title')}
        </div>
        <div className={css`
          font-size: 14px;
          line-height: 1.5;
          color: #4e4e4e;
          max-width: 560px;
        `}>
          {t('enrollmentPrompt.body')}
        </div>
      </div>
      <div className={css`display: flex; gap: 12px; flex-wrap: wrap;`}>
        <Button raised label={t('enrollmentPrompt.start')} onClick={props.onStart} />
        <Button outlined label={t('enrollmentPrompt.skip')} onClick={props.onDismiss} />
      </div>
    </div>
  );
}

function IdentityStatusBar(props) {
  const { t } = useI18n();
  const statusCopy = getStatusBarCopy(props.status, t);

  return (
    <div className={css`
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 16px;
      border-left: 5px solid ${statusCopy.border};
      background: ${statusCopy.background};
      color: ${statusCopy.text};
      font-size: 14px;
      font-weight: 600;
    `}>
      <span>{statusCopy.message}</span>
      {props.status === 'unknown-face' && props.similarity > 0 ? (
        <span className={css`font-size: 12px; opacity: 0.75;`}>
          {Math.round(props.similarity * 100)}%
        </span>
      ) : null}
    </div>
  );
}

function HealthMonitor(props) {
  const PomoConfigs = useContext(PomoConfigsContext);
  const { locale, t } = useI18n();

  const alertStudySeconds = PomoConfigs.alertStudySeconds;
  const alertRestSeconds = PomoConfigs.alertRestSeconds;
  const maxLocalStorageTimeSlot = PomoConfigs.history.maxLocalStorageTimeSlot;
  const tempMissingSeconds = PomoConfigs.tempMissingSeconds;

  const [snackbarMessage, setSnackBarMessage] = useState('');
  const [snackbarOpen, setSnackBarOpen] = useState(false);
  const [overTime, setOverTime] = useState(false);
  const [notificationHistory, setNotificationHistory] = useState({});
  const [webNotificationSupported, setWebNotificationSupported] = useState(false);
  const [faceAuthState, setFaceAuthState] = useState(getInitialFaceAuthState(isAuthorizedFaceEnrolled(props.authorizedFaceProfile)));
  const [enrollmentPromptDismissed, setEnrollmentPromptDismissed] = useState(false);
  const awayStartedAtRef = useRef(null);

  const [mergedTimeTable, setMergedTimeTable] = useLocalStorageState('mergedTimeTable', {
    defaultValue: [],
    serializer: (value) => JSON.stringify(value),
    deserializer: (value) => {
      const storedTable = JSON.parse(value);
      return storedTable.slice(0 - maxLocalStorageTimeSlot);
    }
  });
  const [lastPostureSwitchTime, setLastPostureSwitchTime] = useLocalStorageState('lastPostureSwitchTime', {
    defaultValue: new Date().toJSON(),
    serializer: (value) => JSON.stringify(value),
    deserializer: (value) => JSON.parse(value),
  });
  const [postureReminderSent, setPostureReminderSent] = useLocalStorageState('postureReminderSent', {
    defaultValue: false,
  });

  const [playDingBellSfx] = useSound(process.env.PUBLIC_URL + '/sounds/dingbell.aac');

  const authorizedFaceEnrolled = isAuthorizedFaceEnrolled(props.authorizedFaceProfile);
  const modalOpen = props.configDialogOpen || props.introDialogOpen || props.enrollmentDialogOpen;
  const displayStatus = getDisplayStatus(faceAuthState, authorizedFaceEnrolled, props.enrollmentDialogOpen);
  const trackingSuspended = displayStatus === 'not-enrolled' || displayStatus === 'profile-incompatible' || displayStatus === 'enrolling-face';
  const lastTimeSlot = mergedTimeTable.at(-1);
  const displayFocus = displayStatus === 'authorized';
  const displayStatusLabel = getStatusLabel(displayStatus, t);
  const statusClassName = displayStatus === 'authorized' || displayStatus === 'no-face'
    ? pomoStatusClassName
    : `${pomoStatusClassName} ${css`
      font-size: clamp(56px, 12vw, 108px);
      line-height: 0.95;
      letter-spacing: 0.03em;
      word-break: break-word;
    `}`;
  const displayClockStartTime = trackingSuspended
    ? new Date().toJSON()
    : (lastTimeSlot?.startTime || new Date().toJSON());

  useEffect(() => {
    const isSupported = 'Notification' in window &&
      'serviceWorker' in navigator &&
      'PushManager' in window;
    setWebNotificationSupported(isSupported);
    if (!isSupported) {
      console.log('This browser does not support desktop notification');
      return;
    }
    if (PomoConfigs.enableNotification) {
      Notification.requestPermission();
    }
  }, [PomoConfigs.enableNotification]);

  useEffect(() => {
    if (props.enrollmentDialogOpen) {
      setFaceAuthState((currentState) => ({
        ...currentState,
        status: 'enrolling-face',
      }));
      return;
    }

    if (!authorizedFaceEnrolled) {
      setFaceAuthState(getInitialFaceAuthState(false));
      return;
    }

    setFaceAuthState((currentState) => {
      if (currentState.status === 'authorized' || currentState.status === 'unknown-face' || currentState.status === 'no-face') {
        return currentState;
      }
      return getInitialFaceAuthState(true);
    });
  }, [props.enrollmentDialogOpen, authorizedFaceEnrolled]);

  useEffect(() => {
    if (authorizedFaceEnrolled) {
      setEnrollmentPromptDismissed(false);
    }
  }, [authorizedFaceEnrolled]);

  useEffect(() => {
    if (displayStatus === 'profile-incompatible') {
      setEnrollmentPromptDismissed(false);
    }
  }, [displayStatus]);

  function getDefaultTimeSlot(detected = true, startTime = null) {
    console.log(new Date(), 'Added new session: detected:', detected, 'startTime', startTime);
    const usedStateTime = startTime ? startTime : new Date().toJSON();
    const timePeriod = Math.floor((new Date() - new Date(usedStateTime)) / 1000);
    return {
      startTime: usedStateTime,
      endTime: new Date().toJSON(),
      detected: detected,
      timePeriod: timePeriod
    };
  }

  function sendNotification(message, icon) {
    if (notificationHistory[message] && (
      (new Date() - notificationHistory[message].lastSendTime) < (notificationHistory[message].nextSendInterval * 1000))) {
      return;
    }

    playDingBellSfx();
    if (webNotificationSupported && Notification.permission === 'granted') {
      new Notification(message, { icon: icon, badge: icon });
    }

    setSnackBarOpen(true);
    setSnackBarMessage(message);

    const nextSendInterval = notificationHistory[message] ?
      notificationHistory[message].nextSendInterval * PomoConfigs.notificationIntervalMultiplier :
      PomoConfigs.notificationIntervalSeconds;

    notificationHistory[message] = {
      lastSendTime: new Date(),
      nextSendInterval: nextSendInterval
    };
    setNotificationHistory(notificationHistory);
  }

  const beginAwayPeriod = useCallback((startTime = new Date().toJSON()) => {
    if (awayStartedAtRef.current) return;
    awayStartedAtRef.current = startTime;
  }, []);

  const endAwayPeriod = useCallback((endTime = new Date().toJSON()) => {
    if (!awayStartedAtRef.current) return 0;
    const awaySeconds = (new Date(endTime) - new Date(awayStartedAtRef.current)) / 1000;
    awayStartedAtRef.current = null;
    return awaySeconds;
  }, []);

  const resetPostureTimer = useCallback((nextTime = new Date().toJSON()) => {
    setLastPostureSwitchTime(nextTime);
    setPostureReminderSent(false);
  }, [setLastPostureSwitchTime, setPostureReminderSent]);

  function onFaceDetectionResult(nextFaceAuthState) {
    setFaceAuthState(nextFaceAuthState);

    if (!nextFaceAuthState || nextFaceAuthState.status === 'not-enrolled' || nextFaceAuthState.status === 'profile-incompatible' || nextFaceAuthState.status === 'enrolling-face') {
      return;
    }

    const currDetected = nextFaceAuthState.status === 'authorized';
    if (!currDetected) {
      beginAwayPeriod();
    }
    else if (endAwayPeriod() >= tempMissingSeconds) {
      resetPostureTimer();
    }

    const newMergedTimeTable = produce(mergedTimeTable, (draftMergeTable) => {
      if (draftMergeTable.length === 0) {
        draftMergeTable.push(getDefaultTimeSlot(currDetected));
        return;
      }

      if (draftMergeTable.at(-1).detected !== currDetected
        && (draftMergeTable.at(-1).timePeriod < tempMissingSeconds)) {
        draftMergeTable.pop();
      }

      if (currDetected && ((new Date() - new Date(draftMergeTable.at(-1).endTime)) > 1000 * tempMissingSeconds)) {
        draftMergeTable.push(getDefaultTimeSlot(false, draftMergeTable.at(-1).endTime));
        draftMergeTable.push(getDefaultTimeSlot(true, new Date().toJSON()));
        return;
      }

      if (draftMergeTable.at(-1).detected !== currDetected) {
        draftMergeTable.push(getDefaultTimeSlot(currDetected, draftMergeTable.at(-1).endTime));
        return;
      }

      draftMergeTable.at(-1).endTime = new Date().toJSON();
      draftMergeTable.at(-1).timePeriod = (new Date() - new Date(draftMergeTable.at(-1).startTime)) / 1000;
    });
    setMergedTimeTable(newMergedTimeTable);
  }

  useEffect(() => {
    if (trackingSuspended) {
      awayStartedAtRef.current = null;
      return undefined;
    }

    function handleVisibilityChange() {
      if (document.visibilityState === 'hidden') {
        beginAwayPeriod();
        return;
      }

      if (document.visibilityState === 'visible' && faceAuthState?.status === 'authorized'
        && endAwayPeriod() >= tempMissingSeconds) {
        resetPostureTimer();
      }
    }

    function handleResume() {
      if (faceAuthState?.status === 'authorized' && endAwayPeriod() >= tempMissingSeconds) {
        resetPostureTimer();
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pageshow', handleResume);
    window.addEventListener('focus', handleResume);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pageshow', handleResume);
      window.removeEventListener('focus', handleResume);
    };
  }, [beginAwayPeriod, endAwayPeriod, faceAuthState?.status, resetPostureTimer, tempMissingSeconds, trackingSuspended]);

  function deleteRestSession(startTime) {
    setMergedTimeTable(
      mergedTimeTable.reduce((prevList, currentTimeSlot) => {
        const newList = prevList.slice();
        if ((currentTimeSlot.startTime === startTime) ||
          (prevList.at(-1)
            && prevList.at(-1).endTime === currentTimeSlot.startTime
            && prevList.at(-1).detected === currentTimeSlot.detected)) {
          const newObject = {
            ...newList.at(-1),
            endTime: currentTimeSlot.endTime,
            timePeriod: (new Date(prevList.at(-1).endTime) - new Date(prevList.at(-1).startTime)) / 1000
          };
          newList.pop();
          newList.push(newObject);
          return newList;
        }
        newList.push(currentTimeSlot);
        return newList;
      }, [])
    );
  }

  useInterval(() => {
    if (trackingSuspended || !lastTimeSlot) {
      document.title = t('app.title');
      setOverTime(false);
      return;
    }

    const timePeriod = (new Date() - new Date(lastTimeSlot.startTime)) / 1000;
    if (lastTimeSlot.detected && (timePeriod > alertStudySeconds)) {
      setOverTime(true);
      document.title = PomoConfigs.restNotificationText;
      const iconUrl = 'https://chenditc.github.io/face-recognition-pomodoro/images/relax.png';
      sendNotification(PomoConfigs.restNotificationText, iconUrl);
      return;
    }

    if (!lastTimeSlot.detected && (timePeriod > alertRestSeconds)) {
      setOverTime(true);
      document.title = PomoConfigs.focusNotificationText;
      const iconUrl = 'https://chenditc.github.io/face-recognition-pomodoro/images/focus.png';
      sendNotification(PomoConfigs.focusNotificationText, iconUrl);
      return;
    }

    document.title = formatSeconds(timePeriod, true, locale);
    setOverTime(false);
    if ((timePeriod > tempMissingSeconds) && (Object.keys(notificationHistory).length > 0)) {
      setNotificationHistory({});
    }

    if (PomoConfigs.postureReminder?.enabled && lastTimeSlot?.detected) {
      const secondsSincePostureSwitch = (new Date() - new Date(lastPostureSwitchTime)) / 1000;
      if (secondsSincePostureSwitch > PomoConfigs.postureReminder.intervalMinutes * 60 && !postureReminderSent) {
        const message = PomoConfigs.postureReminder.notificationText;
        playDingBellSfx();
        if (webNotificationSupported && Notification.permission === 'granted') {
          new Notification(message);
        }
        setSnackBarOpen(true);
        setSnackBarMessage(message);
        setPostureReminderSent(true);
      }
    }
  }, 500, true);

  return (
    <>
      {PomoConfigs.enablePlayer && authorizedFaceEnrolled && !modalOpen ?
        <Suspense fallback={<div>{t('common.loading')}</div>}>
          <PlayerWithStatus focus={displayFocus} overTime={overTime} startTime={displayClockStartTime} />
        </Suspense> : null}
      <div className={css`
        margin: 0 15px;
        max-width: 700px;
        min-width: 350px;
        @media (min-width: 730px) {
          margin: 0 auto;
        }
      `}>
        <Snackbar
          open={snackbarOpen}
          onClose={() => setSnackBarOpen(false)}
          message={snackbarMessage}
          dismissesOnAction
          action={
            <SnackbarAction
              label={t('common.dismiss')}
              onClick={() => console.log('Dismiss notification')}
            />
          }
        />
        <Grid>
          {(!authorizedFaceEnrolled || displayStatus === 'profile-incompatible') && !props.enrollmentDialogOpen && !enrollmentPromptDismissed ? (
            <GridCell span={12}>
              <EnrollmentPromptCard
                onStart={props.onOpenEnrollment}
                onDismiss={() => setEnrollmentPromptDismissed(true)}
              />
            </GridCell>
          ) : null}
          <GridCell span={12}>
            <PomoStatus focus={displayFocus} label={displayStatusLabel} className={statusClassName} />
          </GridCell>
          {displayStatus !== 'authorized' ? (
            <GridCell span={12}>
              <IdentityStatusBar status={displayStatus} similarity={faceAuthState?.similarity || 0} />
            </GridCell>
          ) : null}
          <GridCell span={12}>
            <ReactFlipClock startTime={displayClockStartTime} />
          </GridCell>
          {PomoConfigs.postureReminder?.enabled && !trackingSuspended && (() => {
            const elapsed = (new Date() - new Date(lastPostureSwitchTime)) / 1000;
            const total = PomoConfigs.postureReminder.intervalMinutes * 60;
            const progress = Math.min(elapsed / total, 1);
            const remaining = Math.max(total - elapsed, 0);
            const remainingMin = Math.ceil(remaining / 60);

            if (postureReminderSent) {
              return (
                <GridCell span={12}>
                  <div className={css`text-align: center;`}>
                    <Button
                      raised
                      theme={['secondaryBg', 'onSecondary']}
                      onClick={() => {
                        setLastPostureSwitchTime(new Date().toJSON());
                        setPostureReminderSent(false);
                      }}
                      label={t('posture.switched')}
                    />
                  </div>
                </GridCell>
              );
            }

            return (
              <GridCell span={12}>
                <div className={css`
                  max-width: 300px;
                  margin: 0 auto;
                  text-align: center;
                `}>
                  <LinearProgress progress={progress} />
                  <span className={css`
                    font-size: 12px;
                    color: #999;
                    margin-top: 4px;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                  `}>
                    {t('posture.reminderWithRemaining', { minutes: remainingMin })}
                    <button
                      type="button"
                      onClick={() => {
                        setLastPostureSwitchTime(new Date().toJSON());
                      }}
                      className={css`
                        border: 0;
                        background: transparent;
                        padding: 0;
                        color: #bbb;
                        cursor: pointer;
                        &:hover { color: #666; }
                      `}
                    >
                      {t('common.reset')}
                    </button>
                  </span>
                </div>
              </GridCell>
            );
          })()}
          <GridCell span={12}>
            <PeriodicFaceDetection
              authorizedFaceProfile={props.authorizedFaceProfile}
              onFaceDetectionResult={onFaceDetectionResult}
              suspendDetection={props.enrollmentDialogOpen}
            />
          </GridCell>
          {PomoConfigs.history.showPomodoroHistory ?
            <GridCell span={12}>
              <h3>{t('history.title')}</h3>
              <Suspense fallback={<div>{t('common.loading')}</div>}>
                <PomodoroHistoryTimeChart mergedTimeTable={mergedTimeTable} />
                <PomodoroList mergedTimeTable={mergedTimeTable} onDeleteRestSession={deleteRestSession} />
              </Suspense>
            </GridCell> : null}
        </Grid>
      </div>
    </>
  );
}

export default HealthMonitor;
