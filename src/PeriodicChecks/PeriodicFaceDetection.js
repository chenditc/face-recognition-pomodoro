import { useRef, useEffect, useState, useContext } from 'react';
import Webcam from "react-webcam";
//import * as faceapi from 'face-api.js';

import useInterval from 'use-interval'
import { css } from '@emotion/css'
import CheckSquareFilled from '@ant-design/icons/CheckSquareFilled';
import CloseSquareOutlined from '@ant-design/icons/CloseSquareOutlined';

import { PomoConfigsContext } from '../UserConfigs/PomoConfigsContext';
import { useI18n } from '../i18n';

import { Typography } from '@rmwc/typography';
import '@rmwc/typography/styles';
import { Grid, GridCell } from '@rmwc/grid'
import '@rmwc/grid/styles';
import { LinearProgress } from '@rmwc/linear-progress';
import '@rmwc/linear-progress/styles';

import "image-capture";

function StatusMessage(props) {
  return (
    <Typography use="body2" tag="div" className={css`text-align: center`}>
      {props.msg} {props.status ?
        <CheckSquareFilled style={{ color: "#1faa00" }} /> :
        <CloseSquareOutlined style={{ color: "#a30000" }} />
      }
    </Typography>
  )
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
  )
}

function PeriodicFaceDetection(props) {
  const PomoConfigs = useContext(PomoConfigsContext)
  const { t } = useI18n();
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [detected, setDetected] = useState(undefined)
  const [cameraSupported] = useState('mediaDevices' in navigator);
  const [cameraReady, setCameraReady] = useState(false);
  const [webcamKey, setWebcamKey] = useState(0);

  const onFaceDetectionResult = props.onFaceDetectionResult
  const minDetectionInterval = PomoConfigs.faceRecognition.minDetectionInterval;
  const maxDetectionInterval = PomoConfigs.faceRecognition.maxDetectionInterval;
  const missingFaceRetryInterval = PomoConfigs.faceRecognition.missingFaceRetryIntervalSeconds;
  const [nextDetectionInterval, setNextDetectionInterval] = useState(minDetectionInterval);
  const scoreThreshold = PomoConfigs.faceRecognition.scoreThreshold;
  const enableDetection = PomoConfigs.enableDetection;
  const [detectionRunning, setDetectionRunning] = useState(false);
  const [lastDetectionTime, setLastDetectionTime] = useState(new Date());
  const videoTrackRef = useRef(null);
  const lastReconnectAttemptRef = useRef(0);
  const hasEverConnectedRef = useRef(false);
  const requestWebcamReconnectRef = useRef(() => {});
  
  const humanML = useRef(null);

  const imageCaptureSupported = 'ImageCapture' in window;
  const cameraReconnectCooldownMs = 3000;

  const showFaceRecognitionStatus = enableDetection ? (PomoConfigs.faceRecognition.showFaceRecognitionStatus || detected === undefined) : false;
  const showCameraPreview = enableDetection ? (PomoConfigs.faceRecognition.showCameraPreview || detected === undefined) : false;

  function requestWebcamReconnect(reason, force = false) {
    if (!enableDetection) return;

    const now = Date.now();
    if (!force && now - lastReconnectAttemptRef.current < cameraReconnectCooldownMs) {
      return;
    }

    lastReconnectAttemptRef.current = now;
    console.log(new Date(), "Reconnect webcam because", reason);
    videoTrackRef.current = null;
    setCameraReady(false);
    setDetected(undefined);
    setNextDetectionInterval(minDetectionInterval);
    setLastDetectionTime(new Date(0));
    setWebcamKey((currentKey) => currentKey + 1);
  }

  requestWebcamReconnectRef.current = requestWebcamReconnect;

  // Initialize ML
  useEffect(() => {
    if (!enableDetection) return;
    const humanMLConfig = {
      modelBasePath: `https://cdn.jsdelivr.net/npm/@vladmandic/human/models/`,
      wasmPath: "/face-recognition-pomodoro/models/",
      face: {
        enabled: true,
        detector: {
          modelPath: 'blazeface-back.json',
          rotation: true,
        },
        emotion: { enabled: false },
        antispoof: { enabled: false },
        liveness: { enabled: false },
        mesh: { enabled: true },
        attention: { enabled: false },
        iris: { enabled: false },
        description: { enabled: false },
      },
      body: { enabled: false },
      hand: { enabled: false },
      object: { enabled: false },
      gesture: { enabled: false },
      debug: true
    }
    import('@vladmandic/human').then(
      (HumanModule) => {
        humanML.current = new HumanModule.Human(humanMLConfig);
        humanML.current.init(humanMLConfig).then(() => {
          humanML.current.load(humanMLConfig);
          console.log("Human init", humanML.current);
        })
      }
    )
  }, [enableDetection])

  useEffect(() => {
    if (!enableDetection || !navigator.mediaDevices?.addEventListener) return;

    function onDeviceChange() {
      const currentTrack = videoTrackRef.current;
      if (!currentTrack || currentTrack.readyState !== "live") {
        requestWebcamReconnectRef.current("devicechange", true);
      }
    }

    navigator.mediaDevices.addEventListener("devicechange", onDeviceChange);
    return () => navigator.mediaDevices.removeEventListener("devicechange", onDeviceChange);
  }, [enableDetection, minDetectionInterval])

  // Detect face every n seconds
  useInterval(() => {
    if (!enableDetection) return;
    if (detectionRunning) return;
    if (!humanML.current) return;
    const newCameraReady = (videoTrackRef.current 
      && videoTrackRef.current.readyState === "live" 
      && !videoTrackRef.current.muted 
      && videoTrackRef.current.enabled);

    if (newCameraReady !== cameraReady) {
      setCameraReady(newCameraReady);
    }
    if (!newCameraReady) {
      if (hasEverConnectedRef.current) {
        requestWebcamReconnect("camera-not-ready");
      }
      return;
    }

    // No need to detect for now.
    const nextDetectionTime  = new Date(lastDetectionTime).setSeconds(lastDetectionTime.getSeconds() + nextDetectionInterval);
    if (nextDetectionTime > new Date()) return;
    setLastDetectionTime(new Date())

    async function detectUsingModel() {

      try {
        setDetectionRunning(true);

        const inputVideo = webcamRef.current.video;
        var input = inputVideo;
        if (imageCaptureSupported) { 
          const capture = new ImageCapture(videoTrackRef.current)
          input = await capture.grabFrame();
        }

        const detectionResult = await humanML.current.detect(input)
        const detectedFace = detectionResult.face.filter((x) => x.score > scoreThreshold).at(-1)
        onFaceDetectionResult(detectedFace);

        const hasDetectedFace = detectedFace !== undefined;
        const hadDetectedFace = detected !== undefined;
        if (!hasDetectedFace) {
          // Recover faster when the face is temporarily lost.
          setNextDetectionInterval(missingFaceRetryInterval);
        }
        else if (hasDetectedFace === hadDetectedFace) {
          setNextDetectionInterval(Math.min(nextDetectionInterval + 5, maxDetectionInterval));
        }
        else {
          setNextDetectionInterval(minDetectionInterval);
        }

        setDetected(detectedFace);
        console.log(new Date(), "Deteced face", detectedFace)

        if (PomoConfigs.faceRecognition.showFaceRecognitionCanvas) {
          humanML.current.draw.canvas(input, canvasRef.current)
          humanML.current.draw.all(canvasRef.current, detectionResult);
        }
      }
      finally {
        setDetectionRunning(false);
      }
    }

    detectUsingModel()
  }, 1000, true)

  function onUserMedia(stream) {
    console.log("New media stream", stream)
    const nextTrack = stream.getVideoTracks()[0];
    if (!nextTrack) {
      requestWebcamReconnect("missing-video-track", true);
      return;
    }

    hasEverConnectedRef.current = true;
    nextTrack.onended = () => {
      requestWebcamReconnect("track-ended", true);
    };

    videoTrackRef.current = nextTrack;
    setCameraReady(true);
    setDetected(undefined);
    setNextDetectionInterval(minDetectionInterval);
    setLastDetectionTime(new Date(0));
  }

  function onUserMediaError(err) {
    console.log(err)
    if (hasEverConnectedRef.current) {
      requestWebcamReconnect("on-user-media-error");
    }
  }
  
  const videoConstraints = {
    width: { ideal: 640 },
    height: { ideal: 480 },
  }
  // Save bandwidth by reducing framerate
  if (navigator.mediaDevices.getSupportedConstraints) {
    const videoConstraintAbility = navigator.mediaDevices.getSupportedConstraints();
    if (videoConstraintAbility.frameRate) {
      videoConstraints["frameRate"] = { min: 0, ideal: 1, max: 2 }
    }
  }

  // If image capture is not supported, we will need to read from video element.
  // Video element won't update if it's not in view

  const hiddenCameraHeight = imageCaptureSupported ? "0px" : "1px";
  const cameraHeight = showCameraPreview ? "100%" : hiddenCameraHeight
  const loadedModelCount = humanML.current ? Object.keys(humanML.current.models).filter((model) => (humanML.current.models[model] !== null)).length : 0;
  const currentProgress = cameraSupported * 0.1 + cameraReady * 0.4 + 0.5 * (loadedModelCount / 2);

  return (
    <>
      <Grid>
      
        <GridCell span={12}>
          <LinearProgress closed={currentProgress >= 1} progress={currentProgress} />
          { showFaceRecognitionStatus  ?
            GetFaceDetectionStatus(cameraSupported, cameraReady, detected, loadedModelCount, {
              cameraReady: t('faceStatus.cameraReady'),
              cameraSupported: t('faceStatus.cameraSupported'),
              modelLoaded: t('faceStatus.modelLoaded'),
              faceDetected: t('faceStatus.faceDetected'),
            }) : <></>}
        </GridCell>

        {
          enableDetection ?
            (
              <GridCell span={12}>
                <div className={
                  css`
              height: ${cameraHeight};
              width: ${cameraHeight};
              overflow: hidden;
            `
                }>
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
              </GridCell>
            ) : <></>
        }

        {
          enableDetection && humanML && PomoConfigs.faceRecognition.showFaceRecognitionCanvas ?
            <GridCell span={12}>
              <canvas width="640px" height="480px" ref={canvasRef} />
            </GridCell> : <></>
        }
      </Grid>
    </>
  )
}

export default PeriodicFaceDetection
