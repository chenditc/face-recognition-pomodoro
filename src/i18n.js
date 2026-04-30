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
      done: 'Done',
      remove: 'Remove',
      retry: 'Retake',
      reset: 'Reset',
      skip: 'Skip for now',
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
        authorizedFace: 'Authorized Face',
        pomodoro: 'Pomodoro Config',
        posture: 'Posture Reminder Config',
        backgroundVideo: 'Background Video Config',
        faceRecognition: 'Face Recognition Config',
        notification: 'Notification Config',
        history: 'Pomodoro History Config',
      },
      labels: {
        appLanguage: 'App Language',
        authorizedFaceStatus: 'Authorized Face Status',
        focusTime: 'Focus Time',
        restTime: 'Rest Time',
        maxAllowedMissingTime: 'Max Allowed Missing Time',
        matchStrictness: 'Match Strictness',
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
        matchStrictness: 'Higher strictness reduces accidental matches, but may require more consistent lighting and positioning.',
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
      authorizedFace: {
        enrolled: 'Enrolled',
        notEnrolled: 'Not enrolled',
        enrolledBody: '{count} samples are saved on this device.',
        notEnrolledBody: 'Only the enrolled face can start focus time.',
        enroll: 'Enroll face',
        reEnroll: 'Re-enroll face',
        delete: 'Delete face',
        deleteConfirm: 'Delete the authorized face from this device?',
        lenient: 'Lenient',
        balanced: 'Balanced',
        strict: 'Strict',
        previewAlt: 'Authorized face preview',
        emptyPreview: 'No face',
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
    faceDebug: {
      title: 'Detection Debug',
      show: 'Show details',
      hide: 'Hide details',
      authorizedSamples: 'Authorized Samples',
      camera: 'Camera',
      embeddingLength: 'Embedding Length',
      matchDistance: 'Match Distance',
      matchIndex: 'Match Index',
      matchStrictness: 'Match Strictness',
      matchThreshold: 'Match Threshold',
      source: 'Frame Source',
      status: 'Status',
      facesTotal: 'Faces Total',
      facesAboveThreshold: 'Faces Above Threshold',
      threshold: 'Score Threshold',
      topScore: 'Top Face Score',
      similarity: 'Match Similarity',
      lastDetection: 'Last Detection',
      imageCapture: 'ImageCapture',
      video: 'Video Element',
      noData: 'No data yet',
    },
    authBar: {
      authorized: 'Authorized face detected',
      noFace: 'No face detected',
      unknownFace: 'Face detected, not recognized',
      notEnrolled: 'No authorized face enrolled',
      profileIncompatible: 'Saved face profile is incompatible. Re-enroll required.',
      cameraReconnecting: 'Camera reconnecting...',
      enrollingFace: 'Enrolling authorized face...',
    },
    status: {
      working: 'WORKING',
      rest: 'REST',
      unknownFace: 'UNKNOWN FACE',
      noAuthorizedFace: 'SET UP FACE',
      profileIncompatible: 'RE-ENROLL',
      cameraReconnecting: 'RECONNECTING',
      enrollingFace: 'ENROLL FACE',
    },
    posture: {
      switched: 'Switched Posture',
      reminderWithRemaining: 'Posture reminder · {minutes} min left',
    },
    enrollmentPrompt: {
      title: 'Set up your authorized face',
      body: 'Only the saved face will count as focus time. Face data stays on this device.',
      start: 'Start enrollment',
      skip: 'Skip for now',
    },
    enrollment: {
      title: 'Authorized Face Enrollment',
      introTitle: 'Record the face that should unlock focus time',
      introBody: 'This setup takes a few seconds. We will capture several face descriptors from your camera feed and store them locally for matching.',
      privacyTitle: 'Local only',
      privacyBody: 'Your face samples stay in this browser on this device. Nothing is uploaded to a server.',
      captureTips: 'Use steady light, keep one face in frame, and look straight at the camera while we collect 5 samples.',
      captureTitle: 'Hold still while samples are captured',
      captureBody: 'Samples are recorded automatically as soon as the face is centered and clear.',
      successTitle: 'Authorized face saved',
      successBody: 'This face can now start focus sessions on this device.',
      previewTitle: 'Enrollment snapshot',
      previewBody: 'This thumbnail is stored locally to help you identify the saved profile.',
      sampleCount: '{count}/{total} samples',
      startCapture: 'Start capture',
      skipForNow: 'Skip for now',
      retryCapture: 'Restart capture',
      guidance: {
        loading: 'Preparing camera and face model...',
        alignFace: 'Center your face inside the frame.',
        noFace: 'No face detected. Move into view.',
        multipleFaces: 'Only one face can be enrolled at a time.',
        moveCloser: 'Move a little closer to the camera.',
        holdStill: 'Hold still for the next sample.',
        sampleCaptured: 'Sample captured {count}/{total}.',
        ready: 'All samples captured. Review and save.',
      },
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
      done: '完成',
      remove: '删除',
      retry: '重录',
      reset: '重置',
      skip: '稍后再说',
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
        authorizedFace: '授权人脸',
        pomodoro: '番茄钟设置',
        posture: '姿势提醒设置',
        backgroundVideo: '背景视频设置',
        faceRecognition: '人脸检测设置',
        notification: '通知设置',
        history: '历史记录设置',
      },
      labels: {
        appLanguage: '界面语言',
        authorizedFaceStatus: '授权人脸状态',
        focusTime: '专注时长',
        restTime: '休息时长',
        maxAllowedMissingTime: '最大允许丢失时长',
        matchStrictness: '匹配严格度',
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
        matchStrictness: '严格度越高，误识别越少，但会更依赖稳定的光线和位置。',
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
      authorizedFace: {
        enrolled: '已录入',
        notEnrolled: '未录入',
        enrolledBody: '当前设备已保存 {count} 份样本。',
        notEnrolledBody: '只有录入的人脸才会计入专注时间。',
        enroll: '录入人脸',
        reEnroll: '重新录入',
        delete: '删除人脸',
        deleteConfirm: '要从当前设备删除这张授权人脸吗？',
        lenient: '宽松',
        balanced: '平衡',
        strict: '严格',
        previewAlt: '授权人脸预览',
        emptyPreview: '未录入',
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
    faceDebug: {
      title: '检测调试信息',
      show: '展开详情',
      hide: '收起详情',
      authorizedSamples: '授权样本数',
      camera: '摄像头',
      embeddingLength: 'Embedding 长度',
      matchDistance: '匹配距离',
      matchIndex: '匹配索引',
      matchStrictness: '匹配严格度',
      matchThreshold: '匹配阈值',
      source: '取帧来源',
      status: '当前状态',
      facesTotal: '总人脸数',
      facesAboveThreshold: '超过阈值的人脸数',
      threshold: '检测阈值',
      topScore: '最高人脸分数',
      similarity: '匹配相似度',
      lastDetection: '最近一次检测',
      imageCapture: 'ImageCapture',
      video: 'Video 元素',
      noData: '还没有检测数据',
    },
    authBar: {
      authorized: '已检测到授权人脸',
      noFace: '当前没有检测到人脸',
      unknownFace: '检测到人脸，但不是授权用户',
      notEnrolled: '还没有录入授权人脸',
      profileIncompatible: '已保存的人脸档案与当前模型不兼容，请重新录入。',
      cameraReconnecting: '摄像头正在重连...',
      enrollingFace: '正在录入授权人脸...',
    },
    status: {
      working: '专注中',
      rest: '休息中',
      unknownFace: '未授权人脸',
      noAuthorizedFace: '请先录脸',
      profileIncompatible: '请重新录脸',
      cameraReconnecting: '重连摄像头',
      enrollingFace: '录入人脸中',
    },
    posture: {
      switched: '已切换姿势',
      reminderWithRemaining: '姿势提醒 · {minutes} 分钟后',
    },
    enrollmentPrompt: {
      title: '先录入你的授权人脸',
      body: '录入后，只有这张脸出现时才会计入专注时间。人脸数据只保存在当前设备。',
      start: '开始录入',
      skip: '稍后再说',
    },
    enrollment: {
      title: '录入授权人脸',
      introTitle: '先录入一张可以启动专注计时的人脸',
      introBody: '整个流程只要几秒钟。我们会从摄像头中采集几份人脸特征，并保存在本地浏览器里用于后续匹配。',
      privacyTitle: '只保存在本地',
      privacyBody: '你的样本不会上传到服务器，只会留在当前设备的这个浏览器里。',
      captureTips: '保持光线稳定，画面里只留一个人，并正对摄像头，我们会自动采集 5 份样本。',
      captureTitle: '请保持不动，系统会自动采样',
      captureBody: '当人脸居中且清晰时，会自动记录样本。',
      successTitle: '授权人脸已保存',
      successBody: '从现在开始，这张脸可以在当前设备上启动专注阶段。',
      previewTitle: '录入快照',
      previewBody: '这张缩略图只保存在本地，用来帮助你识别当前保存的是哪张脸。',
      sampleCount: '{count}/{total} 份样本',
      startCapture: '开始采集',
      skipForNow: '稍后再说',
      retryCapture: '重新采集',
      guidance: {
        loading: '正在准备摄像头和模型...',
        alignFace: '请把脸放到取景框中间。',
        noFace: '没有检测到人脸，请进入画面。',
        multipleFaces: '录入时画面里只能有一张脸。',
        moveCloser: '请再靠近摄像头一点。',
        holdStill: '保持不动，正在等待下一份样本。',
        sampleCaptured: '已采集样本 {count}/{total}。',
        ready: '样本采集完成，可以保存了。',
      },
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
