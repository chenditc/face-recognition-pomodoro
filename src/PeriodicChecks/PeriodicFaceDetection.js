import { useRef, useEffect, useState, useContext } from 'react';
import Webcam from "react-webcam";
//import * as faceapi from 'face-api.js';

import useInterval from 'use-interval'
import { css } from '@emotion/css'
import CheckSquareFilled from '@ant-design/icons/CheckSquareFilled';
import CloseSquareOutlined from '@ant-design/icons/CloseSquareOutlined';

import { PomoConfigsContext } from '../UserConfigs/PomoConfigsContext';

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

function GetFaceDetectionStatus(cameraSupported, cameraReady, faceDetected, loadedModelCount) {
  const cameraMessage = cameraSupported ? "Camera Ready:" : "Camera Supported";
  const cameraStatus = cameraSupported ? cameraReady : cameraSupported;
  return (
    <Grid>
      <GridCell desktop={4} span={2} phone={4}>
        <StatusMessage msg={cameraMessage} status={cameraStatus} />
      </GridCell>
      <GridCell desktop={4} span={2} phone={4}>
        <StatusMessage msg="Model loaded:" status={loadedModelCount > 1} />
      </GridCell>
      <GridCell desktop={4} span={2} phone={4}>
        <StatusMessage msg="Face Detected:" status={faceDetected} />
      </GridCell>
    </Grid>
  )
}

function PeriodicFaceDetection(props) {
  const PomoConfigs = useContext(PomoConfigsContext)
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [detected, setDetected] = useState(false)
  const [cameraSupported] = useState('mediaDevices' in navigator);
  const [cameraReady, setCameraReady] = useState(false);

  const onFaceDetectionResult = props.onFaceDetectionResult
  const detectionInterval = PomoConfigs.faceRecognition.detectionInterval;
  const scoreThreshold = PomoConfigs.faceRecognition.scoreThreshold;
  const enableDetection = PomoConfigs.enableDetection;
  const [detectionRunning, setDetectionRunning] = useState(false);
  const videoTrackRef = useRef(null);
  
  const humanML = useRef(null);

  const imageCaptureSupported = 'ImageCapture' in window;

  // Initialize ML
  useEffect(() => {
    if (!enableDetection) return;
    const humanMLConfig = {
      modelBasePath: `https://cdn.jsdelivr.net/npm/@vladmandic/human/models/`,
      wasmPath: "/face-recognition-pomodoro/models/",
      face: {
        enabled: true,
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
  }, [])

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
    if (!newCameraReady) return;

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
        setDetected(detectedFace);
        //console.log("Detection used ", ((new Date() - startTime).toString()), "ms");

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
  }, detectionInterval * 1000, true)

  function onUserMedia(stream) {
    console.log("New media stream", stream)
    videoTrackRef.current = stream.getVideoTracks()[0];
  }
  
  const videoConstraints = {
    width: { ideal: 640 },
    height: { ideal: 480 },
    facingMode: "user",
  }
  // Save bandwidth by reducing framerate
  if (enableDetection && !PomoConfigs.faceRecognition.showCameraPreview && navigator.mediaDevices.getSupportedConstraints) {
    const videoConstraintAbility = navigator.mediaDevices.getSupportedConstraints();
    if (videoConstraintAbility.frameRate) {
      videoConstraints["frameRate"] = { ideal: 2 }
    }
  }

  // If image capture is not supported, we will need to read from video element.
  // Video element won't update if it's not in view
  const hiddenCameraHeight = imageCaptureSupported ? "0px" : "1px";
  const cameraHeight = PomoConfigs.faceRecognition.showCameraPreview ? "100%" : hiddenCameraHeight
  const loadedModelCount = humanML.current ? Object.keys(humanML.current.models).filter((model) => (humanML.current.models[model] !== null)).length : 0;
  const currentProgress = cameraSupported * 0.1 + cameraReady * 0.4 + 0.5 * (loadedModelCount / 2);
  return (
    <>
      <Grid>
      
        <GridCell span={12}>
          <LinearProgress closed={currentProgress >= 1} progress={currentProgress} />
          {enableDetection && PomoConfigs.faceRecognition.showFaceRecognitionStatus ?
            GetFaceDetectionStatus(cameraSupported, cameraReady, detected, loadedModelCount) : <></>}
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
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={videoConstraints}
                    onUserMedia={onUserMedia}
                    onUserMediaError={(err) => console.log(err)}
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