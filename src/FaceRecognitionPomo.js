import HealthMonitor from "./PeriodicChecks/HealthMonitor";
import 'antd/dist/antd.css';
import { useEffect, useState } from "react";
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
import AuthorizedFaceEnrollmentDialog from "./FaceAuthorization/AuthorizedFaceEnrollmentDialog";

function FaceRecognitionPomoApp(props) {
  const { t } = useI18n();
  const [openConfigDialog, setOpenConfigDialog] = useState(false);
  const [openIntroDialog, setOpenIntroDialog] = useState(true);
  const [openEnrollmentDialog, setOpenEnrollmentDialog] = useState(false);
  const authorizedFaceEnrolled = Array.isArray(props.authorizedFaceProfile?.descriptors) && props.authorizedFaceProfile.descriptors.length > 0;
  const enablePlayer = props.pomoConfigs.enablePlayer;
  const setPomoConfigs = props.setPomoConfigs;

  useEffect(() => {
    if (authorizedFaceEnrolled || !enablePlayer) return;
    setPomoConfigs(produce((oldConfig) => {
      oldConfig.enablePlayer = false;
    }));
  }, [authorizedFaceEnrolled, enablePlayer, setPomoConfigs]);

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
    if (!authorizedFaceEnrolled) return;
    setPomoConfigs(produce((oldConfig) => {
      oldConfig.enablePlayer = !oldConfig.enablePlayer
    }))
  }

  const music_icon = enablePlayer && authorizedFaceEnrolled ? "volume_off" : "music_video"

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

      {openIntroDialog ? (
        <IntroDialog
          open={openIntroDialog}
          onClose={onIntroDialogClose}
        />
      ) : null}
      {openConfigDialog ? (
        <PomoConfigsDialog
          open={openConfigDialog}
          onClose={() => setOpenConfigDialog(false)}
          pomoConfigs={props.pomoConfigs}
          setPomoConfigs={props.setPomoConfigs}
          authorizedFaceProfile={props.authorizedFaceProfile}
          onOpenEnrollment={() => {
            setOpenConfigDialog(false);
            setOpenEnrollmentDialog(true);
          }}
          onDeleteAuthorizedFace={() => props.setAuthorizedFaceProfile(null)}
        />
      ) : null}
      {openEnrollmentDialog ? (
        <AuthorizedFaceEnrollmentDialog
          open={openEnrollmentDialog}
          onClose={() => setOpenEnrollmentDialog(false)}
          onComplete={(nextProfile) => {
            props.setAuthorizedFaceProfile(nextProfile);
            setOpenEnrollmentDialog(false);
          }}
          scoreThreshold={props.pomoConfigs.faceRecognition.scoreThreshold}
        />
      ) : null}
      <PomoConfigsContext.Provider value={props.pomoConfigs}>
        <HealthMonitor
          authorizedFaceProfile={props.authorizedFaceProfile}
          configDialogOpen={openConfigDialog}
          introDialogOpen={openIntroDialog}
          enrollmentDialogOpen={openEnrollmentDialog}
          onOpenEnrollment={() => setOpenEnrollmentDialog(true)}
        />
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
  const [authorizedFaceProfile, setAuthorizedFaceProfile] = useLocalStorageState('authorizedFaceProfile', {
    defaultValue: null,
    serializer: (value) => JSON.stringify(value),
    deserializer: (value) => JSON.parse(value),
  })

  useEffect(() => {
    const currentScoreThreshold = pomoConfigs?.faceRecognition?.scoreThreshold;
    if (currentScoreThreshold !== 0.65 && currentScoreThreshold <= 0.8) return;
    setPomoConfigs(produce((oldConfig) => {
      oldConfig.faceRecognition.scoreThreshold = 0.55;
    }));
  }, [pomoConfigs?.faceRecognition?.scoreThreshold, setPomoConfigs]);

  return (
    <I18nProvider locale={pomoConfigs.locale}>
      <FaceRecognitionPomoApp
        pomoConfigs={pomoConfigs}
        setPomoConfigs={setPomoConfigs}
        authorizedFaceProfile={authorizedFaceProfile}
        setAuthorizedFaceProfile={setAuthorizedFaceProfile}
      />
    </I18nProvider>
  );
}

export default FaceRecognitionPomo;
