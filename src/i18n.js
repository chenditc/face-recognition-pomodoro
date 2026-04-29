import React, { useContext } from 'react';

const defaultLocale = 'en';

const messages = {
  en: {
    app: {
      title: 'Face Recognition Pomodoro',
    },
    common: {
      loading: 'Loading...',
      cancel: 'Cancel',
      confirm: 'Confirm',
      dismiss: 'Dismiss',
      remove: 'Remove',
      reset: 'Reset',
      language: 'Language',
      english: 'English',
      chinese: 'Chinese',
      minutes: 'minutes',
      seconds: 'seconds',
      times: 'times',
      entries: 'entries',
    },
    config: {
      title: 'Configuration',
      sections: {
        general: 'General',
        pomodoro: 'Pomodoro Config',
        posture: 'Posture Reminder Config',
        backgroundVideo: 'Background Video Config',
        faceRecognition: 'Face Recognition Config',
        notification: 'Notification Config',
        history: 'Pomodoro History Config',
      },
      labels: {
        appLanguage: 'App Language',
        focusTime: 'Focus Time',
        restTime: 'Rest Time',
        maxAllowedMissingTime: 'Max Allowed Missing Time',
        postureSwitchInterval: 'Posture Switch Interval',
        postureReminderMessage: 'Posture Reminder Message',
        youtubeUrl: 'Youtube Url',
        minFaceDetectionInterval: 'Minimum Face Detection Interval',
        missingFaceRetryInterval: 'Missing Face Retry Interval',
        maxFaceDetectionInterval: 'Maximum Face Detection Interval',
        notificationIntervalTime: 'Notification Interval Time',
        notificationIntervalMultiplier: 'Notification Interval Multiplier',
        focusNotificationMessage: 'Focus Notification Message',
        restNotificationMessage: 'Rest Notification Message',
        maxPomodoroHistoryEntries: 'Max Pomodoro History Entries',
      },
      switches: {
        enablePostureReminder: 'Enable Posture Reminder',
        showFaceRecognitionStatus: 'Show Face Recognition Status',
        showLiveCameraPreview: 'Show Live Camera Preview',
        showFaceDetectionResult: 'Show Face Detection Result',
        showPomodoroHistory: 'Show Pomodoro History',
        onlyShowTodayHistory: "Only Show Today's History",
      },
      tooltips: {
        language: 'Choose the app language for labels and default messages.',
        maxAllowedMissingTime: 'If the rest time or focus time is less than this, it will not be counted as a separated time slot.',
        postureSwitchInterval: "After this many minutes of continuous work, you'll be reminded to switch posture (sit/stand).",
        postureReminderMessage: "This message will be displayed when it's time to switch posture.",
        youtubeUrl: 'Enter a Youtube video url. Leave empty to not play anything.',
        detectionInterval: 'Every n seconds we detect user face, shorter interval might increase CPU usage, longer interval might make pomodoro less sensitive.',
        missingFaceRetryInterval: 'When the face is currently missing, retry at this interval so the app can recover faster when you come back.',
        notificationIntervalMultiplier: "Every time a notification is sent, its wait time will multiply the previous interval, so the sending interval is longer and longer. If you don't want this behavior, change it to 1.",
        focusNotificationMessage: "This message will be displayed to let you know it's time to start Pomodoro session.",
        restNotificationMessage: "This message will be displayed to let you know it's time to take a break.",
        maxHistoryEntries: 'Increasing this might degrade performance.',
      },
    },
    intro: {
      title: 'Intro to Face Recognition Pomodoro',
      whatIsThis: 'What is this?',
      markdown: `This is a **Pomodoro Clock**. It's special because:

- It can automatically help you start **a focus session** when the camera detects your face.
- It can automatically start **a rest session** when the camera no longer detects your face.

We will need two permissions from you:
- Permission to **send notifications**, so that you will get reminded when a session times out.
- Permission to **access your camera**.

Please click the allow button around the browser URL.`,
      leftCameraTitle: "What if I left my camera but don't want to stop the Pomodoro session?",
      leftCameraBody: 'If the time of stepping away is less than **Max Allowed Missing Time** in the settings, the Pomodoro session will continue when you are back.',
      whyPopupTitle: 'Why does this intro always pop up on start?',
      whyPopupBody: 'There must be at least one user interaction before notifications can work, so this dialog is used as that first interaction.',
      performanceTitle: 'Will this slow down my computer or phone?',
      performanceBody: 'Usually not. It uses the GPU to detect your face and typically only takes a few milliseconds.',
      continue: "Ok, let's continue.",
    },
    faceStatus: {
      cameraReady: 'Camera Ready:',
      cameraSupported: 'Camera Supported:',
      modelLoaded: 'Model Loaded:',
      faceDetected: 'Face Detected:',
    },
    status: {
      working: 'WORKING',
      rest: 'REST',
    },
    posture: {
      switched: 'Switched Posture',
      reminderWithRemaining: 'Posture reminder · {minutes} min left',
    },
    history: {
      title: 'Pomodoro History',
      restFor: 'Rest for {duration}',
      removeRestTooltip: 'Remove this session, and merge adjacent sessions.',
      pomodoroCardTitle: 'Pomodoro #{index}',
      totalFocus: 'Total: {duration}',
      focusSeriesName: 'Focus',
    },
    defaults: {
      focusNotificationText: 'Time to focus!',
      restNotificationText: "Let's take a break.",
      postureReminderText: "You've been sitting for a while. Time to switch posture!",
    },
  },
  zh: {
    app: {
      title: '人脸番茄钟',
    },
    common: {
      loading: '加载中...',
      cancel: '取消',
      confirm: '确认',
      dismiss: '关闭',
      remove: '删除',
      reset: '重置',
      language: '语言',
      english: 'English',
      chinese: '中文',
      minutes: '分钟',
      seconds: '秒',
      times: '倍',
      entries: '条',
    },
    config: {
      title: '设置',
      sections: {
        general: '通用设置',
        pomodoro: '番茄钟设置',
        posture: '姿势提醒设置',
        backgroundVideo: '背景视频设置',
        faceRecognition: '人脸检测设置',
        notification: '通知设置',
        history: '历史记录设置',
      },
      labels: {
        appLanguage: '界面语言',
        focusTime: '专注时长',
        restTime: '休息时长',
        maxAllowedMissingTime: '最大允许丢失时长',
        postureSwitchInterval: '姿势切换间隔',
        postureReminderMessage: '姿势提醒文案',
        youtubeUrl: 'Youtube 地址',
        minFaceDetectionInterval: '最小人脸检测间隔',
        missingFaceRetryInterval: '丢脸重试间隔',
        maxFaceDetectionInterval: '最大人脸检测间隔',
        notificationIntervalTime: '通知间隔时间',
        notificationIntervalMultiplier: '通知间隔倍率',
        focusNotificationMessage: '专注提醒文案',
        restNotificationMessage: '休息提醒文案',
        maxPomodoroHistoryEntries: '最多保留历史条数',
      },
      switches: {
        enablePostureReminder: '开启姿势提醒',
        showFaceRecognitionStatus: '显示人脸检测状态',
        showLiveCameraPreview: '显示实时摄像头预览',
        showFaceDetectionResult: '显示人脸检测结果',
        showPomodoroHistory: '显示番茄钟历史',
        onlyShowTodayHistory: '只显示今天的历史',
      },
      tooltips: {
        language: '选择界面语言，并同步未自定义的默认提示文案。',
        maxAllowedMissingTime: '如果休息或专注时间小于这个值，就不会被单独计为一个时间段。',
        postureSwitchInterval: '连续工作达到这个时长后，会提醒你切换姿势（坐/站）。',
        postureReminderMessage: '到达姿势提醒时会展示这条文案。',
        youtubeUrl: '输入 Youtube 视频地址。留空则不播放背景视频。',
        detectionInterval: '每隔 n 秒做一次人脸检测。间隔越短越灵敏，但 CPU 使用率可能更高。',
        missingFaceRetryInterval: '当前没检测到脸时，用这个频率重试，这样你回来时能更快恢复。',
        notificationIntervalMultiplier: '每次发送通知后，下次通知等待时间会乘以上一次的间隔。如果不想退避，设为 1。',
        focusNotificationMessage: '到该开始专注时，会展示这条通知文案。',
        restNotificationMessage: '到该休息时，会展示这条通知文案。',
        maxHistoryEntries: '调大这个值可能会影响性能。',
      },
    },
    intro: {
      title: '人脸番茄钟介绍',
      whatIsThis: '这是什么？',
      markdown: `这是一个**番茄钟**，但它有点不一样：

- 当摄像头检测到你的脸时，它会自动帮你开始**专注阶段**。
- 当摄像头检测不到你的脸时，它会自动进入**休息阶段**。

我们需要你授权两项权限：
- **通知权限**，这样在阶段超时后你会收到提醒。
- **摄像头权限**，这样应用才能检测你是否在工位上。

请点击浏览器地址栏附近的允许按钮。`,
      leftCameraTitle: '如果我暂时离开摄像头，但不想中断番茄钟怎么办？',
      leftCameraBody: '如果你离开的时间小于设置里的 **最大允许丢失时长**，回来后会继续并入同一段专注时间。',
      whyPopupTitle: '为什么每次启动都会弹这个介绍？',
      whyPopupBody: '通知能力至少需要一次用户交互后才能正常工作，所以这里顺便把它作为第一次交互。',
      performanceTitle: '这会拖慢我的电脑或手机吗？',
      performanceBody: '通常不会。它主要借助 GPU 做人脸检测，一次检测通常只需要几毫秒。',
      continue: '好的，继续。',
    },
    faceStatus: {
      cameraReady: '摄像头已就绪：',
      cameraSupported: '支持摄像头：',
      modelLoaded: '模型已加载：',
      faceDetected: '检测到人脸：',
    },
    status: {
      working: '专注中',
      rest: '休息中',
    },
    posture: {
      switched: '已切换姿势',
      reminderWithRemaining: '姿势提醒 · {minutes} 分钟后',
    },
    history: {
      title: '番茄钟历史',
      restFor: '休息了 {duration}',
      removeRestTooltip: '删除这段休息记录，并合并相邻时间段。',
      pomodoroCardTitle: '番茄钟 #{index}',
      totalFocus: '总计：{duration}',
      focusSeriesName: '专注',
    },
    defaults: {
      focusNotificationText: '该开始专注了！',
      restNotificationText: '该休息一下了。',
      postureReminderText: '你已经坐了很久了，该切换一下姿势了！',
    },
  },
};

const supportedLocales = [
  { value: 'en', label: 'English' },
  { value: 'zh', label: '中文' },
];

function getLocale(locale) {
  return messages[locale] ? locale : defaultLocale;
}

function getMessage(locale, key) {
  return key.split('.').reduce((value, part) => value?.[part], messages[getLocale(locale)]);
}

function interpolate(message, values = {}) {
  return message.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ''));
}

function translate(locale, key, values = {}) {
  const safeLocale = getLocale(locale);
  const message = getMessage(safeLocale, key) ?? getMessage(defaultLocale, key) ?? key;
  if (typeof message !== 'string') return key;
  return interpolate(message, values);
}

function getDefaultNotificationMessages(locale) {
  return {
    focusNotificationText: translate(locale, 'defaults.focusNotificationText'),
    restNotificationText: translate(locale, 'defaults.restNotificationText'),
    postureReminderText: translate(locale, 'defaults.postureReminderText'),
  };
}

function syncLocaleDefaults(previousConfig, nextConfig) {
  const previousLocale = getLocale(previousConfig?.locale);
  const nextLocale = getLocale(nextConfig?.locale);

  if (previousLocale === nextLocale) return nextConfig;

  const previousDefaults = getDefaultNotificationMessages(previousLocale);
  const nextDefaults = getDefaultNotificationMessages(nextLocale);

  const localizedConfig = {
    ...nextConfig,
    postureReminder: { ...nextConfig.postureReminder },
  };

  if (localizedConfig.focusNotificationText === previousDefaults.focusNotificationText) {
    localizedConfig.focusNotificationText = nextDefaults.focusNotificationText;
  }
  if (localizedConfig.restNotificationText === previousDefaults.restNotificationText) {
    localizedConfig.restNotificationText = nextDefaults.restNotificationText;
  }
  if (localizedConfig.postureReminder?.notificationText === previousDefaults.postureReminderText) {
    localizedConfig.postureReminder.notificationText = nextDefaults.postureReminderText;
  }

  return localizedConfig;
}

function formatDuration(seconds, preserveSeconds = false, locale = defaultLocale) {
  const roundSeconds = Math.floor(seconds);

  if (getLocale(locale) === 'zh') {
    if (roundSeconds < 60) {
      return `${roundSeconds}秒`;
    }
    if (roundSeconds < 3600) {
      const minutes = Math.floor(roundSeconds / 60);
      const secondsResidual = roundSeconds - minutes * 60;
      return preserveSeconds ? `${minutes}分 ${secondsResidual}秒` : `${minutes}分`;
    }
    const minutes = Math.floor(roundSeconds / 60);
    const minutesResidual = minutes % 60;
    const hours = Math.floor(minutes / 60);
    return `${hours}小时 ${minutesResidual}分`;
  }

  if (roundSeconds < 60) {
    return `${roundSeconds}s`;
  }
  if (roundSeconds < 3600) {
    const minutes = Math.floor(roundSeconds / 60);
    const secondsResidual = roundSeconds - minutes * 60;
    return preserveSeconds ? `${minutes}m ${secondsResidual}s` : `${minutes}m`;
  }
  const minutes = Math.floor(roundSeconds / 60);
  const minutesResidual = minutes % 60;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutesResidual}m`;
}

function getLocaleTimeCode(locale) {
  return getLocale(locale) === 'zh' ? 'zh-CN' : 'en-US';
}

const I18nContext = React.createContext({
  locale: defaultLocale,
  t: (key, values) => translate(defaultLocale, key, values),
});

function I18nProvider(props) {
  const locale = getLocale(props.locale);

  function t(key, values) {
    return translate(locale, key, values);
  }

  return (
    <I18nContext.Provider value={{ locale, t }}>
      {props.children}
    </I18nContext.Provider>
  );
}

function useI18n() {
  return useContext(I18nContext);
}

export {
  defaultLocale,
  formatDuration,
  getDefaultNotificationMessages,
  getLocaleTimeCode,
  I18nProvider,
  supportedLocales,
  syncLocaleDefaults,
  useI18n,
};
