import HealthMonitor from "./PeriodicChecks/HealthMonitor";
import 'antd/dist/antd.css';
import { useState } from "react";
import { useLocalStorageState } from 'ahooks';
import { defaultPomoConfigs, PomoConfigsContext } from './UserConfigs/PomoConfigsContext'
import { TopAppBar, TopAppBarRow, TopAppBarSection, TopAppBarActionItem, TopAppBarTitle, TopAppBarFixedAdjust } from '@rmwc/top-app-bar';
import { ThemeProvider } from '@rmwc/theme'
import { css } from "@emotion/css";
import { produce } from 'immer';
import { I18nProvider, useI18n } from './i18n';

import '@rmwc/theme/styles';
import '@rmwc/top-app-bar/styles';
import '@rmwc/icon/styles';

import PomoConfigsDialog from "./dialogs/PomoConfigsDialog";
import IntroDialog from "./dialogs/IntroDialog";

function FaceRecognitionPomoApp(props) {
  const { t } = useI18n();
  const [openConfigDialog, setOpenConfigDialog] = useState(false);
  const [openIntroDialog, setOpenIntroDialog] = useState(true);

  function onIntroDialogClose() {
    setOpenIntroDialog(false)
    props.setPomoConfigs(produce(
      (oldConfig) => {
        oldConfig.enableDetection = true;
        oldConfig.enableNotification = true;
      }
    ))
  }

  function toggleMusic() {
    props.setPomoConfigs(produce((oldConfig) => {
      oldConfig.enablePlayer = !oldConfig.enablePlayer
    }))
  }

  const music_icon = props.pomoConfigs.enablePlayer ? "volume_off" : "music_video"

  return (
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
            <TopAppBarTitle>
              {t('app.title')}
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
        pomoConfigs={props.pomoConfigs}
        setPomoConfigs={props.setPomoConfigs}
      />
      <PomoConfigsContext.Provider value={props.pomoConfigs}>
        <HealthMonitor />
      </PomoConfigsContext.Provider>
    </ThemeProvider>
  );
}

function FaceRecognitionPomo() {
  const [pomoConfigs, setPomoConfigs] = useLocalStorageState("pomoConfig", {
    defaultValue: defaultPomoConfigs,
    deserializer: (v) => {
      const stored = JSON.parse(v);
      // Deep merge with defaults so new config fields are picked up
      return {
        ...defaultPomoConfigs,
        ...stored,
        history: { ...defaultPomoConfigs.history, ...stored.history },
        faceRecognition: { ...defaultPomoConfigs.faceRecognition, ...stored.faceRecognition },
        postureReminder: { ...defaultPomoConfigs.postureReminder, ...stored.postureReminder },
      };
    }
  })

  return (
    <I18nProvider locale={pomoConfigs.locale}>
      <FaceRecognitionPomoApp
        pomoConfigs={pomoConfigs}
        setPomoConfigs={setPomoConfigs}
      />
    </I18nProvider>
  );
}

export default FaceRecognitionPomo;
