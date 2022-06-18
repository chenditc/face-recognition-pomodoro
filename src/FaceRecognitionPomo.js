import HealthMonitor from "./HealthMonitor";
import 'antd/dist/antd.css';
import 'antd/dist/antd.less'
import { useState } from "react";
import { useLocalStorageState } from 'ahooks';
import { defaultPomoConfigs, PomoConfigsContext } from './PomoConfigsContext'
import { TopAppBar, TopAppBarRow, TopAppBarSection, TopAppBarActionItem, TopAppBarTitle, TopAppBarFixedAdjust } from '@rmwc/top-app-bar';
import { ThemeProvider } from '@rmwc/theme'
import { Portal } from '@rmwc/base';

import '@rmwc/theme/styles';
import '@rmwc/typography/styles';
import '@rmwc/top-app-bar/styles';
import '@rmwc/icon/styles';

import PomoConfigsDialog from "./PomoConfigsDialog";

function FaceRecognitionPomo() {
  const [pomoConfigs, setPomoConfigs] = useLocalStorageState("pomoConfig", {
    defaultValue: defaultPomoConfigs
  })

  const [openConfigDialog, setOpenConfigDialog] = useState(false);

  return (
    <>
      <ThemeProvider
        options={{
          primary: '#424242',
          secondary: '#FB8C00'
        }}
      >
        <Portal />
        <TopAppBar>
          <TopAppBarRow>
            <TopAppBarSection alignStart>
              <TopAppBarActionItem icon="help" />
            </TopAppBarSection>
            <TopAppBarSection>
              <TopAppBarTitle>
                Face Recognition Pomodoro
              </TopAppBarTitle>
            </TopAppBarSection>
            <TopAppBarSection alignEnd>
              <TopAppBarActionItem icon="settings" onClick={() => setOpenConfigDialog(true)}/>
            </TopAppBarSection>
          </TopAppBarRow>
        </TopAppBar>
        <TopAppBarFixedAdjust />

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