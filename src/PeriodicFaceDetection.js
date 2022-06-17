import { useRef, useEffect, useState } from 'react';
import Webcam from "react-webcam";
import * as faceapi from 'face-api.js';
import useInterval from 'use-interval'
import { css } from '@emotion/css'
import CheckSquareFilled from '@ant-design/icons/CheckSquareFilled';
import CloseSquareOutlined from '@ant-design/icons/CloseSquareOutlined';
import SmileOutlined from '@ant-design/icons/SmileOutlined';
import CameraOutlined from '@ant-design/icons/CameraOutlined';

import { Popover } from 'antd';

import IconOverTextButton from './IconOverTextButton';
import { useToggle } from 'ahooks';

function StatusMessage(props) {
  return (
    <div>
      <p className={
        css`
        text-align: left;
        padding: 5px 10px;
        margin: 0 auto;
        `
      }> {props.msg + " "}
        {props.status ?
          <CheckSquareFilled style={{ color: "#1faa00" }} /> :
          <CloseSquareOutlined style={{ color: "#a30000" }} />
        }
      </p>
    </div>
  )
}

function GetFaceDetectionStatus(autoSessionEnabled, cameraSupported, faceDetected, modelsLoaded) {
  return (
    <div className={
      css`
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
    `
    }>
      <StatusMessage msg="Enable Auto Session:" status={autoSessionEnabled} />
      <StatusMessage msg="Camera Supported:" status={cameraSupported} />
      <StatusMessage msg="Face Detected:" status={faceDetected} />
      <StatusMessage msg="Model Loaded:" status={modelsLoaded} />
    </div>
  )
}

function PeriodicFaceDetection(props) {
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const webcamRef = useRef(null);
  const [detected, setDetected] = useState(false)
  const [cameraSupported] = useState('mediaDevices' in navigator);
  const onFaceDetectionResult = props.onFaceDetectionResult
  const detectionInterval = props.detectionInterval
  const modelInputSize = 128;
  const scoreThreshold = 0.25
  const [cameraHidden, opsCameraHidden] = useToggle(true);
  const [enableDetection, opsEnableDetection] = useToggle(false);

  // Detect face every n seconds
  useInterval(() => {
    if (!enableDetection) return;
    if (!modelsLoaded) return;

    async function detectUsingModel() {
      const tinyDetection = await faceapi.detectSingleFace(webcamRef.current.video, new faceapi.TinyFaceDetectorOptions(
        {
          inputSize: modelInputSize,
          scoreThreshold: scoreThreshold
        }
      ))
      if (tinyDetection !== undefined) {
        tinyDetection.name = "Tiny"
        return tinyDetection;
      }
      const ssdDetection = await faceapi.detectSingleFace(webcamRef.current.video, new faceapi.SsdMobilenetv1Options(
        {
          minConfidence: scoreThreshold
        }
      ))
      if (ssdDetection !== undefined) ssdDetection.name = "SSD"
      return ssdDetection
    }

    detectUsingModel().then(
      (detectionResult) => {
        onFaceDetectionResult(detectionResult);
        setDetected(detectionResult)
      }
    )

  }, detectionInterval * 1000, true)

  // Load ML models 
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = process.env.PUBLIC_URL + '/models';

      Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
        //        faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL), // For face landmark
        //        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)  // For face recognition
      ]).then(() => {
        setModelsLoaded(true)
      });
    }
    loadModels();
  }, []);

  const cameraHeight = cameraHidden ? "1px" : "100%"

  return (
    <>
      <Popover
        content={GetFaceDetectionStatus(enableDetection, cameraSupported, detected, modelsLoaded)}
        title="Face Detection Status" trigger="hover">
        <IconOverTextButton
          onClick={opsEnableDetection.toggle}
          icon={SmileOutlined}
          text={enableDetection ? "Disable Auto Session" : "Enable Auto Session"} />
        <span />
      </Popover>

      {enableDetection ?
        (<><IconOverTextButton
          icon={CameraOutlined}
          onClick={opsCameraHidden.toggle}
          text={cameraHidden ? "Show Camera" : "Hide Camera"} />
          <div className={css`
      display: block; 
      width:100%;
      `}>
            <div className={
              css`
          height: ${cameraHeight};
          width: ${cameraHeight};
          overflow: hidden;
          margin: 10px auto;
          display: flex;
          justify-content: center;
        `
            }>
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{ facingMode: "user" }}
              />
            </div>
          </div></>) : <></>}

    </>
  )
}

export default PeriodicFaceDetection