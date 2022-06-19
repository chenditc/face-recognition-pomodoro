import { useRef, useEffect, useState, useContext } from 'react';
import Webcam from "react-webcam";
//import * as faceapi from 'face-api.js';
import Human from '@vladmandic/human'

import useInterval from 'use-interval'
import { css } from '@emotion/css'
import CheckSquareFilled from '@ant-design/icons/CheckSquareFilled';
import CloseSquareOutlined from '@ant-design/icons/CloseSquareOutlined';

import { PomoConfigsContext } from './PomoConfigsContext';

import { setWasmPaths } from '@tensorflow/tfjs-backend-wasm';
import wasmPath from '../node_modules/@tensorflow/tfjs-backend-wasm/dist/tfjs-backend-wasm.wasm';


import { Typography } from '@rmwc/typography';
import '@rmwc/typography/styles';
import { Grid, GridRow, GridCell } from '@rmwc/grid'
import '@rmwc/grid/styles';

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

function GetFaceDetectionStatus(cameraSupported, cameraReady, faceDetected, humanML) {
  const modelLoaded = humanML.current ? humanML.current.performance.loadModels > 0 : false;
  const cameraMessage = cameraSupported ? "Camera Ready:" : "Camera Supported";
  const cameraStatus = cameraSupported ? cameraReady : cameraSupported;
  return (
    <Grid>
      <GridCell span={4}>
        <StatusMessage msg={cameraMessage} status={cameraStatus} />
      </GridCell>
      <GridCell span={4}>
        <StatusMessage msg={`Model loaded:`} status={modelLoaded} />
      </GridCell>
      <GridCell span={4}>
        <StatusMessage msg="Face Detected:" status={faceDetected} />
      </GridCell>
    </Grid>
  )
}

function PeriodicFaceDetection(props) {
  const PomoConfigs = useContext(PomoConfigsContext)
  const webcamRef = useRef(null);
  const [detected, setDetected] = useState(false)
  const [cameraSupported] = useState('mediaDevices' in navigator);

  const onFaceDetectionResult = props.onFaceDetectionResult
  const detectionInterval = PomoConfigs.faceRecognition.detectionInterval;
  const scoreThreshold = PomoConfigs.faceRecognition.scoreThreshold;
  const enableDetection = PomoConfigs.enableDetection;
  const [detectionRunning, setDetectionRunning] = useState(false);
  const humanML = useRef(null);

  // Initialize ML
  useEffect(() => {
    setWasmPaths(wasmPath)
    const humanMLConfig = {
      modelBasePath: `https://cdn.jsdelivr.net/npm/@vladmandic/human/models/`,
      wasmPath: 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@3.9.0/dist/',
      face: {
        enabled: true,
        emotion: { enabled: false },
        antispoof: { enabled: false },
        liveness: { enabled: false },
        mesh: { enabled: false },
        attention: { enabled: false },
        iris: { enabled: false },
        description: { enabled: false },
      },
      body: { enabled: false },
      hand: { enabled: false },
      object: { enabled: false },
      gesture: { enabled: false }
    }
    humanML.current = new Human(humanMLConfig);
    console.log("Human init:", humanML);
  }, [])

  // Detect face every n seconds
  useInterval(() => {
    if (!enableDetection) return;
    if (detectionRunning) return;
    if (!humanML.current) return;

    async function detectUsingModel() {
      try {
        setDetectionRunning(true);
        const inputVideo = webcamRef.current.video;
        const detectionResult = await humanML.current.detect(inputVideo)
        return detectionResult.face.filter((x) => x.score > scoreThreshold).at(-1)
      }
      finally {
        setDetectionRunning(false);
      }
    }

    detectUsingModel().then(
      (detectionResult) => {
        if (detectionResult) console.log(detectionResult.score)
        onFaceDetectionResult(detectionResult);
        setDetected(detectionResult);
      }
    )

  }, detectionInterval * 1000, true)

  const videoConstraintAbility = navigator.mediaDevices.getSupportedConstraints();
  const videoConstraints = {
    facingMode: "user",
  }
  // Save bandwidth by reducing framerate
  if (videoConstraintAbility.frameRate && PomoConfigs.cameraHidden) {
    videoConstraints["frameRate"] = { ideal: 5 }
  }

  const cameraHeight = PomoConfigs.cameraHidden ? "1px" : "100%"
  const cameraReady = webcamRef.current ? (webcamRef.current.video.readyState !== undefined && webcamRef.current.video.readyState > 2) : false;
  return (
    <>

      {enableDetection && PomoConfigs.faceRecognition.showFaceRecognitionStatus ? GetFaceDetectionStatus(cameraSupported, cameraReady, detected, humanML) : <></>}

      {humanML ?
        (
          <Grid>
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
                />
              </div>
            </GridCell>
          </Grid>
        ) : <></>}

    </>
  )
}

export default PeriodicFaceDetection