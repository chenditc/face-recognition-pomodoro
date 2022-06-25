import { Dialog, DialogTitle, DialogContent, DialogActions, DialogButton } from '@rmwc/dialog';
import '@rmwc/dialog/styles';
import { TextField } from '@rmwc/textfield';
import '@rmwc/textfield/styles';
import { Grid, GridRow, GridCell } from '@rmwc/grid'
import '@rmwc/grid/styles';
import { Switch } from '@rmwc/switch';
import '@rmwc/switch/styles';
import { Typography } from '@rmwc/typography';
import '@rmwc/typography/styles';
import { Tooltip } from '@rmwc/tooltip';
import '@rmwc/tooltip/styles';
import { ListDivider } from '@rmwc/list';
import '@rmwc/list/styles';

import './PomoConfigsDialog.css'
import { useImmer } from "use-immer";

function PomoConfigsDialog(props) {
  const [newPomoConfig, setNewPomoConfig] = useImmer(props.pomoConfigs);

  return (
    <>
      <Dialog
        style={{zIndex: 15}}
        open={props.open}
        onClose={(event) => {
          if (event.target.action === "confirm") {
            props.setPomoConfigs(newPomoConfig);
          }
          props.onClose()
        }}
        renderToPortal={true}
      >
        <DialogTitle>Configuration</DialogTitle>
        <DialogContent>
          <Grid>
            <GridCell span={12}>
              <GridRow>
                <GridCell span={12}>
                  <Typography use="subtitle2">Pomodoro Config</Typography>
                </GridCell>
                <GridCell span={4}>
                  <TextField required label="Focus Time" type="number"
                    suffix="minutes" pattern="[0-9]*"
                    defaultValue={props.pomoConfigs.alertStudySeconds / 60}
                    onChange={(event) => {
                      if (!event.target.validity.valid) return
                      setNewPomoConfig(
                        (oldConfig) => { oldConfig.alertStudySeconds = parseInt(event.target.value) * 60 }
                      )
                    }}
                  />
                </GridCell>
                <GridCell span={4}>
                  <TextField required label="Rest Time" type="number"
                    suffix="minutes" pattern="[0-9]*"
                    defaultValue={props.pomoConfigs.alertRestSeconds / 60}
                    onChange={(event) => {
                      if (!event.target.validity.valid) return
                      setNewPomoConfig(
                        (oldConfig) => { oldConfig.alertRestSeconds = parseInt(event.target.value) * 60 }
                      )
                    }}
                  />
                </GridCell>
                <GridCell span={4}>
                  <Tooltip content="If the rest time or focus time is less than this, it will not be counted as a separted time slot.">
                    <TextField required label="Max allowed missing time" type="number"
                      suffix="seconds" pattern="[0-9]*"
                      defaultValue={props.pomoConfigs.tempMissingSeconds}
                      onChange={(event) => {
                        if (!event.target.validity.valid) return
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
              <Typography use="subtitle2">Background Video Config</Typography>
            </GridCell>
            <GridCell span={12}>
                <Tooltip content="Enter a Youtube video url. Leave empty to not play anything.">
                  <TextField style={{width:"100%"}} required label="Youtube Url" type="text"
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
                  <Typography use="subtitle2">Face Recognition Config</Typography>
                </GridCell>
                <GridCell>
                  <Tooltip content="Every n seconds we detect user face, shorter interval might increase CPU usage, longer interval might make pomodoro less sensitive.">
                    <TextField required label="Face Detection Interval" type="number"
                      pattern="[0-9]*" suffix="seconds"
                      defaultValue={props.pomoConfigs.faceRecognition.detectionInterval}
                      onChange={(event) => {
                        if (!event.target.validity.valid) return
                        const newTime = parseInt(event.target.value)
                        if (newTime < 2) {
                          return
                        }
                        setNewPomoConfig(
                          (oldConfig) => { oldConfig.faceRecognition.detectionInterval = newTime }
                        )
                      }}
                    />
                  </Tooltip>
                </GridCell>
                <GridCell>
                  <Switch
                    defaultChecked={props.pomoConfigs.enableDetection}
                    onChange={(event) => {
                      setNewPomoConfig(
                        (oldConfig) => { oldConfig.enableDetection = event.target.checked }
                      )
                    }}
                    label="Enable Face Detection"
                  />
                </GridCell>
                <GridCell>
                  <Switch
                    defaultChecked={props.pomoConfigs.faceRecognition.showFaceRecognitionStatus}
                    onChange={(event) => {
                      setNewPomoConfig(
                        (oldConfig) => { oldConfig.faceRecognition.showFaceRecognitionStatus = event.target.checked }
                      )
                    }}
                    label="Show Face Recognition Status"
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
                    label="Show Live Camera Preview"
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
                    label="Show Face Detection Result"
                  />
                </GridCell>
              </GridRow>
            </GridCell>
            <GridCell span={12}><ListDivider /></GridCell>
            <GridCell span={12}>
              <GridRow>
                <GridCell span={12}>
                  <Typography use="subtitle2">Notification Config</Typography>
                </GridCell>
                <GridCell>
                  <TextField required label="Notification Interval Time" type="number"
                    suffix="seconds" pattern="[0-9]*"
                    defaultValue={props.pomoConfigs.notificationIntervalSeconds}
                    onChange={(event) => {
                      if (!event.target.validity.valid) return
                      setNewPomoConfig(
                        (oldConfig) => { oldConfig.notificationIntervalSeconds = parseInt(event.target.value) }
                      )
                    }}
                  />
                </GridCell>
                <GridCell>
                  <Tooltip content="Everytime a notification is send, its wait time will multiply previous interval, so that the sending interval is longer and longer. If you don't want this behavior, change it to 1.">
                    <TextField required label="Notification Interval Multiplier"
                      suffix="times" pattern="[0-9\.]*"
                      defaultValue={props.pomoConfigs.notificationIntervalMultiplier}
                      onChange={(event) => {
                        console.log(event)
                        if (!event.target.validity.valid) return
                        const newValue = parseFloat(event.target.value)
                        if (newValue < 1) {
                          event.target.setCustomValidity("Multiplier cannot be less than 1")
                          return;
                        }
                        setNewPomoConfig(
                          (oldConfig) => { oldConfig.notificationIntervalMultiplier = newValue }
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
                  <Typography use="subtitle2">Pomodoro History Config</Typography>
                </GridCell>
                <GridCell>
                  <Tooltip content="Increasing this might degrade performance.">
                    <TextField required label="Max pomodoro history entries kepted" type="number"
                      resizeable={true}
                      pattern="[0-9]*" suffix="entries"
                      defaultValue={props.pomoConfigs.history.maxLocalStorageTimeSlot}
                      onChange={(event) => {
                        if (!event.target.validity.valid) return
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
                    label="Show Pomodoro History"
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
                    label="Only Show Today's History"
                  />
                </GridCell>
              </GridRow>
            </GridCell>
          </Grid>
        </DialogContent>
        <DialogActions>
          <DialogButton action="close">Cancel</DialogButton>
          <DialogButton action="confirm" isDefaultAction>
            Confirm
          </DialogButton>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default PomoConfigsDialog;