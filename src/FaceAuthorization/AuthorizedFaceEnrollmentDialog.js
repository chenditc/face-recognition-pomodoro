import { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import useInterval from 'use-interval';
import { css } from '@emotion/css';

import { Button as AntButton, Modal } from 'antd';
import { Button } from '@rmwc/button';
import '@rmwc/button/styles';
import { LinearProgress } from '@rmwc/linear-progress';
import '@rmwc/linear-progress/styles';
import { Typography } from '@rmwc/typography';
import '@rmwc/typography/styles';

import { useI18n } from '../i18n';
import {
  AUTHORIZED_FACE_PROFILE_VERSION,
  REQUIRED_AUTH_FACE_SAMPLES,
  getFaceThumbnail,
  normalizeDescriptor,
} from './authorizedFaceUtils';

const enrollmentDetectionIntervalMs = 700;
const sampleCaptureCooldownMs = 1200;

function getEnrollmentHumanConfig() {
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
    debug: false,
  };
}

function getFaceBox(face) {
  if (!face?.box) return null;
  const box = face.box;
  const width = box.width || Math.abs((box[2] || 0) - (box[0] || 0));
  const height = box.height || Math.abs((box[3] || 0) - (box[1] || 0));
  const x = box.x ?? box.left ?? box[0] ?? 0;
  const y = box.y ?? box.top ?? box[1] ?? 0;
  return { x, y, width, height };
}

function AuthorizedFaceEnrollmentDialog(props) {
  const { t } = useI18n();
  const webcamRef = useRef(null);
  const humanML = useRef(null);
  const sampleDescriptorsRef = useRef([]);
  const thumbnailRef = useRef(null);
  const lastSampleAtRef = useRef(0);
  const [webcamKey, setWebcamKey] = useState(0);

  const [step, setStep] = useState('capture');
  const [cameraReady, setCameraReady] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const [detectionRunning, setDetectionRunning] = useState(false);
  const [sampleDescriptors, setSampleDescriptors] = useState([]);
  const [thumbnail, setThumbnail] = useState(null);
  const [completedProfile, setCompletedProfile] = useState(null);
  const [guidanceMessage, setGuidanceMessage] = useState({ key: 'enrollment.guidance.alignFace' });

  const scoreThreshold = props.scoreThreshold || 0.65;

  function resetCaptureState(nextStep = 'capture') {
    sampleDescriptorsRef.current = [];
    thumbnailRef.current = null;
    lastSampleAtRef.current = 0;
    setStep(nextStep);
    setCameraReady(false);
    setSampleDescriptors([]);
    setThumbnail(null);
    setCompletedProfile(null);
    setGuidanceMessage({ key: 'enrollment.guidance.alignFace' });
    setWebcamKey((currentKey) => currentKey + 1);
  }

  useEffect(() => {
    if (!props.open) return undefined;

    resetCaptureState('capture');
    setModelReady(Boolean(humanML.current));

    if (humanML.current) return undefined;

    let cancelled = false;
    const humanConfig = getEnrollmentHumanConfig();

    import('@vladmandic/human').then((HumanModule) => {
      if (cancelled) return;
      const human = new HumanModule.Human(humanConfig);
      humanML.current = human;
      human.init(humanConfig).then(() => {
        if (cancelled) return;
        human.load(humanConfig);
        setModelReady(true);
      });
    });

    return () => {
      cancelled = true;
    };
  }, [props.open]);

  useEffect(() => {
    if (!props.open || step !== 'capture') return undefined;
    return () => {
      setCameraReady(false);
    };
  }, [props.open, step]);

  useInterval(() => {
    if (!props.open || step !== 'capture') return;
    if (completedProfile || detectionRunning) return;
    if (!cameraReady || !modelReady || !humanML.current) return;

    const videoElement = webcamRef.current?.video;
    if (!videoElement || videoElement.readyState < 2) return;

    async function captureFaceDescriptor() {
      try {
        setDetectionRunning(true);
        const detectionResult = await humanML.current.detect(videoElement);
        const visibleFaces = detectionResult.face.filter((face) => face.score > scoreThreshold);

        if (visibleFaces.length === 0) {
          setGuidanceMessage({ key: 'enrollment.guidance.noFace' });
          return;
        }

        if (visibleFaces.length > 1) {
          setGuidanceMessage({ key: 'enrollment.guidance.multipleFaces' });
          return;
        }

        const face = visibleFaces[0];
        const faceBox = getFaceBox(face);
        const frameWidth = videoElement.videoWidth || 640;
        const frameHeight = videoElement.videoHeight || 480;

        if (!faceBox || faceBox.width < frameWidth * 0.22 || faceBox.height < frameHeight * 0.22) {
          setGuidanceMessage({ key: 'enrollment.guidance.moveCloser' });
          return;
        }

        const normalizedEmbedding = normalizeDescriptor(face.embedding);
        if (normalizedEmbedding.length === 0) {
          setGuidanceMessage({ key: 'enrollment.guidance.holdStill' });
          return;
        }

        const now = Date.now();
        if (now - lastSampleAtRef.current < sampleCaptureCooldownMs) {
          setGuidanceMessage({ key: 'enrollment.guidance.holdStill' });
          return;
        }

        lastSampleAtRef.current = now;

        const nextDescriptors = [...sampleDescriptorsRef.current, normalizedEmbedding];
        sampleDescriptorsRef.current = nextDescriptors;
        setSampleDescriptors(nextDescriptors);

        const nextThumbnail = thumbnailRef.current || getFaceThumbnail(webcamRef);
        if (nextThumbnail && !thumbnailRef.current) {
          thumbnailRef.current = nextThumbnail;
          setThumbnail(nextThumbnail);
        }

        setGuidanceMessage({
          key: 'enrollment.guidance.sampleCaptured',
          values: { count: nextDescriptors.length, total: REQUIRED_AUTH_FACE_SAMPLES },
        });

        if (nextDescriptors.length >= REQUIRED_AUTH_FACE_SAMPLES) {
          const finishedProfile = {
            version: AUTHORIZED_FACE_PROFILE_VERSION,
            createdAt: new Date().toJSON(),
            updatedAt: new Date().toJSON(),
            thumbnail: nextThumbnail || null,
            descriptors: nextDescriptors,
          };
          setCompletedProfile(finishedProfile);
          setGuidanceMessage({ key: 'enrollment.guidance.ready' });
        }
      }
      finally {
        setDetectionRunning(false);
      }
    }

    captureFaceDescriptor();
  }, enrollmentDetectionIntervalMs, true);

  function handleRetake() {
    resetCaptureState('capture');
    setModelReady(Boolean(humanML.current));
  }

  function handleDone() {
    if (!completedProfile) return;
    props.onComplete(completedProfile);
  }

  const captureProgress = sampleDescriptors.length / REQUIRED_AUTH_FACE_SAMPLES;
  return (
    <Modal
      zIndex={1010}
      visible={props.open}
      title={t('enrollment.title')}
      onCancel={props.onClose}
      maskClosable={false}
      destroyOnClose
      width="80vw"
      style={{ top: 24 }}
      bodyStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
      footer={completedProfile ? [
        <AntButton key="retake" onClick={handleRetake}>
          {t('common.retry')}
        </AntButton>,
        <AntButton key="done" type="primary" onClick={handleDone}>
          {t('common.done')}
        </AntButton>,
      ] : [
        <AntButton key="cancel" onClick={props.onClose}>
          {t('common.cancel')}
        </AntButton>,
      ]}
    >
        <div className={css`display: grid; gap: 16px;`}>
          <div className={css`display: grid; gap: 6px;`}>
            <Typography use="headline6">
              {completedProfile ? t('enrollment.successTitle') : t('enrollment.captureTitle')}
            </Typography>
            <Typography use="body2" tag="p">
              {completedProfile ? t('enrollment.successBody') : t('enrollment.captureBody')}
            </Typography>
          </div>
          <div className={css`
            display: grid;
            gap: 10px;
            padding: 16px;
            border-radius: 16px;
            background: linear-gradient(135deg, rgba(191, 54, 12, 0.08), rgba(97, 97, 97, 0.06));
            border: 1px solid rgba(191, 54, 12, 0.12);
          `}>
            <Typography use="subtitle2">{t('enrollment.privacyTitle')}</Typography>
            <Typography use="body2" tag="p">{t('enrollment.privacyBody')}</Typography>
            <Typography use="body2" tag="p">{t('enrollment.captureTips')}</Typography>
          </div>
          <div className={css`
            position: relative;
            overflow: hidden;
            border-radius: 24px;
            background: #111;
            min-height: 360px;
            border: 1px solid rgba(255, 255, 255, 0.08);
          `}>
            <Webcam
              key={webcamKey}
              audio={false}
              ref={webcamRef}
              mirrored
              screenshotFormat="image/jpeg"
              onUserMedia={() => setCameraReady(true)}
              onUserMediaError={() => setCameraReady(false)}
              videoConstraints={{
                width: { ideal: 640 },
                height: { ideal: 480 },
                facingMode: 'user',
              }}
              className={css`
                width: 100%;
                height: 100%;
                min-height: 360px;
                object-fit: cover;
              `}
            />
            <div className={css`
              position: absolute;
              inset: 0;
              pointer-events: none;
              display: grid;
              place-items: center;
              background:
                linear-gradient(rgba(0, 0, 0, 0.18), rgba(0, 0, 0, 0.12)),
                radial-gradient(circle at center, transparent 34%, rgba(0, 0, 0, 0.22) 35%);
            `}>
              <div className={css`
                width: min(58%, 280px);
                aspect-ratio: 0.8;
                border: 2px solid rgba(255, 255, 255, 0.9);
                border-radius: 45% 45% 42% 42%;
                box-shadow: 0 0 0 999px rgba(0, 0, 0, 0.12);
              `} />
            </div>
            <div className={css`
              position: absolute;
              left: 16px;
              right: 16px;
              bottom: 16px;
              display: grid;
              gap: 10px;
              padding: 14px 16px;
              border-radius: 16px;
              background: rgba(10, 10, 10, 0.56);
              color: white;
              backdrop-filter: blur(10px);
            `}>
              <LinearProgress progress={captureProgress} closed={captureProgress >= 1} />
              <div className={css`
                display: flex;
                justify-content: space-between;
                gap: 12px;
                align-items: center;
                flex-wrap: wrap;
              `}>
                <Typography use="body2" tag="div">
                  {modelReady && cameraReady
                    ? t(guidanceMessage.key, guidanceMessage.values)
                    : t('enrollment.guidance.loading')}
                </Typography>
                <Typography use="caption" tag="div">
                  {t('enrollment.sampleCount', {
                    count: sampleDescriptors.length,
                    total: REQUIRED_AUTH_FACE_SAMPLES,
                  })}
                </Typography>
              </div>
              <div className={css`display: flex; gap: 10px; align-items: center;`}>
                {Array.from({ length: REQUIRED_AUTH_FACE_SAMPLES }).map((_, index) => (
                  <span
                    key={index}
                    className={css`
                      width: 10px;
                      height: 10px;
                      border-radius: 999px;
                      background: ${index < sampleDescriptors.length ? '#ffcc80' : 'rgba(255, 255, 255, 0.22)'};
                      box-shadow: ${index < sampleDescriptors.length ? '0 0 16px rgba(255, 204, 128, 0.65)' : 'none'};
                    `}
                  />
                ))}
              </div>
            </div>
          </div>
          {thumbnail ? (
            <div className={css`
              display: flex;
              align-items: center;
              gap: 12px;
              padding: 12px 16px;
              border-radius: 16px;
              background: rgba(0, 0, 0, 0.03);
            `}>
              <img
                src={thumbnail}
                alt={t('config.authorizedFace.previewAlt')}
                className={css`
                  width: 56px;
                  height: 56px;
                  border-radius: 999px;
                  object-fit: cover;
                  border: 2px solid rgba(191, 54, 12, 0.18);
                `}
              />
              <div className={css`display: grid; gap: 2px;`}>
                <Typography use="subtitle2">{t('enrollment.previewTitle')}</Typography>
                <Typography use="body2" tag="p">{t('enrollment.previewBody')}</Typography>
              </div>
            </div>
          ) : null}
          {!completedProfile ? (
            <div className={css`display: flex; justify-content: flex-end;`}>
              <Button
                outlined
                onClick={() => resetCaptureState('capture')}
                label={t('enrollment.retryCapture')}
              />
            </div>
          ) : null}
        </div>
    </Modal>
  );
}

export default AuthorizedFaceEnrollmentDialog;
