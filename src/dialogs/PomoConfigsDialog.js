import { Modal } from 'antd';
import { TextField } from '@rmwc/textfield';
import '@rmwc/textfield/styles';
import { Grid, GridRow, GridCell } from '@rmwc/grid'
import '@rmwc/grid/styles';
import { Switch } from '@rmwc/switch';
import '@rmwc/switch/styles';
import { Typography } from '@rmwc/typography';
import '@rmwc/typography/styles';
import { Button } from '@rmwc/button';
import '@rmwc/button/styles';
import { Tooltip } from '@rmwc/tooltip';
import '@rmwc/tooltip/styles';
import { ListDivider } from '@rmwc/list';
import '@rmwc/list/styles';

import { useImmer } from "use-immer";
import { useEffect, useRef, useState } from 'react';
import { supportedLocales, syncLocaleDefaults, useI18n } from '../i18n';

function PomoConfigsDialog(props) {
  const formRef = useRef(null);
  const [newPomoConfig, setNewPomoConfig] = useImmer(props.pomoConfigs);
  const { t } = useI18n();

  const [formValid, setFormValid] = useState(true);
  const authorizedFaceEnrolled = Array.isArray(props.authorizedFaceProfile?.descriptors) && props.authorizedFaceProfile.descriptors.length > 0;
  const selectInputStyle = {
    height: "40px",
    borderRadius: "4px",
    border: "1px solid rgba(0, 0, 0, 0.38)",
    padding: "0 12px",
    background: "white",
  };

  useEffect(() => {
    if (!props.open) return;
    setNewPomoConfig(props.pomoConfigs);
  }, [props.open, props.pomoConfigs, setNewPomoConfig]);

  return (
    <Modal
      zIndex={1010}
      visible={props.open}
      title={t('config.title')}
      onCancel={props.onClose}
      onOk={() => {
        props.setPomoConfigs(syncLocaleDefaults(props.pomoConfigs, newPomoConfig));
        props.onClose();
      }}
      okText={t('common.confirm')}
      cancelText={t('common.cancel')}
      okButtonProps={{ disabled: !formValid }}
      maskClosable={false}
      destroyOnClose
      width="80vw"
      style={{ top: 24 }}
      bodyStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
    >
          <form ref={formRef} onChange={() => {
            const newValid = formRef.current && formRef.current.reportValidity();
            console.log(newValid);
            if (newValid !== formValid) setFormValid(newValid);
          }}>
          <Grid>
            <GridCell span={12}>
              <GridRow>
                <GridCell span={12}>
                  <Typography use="subtitle2">{t('config.sections.general')}</Typography>
                </GridCell>
                <GridCell span={4}>
                  <Tooltip content={t('config.tooltips.language')}>
                    <label style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <Typography use="body2">{t('config.labels.appLanguage')}</Typography>
                      <select
                        value={newPomoConfig.locale}
                        onChange={(event) => {
                          setNewPomoConfig((oldConfig) => { oldConfig.locale = event.target.value })
                        }}
                        style={selectInputStyle}
                      >
                        {supportedLocales.map((localeOption) => (
                          <option key={localeOption.value} value={localeOption.value}>
                            {localeOption.value === 'en' ? t('common.english') : t('common.chinese')}
                          </option>
                        ))}
                      </select>
                    </label>
                  </Tooltip>
                </GridCell>
              </GridRow>
            </GridCell>
            <GridCell span={12}><ListDivider /></GridCell>
            <GridCell span={12}>
              <GridRow>
                <GridCell span={12}>
                  <Typography use="subtitle2">{t('config.sections.authorizedFace')}</Typography>
                </GridCell>
                <GridCell span={8}>
                  <div style={{
                    display: 'flex',
                    gap: '16px',
                    alignItems: 'center',
                    padding: '16px',
                    borderRadius: '16px',
                    background: authorizedFaceEnrolled ? 'rgba(191, 54, 12, 0.06)' : 'rgba(33, 150, 243, 0.08)',
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                  }}>
                    {props.authorizedFaceProfile?.thumbnail ? (
                      <img
                        src={props.authorizedFaceProfile.thumbnail}
                        alt={t('config.authorizedFace.previewAlt')}
                        style={{
                          width: '72px',
                          height: '72px',
                          borderRadius: '999px',
                          objectFit: 'cover',
                          border: '2px solid rgba(191, 54, 12, 0.16)',
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '72px',
                        height: '72px',
                        borderRadius: '999px',
                        border: '1px dashed rgba(0, 0, 0, 0.22)',
                        display: 'grid',
                        placeItems: 'center',
                        color: '#757575',
                        background: 'rgba(255, 255, 255, 0.8)',
                      }}>
                        {t('config.authorizedFace.emptyPreview')}
                      </div>
                    )}
                    <div style={{ display: 'grid', gap: '4px' }}>
                      <Typography use="body2">{t('config.labels.authorizedFaceStatus')}</Typography>
                      <Typography use="headline6">
                        {authorizedFaceEnrolled ? t('config.authorizedFace.enrolled') : t('config.authorizedFace.notEnrolled')}
                      </Typography>
                      <Typography use="body2" tag="p">
                        {authorizedFaceEnrolled
                          ? t('config.authorizedFace.enrolledBody', {
                            count: props.authorizedFaceProfile?.descriptors?.length || 0,
                          })
                          : t('config.authorizedFace.notEnrolledBody')}
                      </Typography>
                    </div>
                  </div>
                </GridCell>
                <GridCell span={4}>
                  <label style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <Typography use="body2">{t('config.labels.matchStrictness')}</Typography>
                    <select
                      value={newPomoConfig.faceRecognition.matchStrictness}
                      onChange={(event) => {
                        setNewPomoConfig((oldConfig) => { oldConfig.faceRecognition.matchStrictness = event.target.value })
                      }}
                      style={selectInputStyle}
                    >
                      <option value="lenient">{t('config.authorizedFace.lenient')}</option>
                      <option value="balanced">{t('config.authorizedFace.balanced')}</option>
                      <option value="strict">{t('config.authorizedFace.strict')}</option>
                    </select>
                  </label>
                </GridCell>
                <GridCell span={12}>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <Button
                      raised
                      label={authorizedFaceEnrolled ? t('config.authorizedFace.reEnroll') : t('config.authorizedFace.enroll')}
                      onClick={() => {
                        props.onClose();
                        props.onOpenEnrollment();
                      }}
                    />
                    <Button
                      outlined
                      disabled={!authorizedFaceEnrolled}
                      label={t('config.authorizedFace.delete')}
                      onClick={() => {
                        if (!authorizedFaceEnrolled) return;
                        if (!window.confirm(t('config.authorizedFace.deleteConfirm'))) return;
                        props.onDeleteAuthorizedFace();
                      }}
                    />
                  </div>
                </GridCell>
              </GridRow>
            </GridCell>
            <GridCell span={12}><ListDivider /></GridCell>
            <GridCell span={12}>
              <GridRow>
                <GridCell span={12}>
                  <Typography use="subtitle2">{t('config.sections.pomodoro')}</Typography>
                </GridCell>
                <GridCell span={4}>
                  <TextField required label={t('config.labels.focusTime')} type="number"
                    suffix={t('common.minutes')} pattern="[0-9]*" min={1}
                    defaultValue={props.pomoConfigs.alertStudySeconds / 60}
                    onChange={(event) => {
                      if (!event.target.validity.valid) {
                        event.target.reportValidity();
                        return;
                      }
                      setNewPomoConfig(
                        (oldConfig) => { oldConfig.alertStudySeconds = parseInt(event.target.value) * 60 }
                      )
                    }}
                  />
                </GridCell>
                <GridCell span={4}>
                  <TextField required label={t('config.labels.restTime')} type="number"
                    suffix={t('common.minutes')} pattern="[0-9]*" min={1}
                    defaultValue={props.pomoConfigs.alertRestSeconds / 60}
                    onChange={(event) => {
                      if (!event.target.reportValidity()) return;
                      setNewPomoConfig(
                        (oldConfig) => { oldConfig.alertRestSeconds = parseInt(event.target.value) * 60 }
                      )
                    }}
                  />
                </GridCell>
                <GridCell span={4}>
                  <Tooltip content={t('config.tooltips.maxAllowedMissingTime')}>
                    <TextField required label={t('config.labels.maxAllowedMissingTime')} type="number"
                      suffix={t('common.seconds')} pattern="[0-9]*" min={0}
                      defaultValue={props.pomoConfigs.tempMissingSeconds}
                      onChange={(event) => {
                        if (!event.target.reportValidity()) return;
                        setNewPomoConfig(
                          (oldConfig) => { oldConfig.tempMissingSeconds = parseInt(event.target.value) }
                        )
                      }}
                    />
                  </Tooltip>
                </GridCell>
              </GridRow>
            </GridCell>
            <GridCell span={12}><ListDivider /></GridCell>
            <GridCell span={12}>
              <GridRow>
                <GridCell span={12}>
                  <Typography use="subtitle2">{t('config.sections.posture')}</Typography>
                </GridCell>
                <GridCell>
                  <Switch
                    defaultChecked={props.pomoConfigs.postureReminder?.enabled}
                    onChange={(event) => {
                      setNewPomoConfig(
                        (oldConfig) => { oldConfig.postureReminder.enabled = event.target.checked }
                      )
                    }}
                    label={t('config.switches.enablePostureReminder')}
                  />
                </GridCell>
                <GridCell>
                  <Tooltip content={t('config.tooltips.postureSwitchInterval')}>
                    <TextField required label={t('config.labels.postureSwitchInterval')} type="number"
                      suffix={t('common.minutes')} pattern="[0-9]*" min={1}
                      defaultValue={props.pomoConfigs.postureReminder?.intervalMinutes}
                      onChange={(event) => {
                        if (!event.target.reportValidity()) return;
                        setNewPomoConfig(
                          (oldConfig) => { oldConfig.postureReminder.intervalMinutes = parseInt(event.target.value) }
                        )
                      }}
                    />
                  </Tooltip>
                </GridCell>
                <GridCell span={12}>
                  <Tooltip content={t('config.tooltips.postureReminderMessage')}>
                    <TextField style={{width: "100%"}} required label={t('config.labels.postureReminderMessage')}
                      minLength={1}
                      defaultValue={props.pomoConfigs.postureReminder?.notificationText}
                      onChange={(event) => {
                        if (!event.target.reportValidity()) return;
                        setNewPomoConfig(
                          (oldConfig) => { oldConfig.postureReminder.notificationText = event.target.value }
                        )
                      }}
                    />
                  </Tooltip>
                </GridCell>
              </GridRow>
            </GridCell>
            <GridCell span={12}><ListDivider /></GridCell>
            <GridCell span={12}>
              <Typography use="subtitle2">{t('config.sections.backgroundVideo')}</Typography>
            </GridCell>
            <GridCell span={12}>
                <Tooltip content={t('config.tooltips.youtubeUrl')}>
                  <TextField style={{width:"100%"}} label={t('config.labels.youtubeUrl')} type="text"
                    defaultValue={props.pomoConfigs.playerUrl}
                    onChange={(event) => {
                      setNewPomoConfig(
                        (oldConfig) => { oldConfig.playerUrl = event.target.value }
                      )
                    }}
                  />
                </Tooltip>
            </GridCell>
            <GridCell span={12}><ListDivider /></GridCell>
            <GridCell span={12}>
              <GridRow>
                <GridCell span={12}>
                  <Typography use="subtitle2">{t('config.sections.faceRecognition')}</Typography>
                </GridCell>
                <GridCell>
                  <Tooltip content={t('config.tooltips.detectionInterval')}>
                    <TextField required label={t('config.labels.minFaceDetectionInterval')} type="number"
                      pattern="[0-9]*" suffix={t('common.seconds')} min={2}
                      defaultValue={props.pomoConfigs.faceRecognition.minDetectionInterval}
                      onChange={(event) => {
                        if (!event.target.reportValidity()) return;
                        const newTime = parseInt(event.target.value)
                        setNewPomoConfig(
                          (oldConfig) => { oldConfig.faceRecognition.minDetectionInterval = newTime }
                        )
                      }}
                    />
                  </Tooltip>
                </GridCell>
                <GridCell>
                  <Tooltip content={t('config.tooltips.missingFaceRetryInterval')}>
                    <TextField required label={t('config.labels.missingFaceRetryInterval')}
                      pattern="[0-9]*" suffix={t('common.seconds')} min={1} type="number"
                      defaultValue={props.pomoConfigs.faceRecognition.missingFaceRetryIntervalSeconds}
                      onChange={(event) => {
                        if (!event.target.reportValidity()) return;
                        const newTime = parseInt(event.target.value)
                        setNewPomoConfig(
                          (oldConfig) => { oldConfig.faceRecognition.missingFaceRetryIntervalSeconds = newTime }
                        )
                      }}
                    />
                  </Tooltip>
                </GridCell>
                <GridCell>
                  <Tooltip content={t('config.tooltips.detectionInterval')}>
                    <TextField required label={t('config.labels.maxFaceDetectionInterval')} type="number"
                      pattern="[0-9]*" suffix={t('common.seconds')} min={2}
                      defaultValue={props.pomoConfigs.faceRecognition.maxDetectionInterval}
                      onChange={(event) => {
                        if (!event.target.reportValidity()) return;
                        const newTime = parseInt(event.target.value)
                        setNewPomoConfig(
                          (oldConfig) => { oldConfig.faceRecognition.maxDetectionInterval = newTime }
                        )
                      }}
                    />
                  </Tooltip>
                </GridCell>
                <GridCell>
                  <Switch
                    defaultChecked={props.pomoConfigs.faceRecognition.showFaceRecognitionStatus}
                    onChange={(event) => {
                      setNewPomoConfig(
                        (oldConfig) => { oldConfig.faceRecognition.showFaceRecognitionStatus = event.target.checked }
                      )
                    }}
                    label={t('config.switches.showFaceRecognitionStatus')}
                  />
                </GridCell>
                <GridCell>
                  <Switch
                    defaultChecked={props.pomoConfigs.faceRecognition.showCameraPreview}
                    onChange={(event) => {
                      setNewPomoConfig(
                        (oldConfig) => { oldConfig.faceRecognition.showCameraPreview = event.target.checked }
                      )
                    }}
                    label={t('config.switches.showLiveCameraPreview')}
                  />
                </GridCell>
                <GridCell>
                  <Switch
                    defaultChecked={props.pomoConfigs.faceRecognition.showFaceRecognitionCanvas}
                    onChange={(event) => {
                      setNewPomoConfig(
                        (oldConfig) => { oldConfig.faceRecognition.showFaceRecognitionCanvas = event.target.checked }
                      )
                    }}
                    label={t('config.switches.showFaceDetectionResult')}
                  />
                </GridCell>
              </GridRow>
            </GridCell>
            <GridCell span={12}><ListDivider /></GridCell>
            <GridCell span={12}>
              <GridRow>
                <GridCell span={12}>
                  <Typography use="subtitle2">{t('config.sections.notification')}</Typography>
                </GridCell>
                <GridCell span={4}>
                  <TextField required label={t('config.labels.notificationIntervalTime')} type="number"
                    suffix={t('common.seconds')} pattern="[0-9]*"
                    defaultValue={props.pomoConfigs.notificationIntervalSeconds}
                    onChange={(event) => {
                      if (!event.target.reportValidity()) return;
                      setNewPomoConfig(
                        (oldConfig) => { oldConfig.notificationIntervalSeconds = parseInt(event.target.value) }
                      )
                    }}
                  />
                </GridCell>
                <GridCell span={4}>
                  <Tooltip content={t('config.tooltips.notificationIntervalMultiplier')}>
                    <TextField required label={t('config.labels.notificationIntervalMultiplier')}
                      suffix={t('common.times')} pattern="[0-9\.]*" min={1} type="number" step="0.1"
                      defaultValue={props.pomoConfigs.notificationIntervalMultiplier}
                      onChange={(event) => {
                        if (!event.target.reportValidity()) return;
                        const newValue = parseFloat(event.target.value)
                        setNewPomoConfig(
                          (oldConfig) => { oldConfig.notificationIntervalMultiplier = newValue }
                        )
                      }}
                    />
                  </Tooltip>
                </GridCell>
                <GridCell span={12}>
                  <Tooltip content={t('config.tooltips.focusNotificationMessage')}>
                    <TextField style={{width: "100%"}} required label={t('config.labels.focusNotificationMessage')}
                      minLength={1}
                      defaultValue={props.pomoConfigs.focusNotificationText}
                      onChange={(event) => {
                        if (!event.target.reportValidity()) return;
                        setNewPomoConfig(
                          (oldConfig) => { oldConfig.focusNotificationText = event.target.value }
                        )
                      }}
                    />
                  </Tooltip>
                </GridCell>
                <GridCell span={12}>
                  <Tooltip content={t('config.tooltips.restNotificationMessage')}>
                    <TextField style={{width: "100%"}} required label={t('config.labels.restNotificationMessage')}
                      minLength={1}
                      defaultValue={props.pomoConfigs.restNotificationText}
                      onChange={(event) => {
                        if (!event.target.reportValidity()) return;
                        setNewPomoConfig(
                          (oldConfig) => { oldConfig.restNotificationText = event.target.value }
                        )
                      }}
                    />
                  </Tooltip>
                </GridCell>
              </GridRow>
            </GridCell>
            <GridCell span={12}><ListDivider /></GridCell>
            <GridCell span={12}>
              <GridRow>
                <GridCell span={12}>
                  <Typography use="subtitle2">{t('config.sections.history')}</Typography>
                </GridCell>
                <GridCell>
                  <Tooltip content={t('config.tooltips.maxHistoryEntries')}>
                    <TextField required label={t('config.labels.maxPomodoroHistoryEntries')} type="number"
                      resizeable={true}
                      pattern="[0-9]*" suffix={t('common.entries')} min={1}
                      defaultValue={props.pomoConfigs.history.maxLocalStorageTimeSlot}
                      onChange={(event) => {
                        if (!event.target.reportValidity()) return;
                        setNewPomoConfig(
                          (oldConfig) => { oldConfig.history.maxLocalStorageTimeSlot = parseInt(event.target.value) }
                        )
                      }}
                    />
                  </Tooltip>
                </GridCell>
                <GridCell>
                  <Switch
                    defaultChecked={props.pomoConfigs.history.showPomodoroHistory}
                    onChange={(event) => {
                      setNewPomoConfig(
                        (oldConfig) => { oldConfig.history.showPomodoroHistory = event.target.checked }
                      )
                    }}
                    label={t('config.switches.showPomodoroHistory')}
                  />
                </GridCell>
                <GridCell>
                  <Switch
                    defaultChecked={props.pomoConfigs.history.onlyShowToday}
                    onChange={(event) => {
                      setNewPomoConfig(
                        (oldConfig) => { oldConfig.history.onlyShowToday = event.target.checked }
                      )
                    }}
                    label={t('config.switches.onlyShowTodayHistory')}
                  />
                </GridCell>
              </GridRow>
            </GridCell>
          </Grid>
          </form>
    </Modal>
  )
}

export default PomoConfigsDialog;
