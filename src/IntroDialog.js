import { Dialog, DialogTitle, DialogContent, DialogActions, DialogButton } from '@rmwc/dialog';
import '@rmwc/dialog/styles';

import { Typography } from '@rmwc/typography';
import '@rmwc/typography/styles';

import { Card, CardPrimaryAction} from '@rmwc/card';
import '@rmwc/card/styles';
import { css } from '@emotion/css'

function IntroDialog(props) {
  const hightlightClassName=css`font-weight: bold;`
  return (
    <>
      <Dialog
        open={props.open}
        onClose={(event) => {
          props.onClose()
        }}
        renderToPortal={true}
      >
        <DialogTitle>Intro to Face Recognition Pomodoro</DialogTitle>
        <DialogContent>
          <div style={{padding: "10px"}} />
          <Card>
            <CardPrimaryAction>
              <div style={{ padding: '0 1rem 1rem 1rem' }}>
                <Typography use="headline6" tag="h2">
                What is this?
                </Typography>
                <Typography
                  use="body1"
                  tag="div"
                  theme="textSecondaryOnBackground"
                >
                  This is a <span className={hightlightClassName}>Pomodoro clock</span>.

                  Unlike other Pomodoro Clock, it can automatically help you start
                  <span className={hightlightClassName}> a focus session </span>when the camera detected your face. When the camera 
                  no longer detect your face, it starts <span className={hightlightClassName}> a rest session </span>.
                </Typography>
              </div>
            </CardPrimaryAction>
          </Card>
          <div style={{padding: "10px"}} />
          <Card>
            <CardPrimaryAction>
              <div style={{ padding: '0 1rem 1rem 1rem' }}>
                <Typography use="headline6" tag="h2">
                What if I left my camera but don't want to stop the Pomodoro session?
                </Typography>
                <Typography
                  use="body1"
                  tag="div"
                  theme="textSecondaryOnBackground"
                >
                  If the time of stepping away is less than <span className={hightlightClassName}> Max Allowed Missing Time </span>
                  in the settings, the Pomodoro session will continue the session when you are back.
                </Typography>
              </div>
            </CardPrimaryAction>
          </Card>
          <div style={{padding: "10px"}} />
          <Card>
            <CardPrimaryAction>
              <div style={{ padding: '0 1rem 1rem 1rem' }}>
                <Typography use="headline6" tag="h2">
                Why this intro always popup on start?
                </Typography>
                <Typography
                  use="body1"
                  tag="div"
                  theme="textSecondaryOnBackground"
                >
                  There must be at least one user interaction to make notification works, so I take this opportunity to intro the tool.
                </Typography>
              </div>
            </CardPrimaryAction>
          </Card>
          <div style={{padding: "10px"}} />
          <Card>
            <CardPrimaryAction>
              <div style={{ padding: '0 1rem 1rem 1rem' }}>
                <Typography use="headline6" tag="h2">
                Will this slow down my computer or phone?
                </Typography>
                <Typography
                  use="body1"
                  tag="div"
                  theme="textSecondaryOnBackground"
                >
                  Usually not, it leverage GPU to detect your face and just takes a few milliseconds.
                </Typography>
              </div>
            </CardPrimaryAction>
          </Card>
        </DialogContent>
        <DialogActions>
          <DialogButton action="confirm" isDefaultAction>
            Ok, let's continue.
          </DialogButton>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default IntroDialog;