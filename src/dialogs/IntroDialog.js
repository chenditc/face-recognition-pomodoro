import { Dialog, DialogTitle, DialogContent, DialogActions, DialogButton } from '@rmwc/dialog';
import '@rmwc/dialog/styles';

import { Typography } from '@rmwc/typography';
import '@rmwc/typography/styles';

import { Card, CardPrimaryAction} from '@rmwc/card';
import '@rmwc/card/styles';

import ReactMarkdown from 'react-markdown'

function IntroDialog(props) {
  const introMarkdown = `
This is a **Pomodoro Clock**. It's special because:

- It can automatically help you start **a focus session** when the camera detected your face.
- It can automatically start **a rest session** When the camera no longer detect your face 

We will need two permission from you:
- Permission to **send notification**, so that you will get reminded when session timed out.
- Permission to **access your camera**.

Please click allow button around the browser's url.
`

  return (
    <>
      <Dialog
        style={{zIndex: 15}}
        open={props.open}
        onClose={(event) => {
          props.onClose()
        }}
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
                <ReactMarkdown children={introMarkdown} />
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
                <ReactMarkdown>
                  If the time of stepping away is less than **Max Allowed Missing Time** 
                  in the settings, the Pomodoro session will continue the session when you are back.
                </ReactMarkdown>
                  
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