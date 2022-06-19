import { useRef, useEffect, useState, useContext } from 'react';
import Webcam from "react-webcam";
import * as faceapi from 'face-api.js';
import useInterval from 'use-interval'
import { css } from '@emotion/css'
import CheckSquareFilled from '@ant-design/icons/CheckSquareFilled';
import CloseSquareOutlined from '@ant-design/icons/CloseSquareOutlined';

import { PomoConfigsContext } from './PomoConfigsContext';

import * as tf from '@tensorflow/tfjs-core';

import { Typography } from '@rmwc/typography';
import '@rmwc/typography/styles';
import { Grid, GridRow, GridCell } from '@rmwc/grid'
import '@rmwc/grid/styles';

function StatusMessage(props) {
  return (
    <Typography use="body2" tag="div">
      {props.msg} {props.status ?
        <CheckSquareFilled style={{ color: "#1faa00" }} /> :
        <CloseSquareOutlined style={{ color: "#a30000" }} />
      }
    </Typography>
  )
}

function GetFaceDetectionStatus(cameraSupported, faceDetected, webGLSupported) {
  return (
    <Grid>
      <GridCell span={4}>
        <StatusMessage msg="Camera Supported:" status={cameraSupported} />
      </GridCell>
      <GridCell span={4}>
        <StatusMessage msg="WebGL Supported:" status={webGLSupported} />
      </GridCell>
      <GridCell span={4}>
        <StatusMessage msg="Face Detected:" status={faceDetected} />
      </GridCell>
    </Grid>
  )
}

function PeriodicFaceDetection(props) {
  const PomoConfigs = useContext(PomoConfigsContext)
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const webcamRef = useRef(null);
  const [detected, setDetected] = useState(false)
  const [cameraSupported] = useState('mediaDevices' in navigator);
  const [webGLSupported, setWebGLSupported] = useState(false)
  const [tfInitialized, setTfInitialized] = useState(false);

  const onFaceDetectionResult = props.onFaceDetectionResult
  const detectionInterval = PomoConfigs.faceRecognition.detectionInterval;
  const modelInputSize = 128; //PomoConfigs.faceRecognition.modelInputSize;
  const scoreThreshold = PomoConfigs.faceRecognition.scoreThreshold;
  const enableDetection = PomoConfigs.enableDetection;
  const [detectionRunning, setDetectionRunning] = useState(false);

  // Initialize TF and check web gl
  useEffect(() => {
    tf.ready().then(
      () => {
        const backendStatus = tf.backend();
        console.log(backendStatus)
        var hasWebGL = false;
        if (backendStatus.texData) {
          hasWebGL = backendStatus.texData.dataMover.ENV.flags.HAS_WEBGL;

        }
        else {
          hasWebGL = backendStatus.data.dataMover.ENV.flags.HAS_WEBGL;
        }
        console.log("TF backend", tf.getBackend())
        setWebGLSupported(hasWebGL);
        setTfInitialized(true);
      }
    )
  }, [])

  // Load ML models 
  useEffect(() => {
    if (!tfInitialized) return;

    const loadModels = async () => {
      const MODEL_URL = process.env.PUBLIC_URL + '/models';

      const models = [
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        //        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
        //        faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL), // For face landmark
        //        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)  // For face recognition
      ]
      if (webGLSupported) {
        models.push(faceapi.nets.mtcnn.loadFromUri(MODEL_URL)
        )
      }
      Promise.all(models).then(() => {
        setModelsLoaded(true)
      });
    }
    loadModels();
  }, [webGLSupported, tfInitialized]);

  // Detect face every n seconds
  useInterval(() => {
    if (!enableDetection) return;
    if (!modelsLoaded) return;
    if (detectionRunning) return;

    async function detectUsingModel() {
      setDetectionRunning(true);
      try {
        const tinyDetection = await faceapi.detectSingleFace(webcamRef.current.video, 
          new faceapi.TinyFaceDetectorOptions({ scoreThreshold: scoreThreshold }))
        if (tinyDetection !== undefined) {
          tinyDetection.name = "Tiny"
          return tinyDetection;
        }
  
        if (!webGLSupported) return;
  
        const mtcnnDetection = await faceapi.detectSingleFace(webcamRef.current.video, new faceapi.MtcnnOptions(
          {
            minFaceSize: 20
          }
        ))
        if (mtcnnDetection !== undefined) {
          mtcnnDetection.name = "MTCNN"
          return mtcnnDetection
        }
      }
      finally {
        setDetectionRunning(false);
      }
    }

    detectUsingModel().then(
      (detectionResult) => {
        onFaceDetectionResult(detectionResult);
        setDetected(detectionResult)
      }
    )

  }, detectionInterval * 1000, true)

  const videoConstraintAbility = navigator.mediaDevices.getSupportedConstraints();
  // Use 512 since Tiny model use 512 as default input, save some CPU 
  const videoConstraints = {
    width: { ideal: 512 },
    facingMode: "user",
  }
  // Save bandwidth by reducing framerate
  if (videoConstraintAbility.frameRate && PomoConfigs.cameraHidden) {
    videoConstraints["frameRate"] = { ideal: 1 }
  }

  const cameraHeight = PomoConfigs.cameraHidden ? "1px" : "100%"
  return (
    <>

      {enableDetection && PomoConfigs.faceRecognition.showFaceRecognitionStatus ? GetFaceDetectionStatus(cameraSupported, detected, webGLSupported) : <></>}

      {tfInitialized ?
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