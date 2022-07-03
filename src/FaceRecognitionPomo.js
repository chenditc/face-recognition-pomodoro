import HealthMonitor from "./PeriodicChecks/HealthMonitor";
import 'antd/dist/antd.css';
import { useState } from "react";
import { useLocalStorageState } from 'ahooks';
import { defaultPomoConfigs, PomoConfigsContext } from './UserConfigs/PomoConfigsContext'
import { TopAppBar, TopAppBarRow, TopAppBarSection, TopAppBarActionItem, TopAppBarTitle, TopAppBarFixedAdjust } from '@rmwc/top-app-bar';
import { ThemeProvider } from '@rmwc/theme'
import { css } from "@emotion/css";
import { produce } from 'immer';

import '@rmwc/theme/styles';
import '@rmwc/top-app-bar/styles';
import '@rmwc/icon/styles';

import PomoConfigsDialog from "./dialogs/PomoConfigsDialog";
import IntroDialog from "./dialogs/IntroDialog";

function FaceRecognitionPomo() {
  const [pomoConfigs, setPomoConfigs] = useLocalStorageState("pomoConfig", {
    defaultValue: defaultPomoConfigs
  })

  const [openConfigDialog, setOpenConfigDialog] = useState(false);
  const [openIntroDialog, setOpenIntroDialog] = useState(true);

  function onIntroDialogClose() {
    setOpenIntroDialog(false)
    setPomoConfigs(produce(
      (oldConfig) => {
        oldConfig.enableDetection = true;
        oldConfig.enableNotification = true;
      }
    ))
  }

  function toggleMusic() {
    setPomoConfigs(produce((oldConfig) => {
      oldConfig.enablePlayer = !oldConfig.enablePlayer
    }))
  }

  const music_icon = pomoConfigs.enablePlayer ? "volume_off" : "music_video"

  return (
    <>
      <ThemeProvider
        options={{
          primary: '#bf360c',
          secondary: '#616161'
        }}
      >

        <TopAppBar style={{ zIndex: 15 }}>
          <TopAppBarRow>
            <TopAppBarSection alignStart>
              <TopAppBarActionItem icon="help" onClick={() => setOpenIntroDialog(true)} />
            </TopAppBarSection>
            <TopAppBarSection className={css`justify-content: center`}>
              <TopAppBarTitle >
                Face Recognition Pomodoro
              </TopAppBarTitle>
            </TopAppBarSection>
            <TopAppBarSection alignEnd>
              <TopAppBarActionItem icon={music_icon} onClick={() => toggleMusic()} />
              <TopAppBarActionItem icon="settings" onClick={() => setOpenConfigDialog(true)} />
            </TopAppBarSection>
          </TopAppBarRow>
        </TopAppBar>
        <TopAppBarFixedAdjust />

          <IntroDialog
            open={openIntroDialog}
            onClose={onIntroDialogClose}
          />
          <PomoConfigsDialog
            open={openConfigDialog}
            onClose={() => setOpenConfigDialog(false)}
            pomoConfigs={pomoConfigs}
            setPomoConfigs={setPomoConfigs}
          />
        <PomoConfigsContext.Provider value={pomoConfigs}>
          <HealthMonitor />
        </PomoConfigsContext.Provider>

      </ThemeProvider>
    </>
  );
}

export default FaceRecognitionPomo;