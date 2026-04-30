import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import useInterval from 'use-interval';
import { css } from '@emotion/css';
import CheckSquareFilled from '@ant-design/icons/CheckSquareFilled';
import CloseSquareOutlined from '@ant-design/icons/CloseSquareOutlined';

import { Typography } from '@rmwc/typography';
import '@rmwc/typography/styles';
import { Grid, GridCell } from '@rmwc/grid';
import '@rmwc/grid/styles';
import { LinearProgress } from '@rmwc/linear-progress';
import '@rmwc/linear-progress/styles';

import 'image-capture';

import { getAuthorizedFaceMatch, getFaceMatchThreshold } from '../FaceAuthorization/authorizedFaceUtils';
import { PomoConfigsContext } from '../UserConfigs/PomoConfigsContext';
import { useI18n } from '../i18n';

function StatusMessage(props) {
  return (
    <Typography use="body2" tag="div" className={css`text-align: center`}>
      {props.msg} {props.status ?
        <CheckSquareFilled style={{ color: '#1faa00' }} /> :
        <CloseSquareOutlined style={{ color: '#a30000' }} />
      }
    </Typography>
  );
}

function GetFaceDetectionStatus(cameraSupported, cameraReady, faceDetected, loadedModelCount, labels) {
  const cameraMessage = cameraSupported ? labels.cameraReady : labels.cameraSupported;
  const cameraStatus = cameraSupported ? cameraReady : cameraSupported;
  return (
    <Grid>
      <GridCell desktop={4} span={2} phone={4}>
        <StatusMessage msg={cameraMessage} status={cameraStatus} />
      </GridCell>
      <GridCell desktop={4} span={2} phone={4}>
        <StatusMessage msg={labels.modelLoaded} status={loadedModelCount > 1} />
      </GridCell>
      <GridCell desktop={4} span={2} phone={4}>
        <StatusMessage msg={labels.faceDetected} status={faceDetected} />
      </GridCell>
    </Grid>
  );
}

function getDebugStatusLabel(status, t) {
  if (status === 'authorized') return t('authBar.authorized');
  if (status === 'no-face') return t('authBar.noFace');
  if (status === 'unknown-face') return t('authBar.unknownFace');
  if (status === 'not-enrolled') return t('authBar.notEnrolled');
  if (status === 'profile-incompatible') return t('authBar.profileIncompatible');
  if (status === 'camera-reconnecting') return t('authBar.cameraReconnecting');
  if (status === 'enrolling-face') return t('authBar.enrollingFace');
  return t('faceDebug.noData');
}

function createHumanConfig() {
  return {
    modelBasePath: 'https://cdn.jsdelivr.net/npm/@vladmandic/human/models/',
    wasmPath: '/face-recognition-pomodoro/models/',
    face: {
      enabled: true,
      detector: {
        modelPath: 'blazeface-back.json',
        rotation: true,
      },
      emotion: { enabled: false },
      antispoof: { enabled: false },
      liveness: { enabled: false },
      mesh: { enabled: false },
      attention: { enabled: false },
      iris: { enabled: false },
      description: { enabled: true },
    },
    body: { enabled: false },
    hand: { enabled: false },
    object: { enabled: false },
    gesture: { enabled: false },
    debug: true,
  };
}

function getBaseFaceState(enrolled, nextCameraReady) {
  return {
    status: enrolled ? 'camera-reconnecting' : 'not-enrolled',
    authorizedFace: undefined,
    rawFaceCount: 0,
    similarity: 0,
    cameraReady: nextCameraReady,
  };
}

function PeriodicFaceDetection(props) {
  const PomoConfigs = useContext(PomoConfigsContext);
  const { locale, t } = useI18n();
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const videoTrackRef = useRef(null);
  const lastReconnectAttemptRef = useRef(0);
  const hasEverConnectedRef = useRef(false);
  const requestWebcamReconnectRef = useRef(() => {});
  const humanML = useRef(null);

  const [detected, setDetected] = useState(undefined);
  const [visibleFaceDetected, setVisibleFaceDetected] = useState(false);
  const [cameraSupported] = useState('mediaDevices' in navigator);
  const [cameraReady, setCameraReady] = useState(false);
  const [webcamKey, setWebcamKey] = useState(0);
  const [detectionRunning, setDetectionRunning] = useState(false);
  const [lastDetectionTime, setLastDetectionTime] = useState(new Date());
  const [nextDetectionInterval, setNextDetectionInterval] = useState(PomoConfigs.faceRecognition.minDetectionInterval);
  const [debugExpanded, setDebugExpanded] = useState(false);
  const [debugManuallyChanged, setDebugManuallyChanged] = useState(false);
  const [debugInfo, setDebugInfo] = useState({
    status: 'idle',
    rawFaceCount: 0,
    visibleFaceCount: 0,
    topFaceScore: 0,
    similarity: 0,
    matchDistance: Number.POSITIVE_INFINITY,
    matchIndex: -1,
    embeddingLength: 0,
    lastDetectionAt: null,
    source: 'video',
  });

  const onFaceDetectionResult = props.onFaceDetectionResult;
  const minDetectionInterval = PomoConfigs.faceRecognition.minDetectionInterval;
  const maxDetectionInterval = PomoConfigs.faceRecognition.maxDetectionInterval;
  const missingFaceRetryInterval = PomoConfigs.faceRecognition.missingFaceRetryIntervalSeconds;
  const matchStrictness = PomoConfigs.faceRecognition.matchStrictness;
  const configuredScoreThreshold = PomoConfigs.faceRecognition.scoreThreshold;
  const scoreThreshold = configuredScoreThreshold > 0.8 ? 0.55 : configuredScoreThreshold;
  const matchThreshold = getFaceMatchThreshold(matchStrictness);
  const enableDetection = PomoConfigs.enableDetection;
  const suspendDetection = props.suspendDetection;
  const detectionEnabled = enableDetection && !suspendDetection;

  const imageCaptureSupported = 'ImageCapture' in window;
  const cameraReconnectCooldownMs = 3000;

  const shouldAutoShowPreview = detected === undefined
    || detected?.status === 'no-face'
    || detected?.status === 'unknown-face'
    || detected?.status === 'profile-incompatible'
    || detected?.status === 'camera-reconnecting';
  const shouldAutoExpandDebug = detectionEnabled && (
    PomoConfigs.faceRecognition.showFaceRecognitionStatus
    || PomoConfigs.faceRecognition.showCameraPreview
    || (detected?.status && detected.status !== 'authorized')
  );
  const showFaceRecognitionStatus = debugExpanded && detectionEnabled;
  const showCameraPreview = debugExpanded && detectionEnabled && (
    PomoConfigs.faceRecognition.showCameraPreview || shouldAutoShowPreview
  );
  const debugStatusLabel = getDebugStatusLabel(detected?.status || debugInfo.status, t);

  const emitFaceState = useCallback((nextState) => {
    setDetected(nextState);
    setVisibleFaceDetected((nextState?.rawFaceCount || 0) > 0);
    onFaceDetectionResult(nextState);
  }, [onFaceDetectionResult]);

  useEffect(() => {
    if (debugManuallyChanged) return;
    setDebugExpanded(shouldAutoExpandDebug);
  }, [debugManuallyChanged, shouldAutoExpandDebug]);

  function requestWebcamReconnect(reason, force = false) {
    if (!detectionEnabled) return;

    const now = Date.now();
    if (!force && now - lastReconnectAttemptRef.current < cameraReconnectCooldownMs) {
      return;
    }

    lastReconnectAttemptRef.current = now;
    console.log(new Date(), 'Reconnect webcam because', reason);
    videoTrackRef.current = null;
    setCameraReady(false);
    setVisibleFaceDetected(false);
    setNextDetectionInterval(minDetectionInterval);
    setLastDetectionTime(new Date(0));
    setWebcamKey((currentKey) => currentKey + 1);
    setDebugInfo((currentDebugInfo) => ({
      ...currentDebugInfo,
      status: props.authorizedFaceProfile?.descriptors?.length > 0 ? 'camera-reconnecting' : 'not-enrolled',
      source: imageCaptureSupported ? 'imageCapture' : 'video',
    }));
    emitFaceState(getBaseFaceState(props.authorizedFaceProfile?.descriptors?.length > 0, false));
  }

  requestWebcamReconnectRef.current = requestWebcamReconnect;

  useEffect(() => {
    if (!enableDetection || humanML.current) return undefined;

    let cancelled = false;
      const humanConfig = createHumanConfig();
    import('@vladmandic/human').then((HumanModule) => {
      if (cancelled) return;
      humanML.current = new HumanModule.Human(humanConfig);
      humanML.current.init(humanConfig).then(() => {
        if (cancelled) return;
        humanML.current.load(humanConfig);
        console.log('Human init', humanML.current);
      });
    });

    return () => {
      cancelled = true;
    };
  }, [enableDetection]);

  useEffect(() => {
    if (!enableDetection || !navigator.mediaDevices?.addEventListener) return undefined;

    function onDeviceChange() {
      const currentTrack = videoTrackRef.current;
      if (!currentTrack || currentTrack.readyState !== 'live') {
        requestWebcamReconnectRef.current('devicechange', true);
      }
    }

    navigator.mediaDevices.addEventListener('devicechange', onDeviceChange);
    return () => navigator.mediaDevices.removeEventListener('devicechange', onDeviceChange);
  }, [enableDetection]);

  useEffect(() => {
    if (!enableDetection || suspendDetection) return;

    if (!props.authorizedFaceProfile?.descriptors?.length) {
      if (detected?.status === 'not-enrolled' && detected?.cameraReady === cameraReady) return;
      emitFaceState(getBaseFaceState(false, cameraReady));
      return;
    }

    if (!cameraReady) {
      if (detected?.status === 'camera-reconnecting' && detected?.cameraReady === false) return;
      emitFaceState(getBaseFaceState(true, false));
    }
  }, [cameraReady, detected?.cameraReady, detected?.status, emitFaceState, enableDetection, props.authorizedFaceProfile, suspendDetection]);

  useEffect(() => {
    if (!suspendDetection) return undefined;
    videoTrackRef.current = null;
    setCameraReady(false);
    return undefined;
  }, [suspendDetection]);

  useInterval(() => {
    if (!detectionEnabled) return;
    if (detectionRunning) return;
    if (!humanML.current) return;

    const newCameraReady = Boolean(
      videoTrackRef.current
      && videoTrackRef.current.readyState === 'live'
      && !videoTrackRef.current.muted
      && videoTrackRef.current.enabled
    );

    if (newCameraReady !== cameraReady) {
      setCameraReady(newCameraReady);
    }

    if (!newCameraReady) {
      if (hasEverConnectedRef.current) {
        requestWebcamReconnect('camera-not-ready');
      }
      return;
    }

    const nextDetectionTime = new Date(lastDetectionTime).setSeconds(lastDetectionTime.getSeconds() + nextDetectionInterval);
    if (nextDetectionTime > new Date()) return;
    setLastDetectionTime(new Date());

    async function detectUsingModel() {
      try {
        setDetectionRunning(true);

        const inputVideo = webcamRef.current?.video;
        if (!inputVideo) return;

        let input = inputVideo;
        if (imageCaptureSupported) {
          const capture = new ImageCapture(videoTrackRef.current);
          input = await capture.grabFrame();
        }

        const detectionResult = await humanML.current.detect(input);
        const visibleFaces = detectionResult.face.filter((face) => face.score > scoreThreshold);
        const topFaceScore = detectionResult.face.reduce((currentMaxScore, face) => Math.max(currentMaxScore, face.score || 0), 0);
        const bestEmbeddingLength = visibleFaces.reduce((currentMaxLength, face) => Math.max(currentMaxLength, face.embedding?.length || 0), 0);
        const faceState = {
          ...getAuthorizedFaceMatch(
            detectionResult.face,
            props.authorizedFaceProfile,
            scoreThreshold,
            matchStrictness,
          ),
          cameraReady: true,
        };
        setDebugInfo({
          status: faceState.status,
          rawFaceCount: detectionResult.face.length,
          visibleFaceCount: visibleFaces.length,
          topFaceScore,
          similarity: faceState.similarity,
          matchDistance: faceState.distance,
          matchIndex: faceState.matchIndex,
          embeddingLength: bestEmbeddingLength,
          lastDetectionAt: new Date().toJSON(),
          source: imageCaptureSupported ? 'imageCapture' : 'video',
        });

        emitFaceState(faceState);

        if (faceState.status !== 'authorized') {
          setNextDetectionInterval(missingFaceRetryInterval);
        }
        else if (detected?.status === 'authorized') {
          setNextDetectionInterval((currentInterval) => Math.min(currentInterval + 5, maxDetectionInterval));
        }
        else {
          setNextDetectionInterval(minDetectionInterval);
        }

        console.log(new Date(), 'Detected face state', faceState);

        if (PomoConfigs.faceRecognition.showFaceRecognitionCanvas) {
          humanML.current.draw.canvas(input, canvasRef.current);
          humanML.current.draw.all(canvasRef.current, detectionResult);
        }
      }
      finally {
        setDetectionRunning(false);
      }
    }

    detectUsingModel();
  }, 1000, true);

  function onUserMedia(stream) {
    console.log('New media stream', stream);
    const nextTrack = stream.getVideoTracks()[0];
    if (!nextTrack) {
      requestWebcamReconnect('missing-video-track', true);
      return;
    }

    hasEverConnectedRef.current = true;
    nextTrack.onended = () => {
      requestWebcamReconnect('track-ended', true);
    };

    videoTrackRef.current = nextTrack;
    setCameraReady(true);
    setNextDetectionInterval(minDetectionInterval);
    setLastDetectionTime(new Date(0));
    setDebugInfo((currentDebugInfo) => ({
      ...currentDebugInfo,
      source: imageCaptureSupported ? 'imageCapture' : 'video',
    }));
  }

  function onUserMediaError(err) {
    console.log(err);
    setCameraReady(false);
    setDebugInfo((currentDebugInfo) => ({
      ...currentDebugInfo,
      status: 'camera-reconnecting',
    }));
    if (hasEverConnectedRef.current) {
      requestWebcamReconnect('on-user-media-error');
    }
  }

  const videoConstraints = {
    width: { ideal: 640 },
    height: { ideal: 480 },
  };
  if (navigator.mediaDevices.getSupportedConstraints) {
    const videoConstraintAbility = navigator.mediaDevices.getSupportedConstraints();
    if (videoConstraintAbility.frameRate) {
      videoConstraints.frameRate = { min: 0, ideal: 1, max: 2 };
    }
  }

  const hiddenCameraHeight = imageCaptureSupported ? '0px' : '1px';
  const cameraHeight = showCameraPreview ? '100%' : hiddenCameraHeight;
  const loadedModelCount = humanML.current ? Object.keys(humanML.current.models).filter((model) => (humanML.current.models[model] !== null)).length : 0;
  const currentProgress = cameraSupported * 0.1 + cameraReady * 0.4 + 0.5 * (loadedModelCount / 2);

  return (
    <>
      <Grid>
        <GridCell span={12}>
          <LinearProgress closed={currentProgress >= 1} progress={currentProgress} />
        </GridCell>
        {detectionEnabled ? (
          <GridCell span={12}>
            <div className={css`
              display: grid;
              gap: 12px;
            `}>
              <button
                type="button"
                onClick={() => {
                  setDebugManuallyChanged(true);
                  setDebugExpanded((currentState) => !currentState);
                }}
                className={css`
                  width: 100%;
                  border: 1px solid rgba(0, 0, 0, 0.08);
                  border-radius: 16px;
                  background: rgba(0, 0, 0, 0.03);
                  padding: 12px 16px;
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                  gap: 12px;
                  text-align: left;
                  cursor: pointer;
                `}
              >
                <div className={css`display: grid; gap: 2px;`}>
                  <Typography use="subtitle2">{t('faceDebug.title')}</Typography>
                  <span className={css`font-size: 12px; color: #666;`}>
                    {debugStatusLabel}
                  </span>
                </div>
                <span className={css`font-size: 12px; color: #666;`}>
                  {debugExpanded ? t('faceDebug.hide') : t('faceDebug.show')}
                </span>
              </button>

              <div className={css`
                height: ${cameraHeight};
                width: ${cameraHeight};
                overflow: hidden;
              `}>
                <Webcam
                  key={webcamKey}
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={videoConstraints}
                  onUserMedia={onUserMedia}
                  onUserMediaError={onUserMediaError}
                />
              </div>

              {debugExpanded ? (
                <div className={css`
                  display: grid;
                  gap: 10px;
                  padding: 12px 14px;
                  border-radius: 14px;
                  background: rgba(0, 0, 0, 0.04);
                  font-size: 12px;
                `}>
                  {showFaceRecognitionStatus ?
                    GetFaceDetectionStatus(cameraSupported, cameraReady, visibleFaceDetected, loadedModelCount, {
                      cameraReady: t('faceStatus.cameraReady'),
                      cameraSupported: t('faceStatus.cameraSupported'),
                      modelLoaded: t('faceStatus.modelLoaded'),
                      faceDetected: t('faceStatus.faceDetected'),
                    }) : null}
                  <div className={css`
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
                    gap: 8px 12px;
                  `}>
                    <span>{t('faceDebug.camera')}: {cameraReady ? 'live' : 'not-ready'}</span>
                    <span>{t('faceDebug.source')}: {debugInfo.source === 'imageCapture' ? t('faceDebug.imageCapture') : t('faceDebug.video')}</span>
                    <span>{t('faceDebug.status')}: {debugStatusLabel}</span>
                    <span>{t('faceDebug.authorizedSamples')}: {props.authorizedFaceProfile?.descriptors?.length || 0}</span>
                    <span>{t('faceDebug.threshold')}: {scoreThreshold.toFixed(2)}</span>
                    <span>{t('faceDebug.matchStrictness')}: {matchStrictness}</span>
                    <span>{t('faceDebug.matchThreshold')}: {matchThreshold.toFixed(2)}</span>
                    <span>{t('faceDebug.matchIndex')}: {debugInfo.matchIndex}</span>
                    <span>{t('faceDebug.facesTotal')}: {debugInfo.rawFaceCount}</span>
                    <span>{t('faceDebug.facesAboveThreshold')}: {debugInfo.visibleFaceCount}</span>
                    <span>{t('faceDebug.topScore')}: {debugInfo.topFaceScore ? debugInfo.topFaceScore.toFixed(3) : '0.000'}</span>
                    <span>{t('faceDebug.similarity')}: {debugInfo.similarity ? debugInfo.similarity.toFixed(3) : '0.000'}</span>
                    <span>{t('faceDebug.matchDistance')}: {Number.isFinite(debugInfo.matchDistance) ? debugInfo.matchDistance.toFixed(3) : 'Infinity'}</span>
                    <span>{t('faceDebug.embeddingLength')}: {debugInfo.embeddingLength}</span>
                    <span>{t('faceDebug.lastDetection')}: {debugInfo.lastDetectionAt ? new Date(debugInfo.lastDetectionAt).toLocaleTimeString(locale === 'zh' ? 'zh-CN' : 'en-US') : t('faceDebug.noData')}</span>
                  </div>
                </div>
              ) : null}
            </div>
          </GridCell>
        ) : null}

        {detectionEnabled && humanML.current && PomoConfigs.faceRecognition.showFaceRecognitionCanvas ? (
          <GridCell span={12}>
            <canvas width="640px" height="480px" ref={canvasRef} />
          </GridCell>
        ) : null}
      </Grid>
    </>
  );
}

export default PeriodicFaceDetection;
