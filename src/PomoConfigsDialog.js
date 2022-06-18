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

import './PomoConfigsDialog.css'
import { useImmer } from "use-immer";

function PomoConfigsDialog(props) {
  const [newPomoConfig, setNewPomoConfig] = useImmer(props.pomoConfigs);

  console.log(newPomoConfig);
  return (
    <>
      <Dialog
        open={props.open}
        onClose={() => {
          props.setPomoConfigs(newPomoConfig);
          props.onClose()
        }}
        renderToPortal={true}
      >
        <DialogTitle>Configuration</DialogTitle>
        <DialogContent>
          <Grid>
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
            </GridRow>
            <GridRow>
              <GridCell span={12}>
                <Typography use="subtitle2">Pomodoro History Config</Typography>
              </GridCell>
              <GridCell>
                <Tooltip content="Increasing this might degrade performance.">
                  <TextField required label="Max pomodoro history entries kepted" type="number"
                    resizeable={true}
                    pattern="[0-9]*" suffix="entries"
                    defaultValue={props.pomoConfigs.maxLocalStorageTimeSlot}
                    onChange={(event) => {
                      if (!event.target.validity.valid) return
                      setNewPomoConfig(
                        (oldConfig) => { oldConfig.maxLocalStorageTimeSlot = parseInt(event.target.value) }
                      )
                    }}
                  />
                </Tooltip>
              </GridCell>
            </GridRow>
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
                  defaultChecked={props.pomoConfigs.cameraHidden}
                  onChange={(event) => {
                    setNewPomoConfig(
                      (oldConfig) => { oldConfig.cameraHidden = event.target.checked }
                    )
                  }}
                  label="Hide Live Camera Preview"
                />
              </GridCell>
            </GridRow>
          </Grid>
        </DialogContent>
        <DialogActions>
          <DialogButton action="accept" isDefaultAction>
            Finish
          </DialogButton>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default PomoConfigsDialog;