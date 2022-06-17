import { useRef, useEffect, useState } from 'react';
import Webcam from "react-webcam";
import * as faceapi from 'face-api.js';
import useInterval from 'use-interval'
import { css } from '@emotion/css'
import CheckSquareFilled from '@ant-design/icons/CheckSquareFilled';
import CloseSquareOutlined from '@ant-design/icons/CloseSquareOutlined';

import { Button } from 'antd';
import { Collapse } from 'react-collapse';


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

function PeriodicFaceDetection(props) {
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const webcamRef = useRef(null);
  const [detected, setDetected] = useState(false)
  const [cameraSupported] = useState('mediaDevices' in navigator);
  const onFaceDetectionResult = props.onFaceDetectionResult
  const detectionInterval = props.detectionInterval
  const modelInputSize = 128;
  const scoreThreshold = 0.25
  const [cameraHidden, setCameraHidden] = useState(null);
  const [statusHidden, setStatusHidden] = useState(true);

  useInterval(() => {
    if (!modelsLoaded) {
      return
    }

    async function detectUsingModel() {
      const tinyDetection = await faceapi.detectSingleFace(webcamRef.current.video, new faceapi.TinyFaceDetectorOptions(
        {
          inputSize: modelInputSize,
          scoreThreshold: scoreThreshold
        }
      ))
      if (tinyDetection !== undefined) {
        console.log("Tiny model detection success")
        return tinyDetection;
      }
      const ssdDetection = await faceapi.detectSingleFace(webcamRef.current.video, new faceapi.SsdMobilenetv1Options(
        {
          minConfidence: scoreThreshold
        }
      ))
      if (ssdDetection !== undefined) {
        console.log("SSD model detection success")
      }
      else {
        console.log("All model failed")
      }
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
    <div className={
      css`
        display: flex;
        flex-direction: column;
        margin-top: 10px;
      `
    }>
      <div className={
        css`
          margin-bottom: 10px
        `
      }>
        <Button block onClick={() => { setStatusHidden(statusHidden => !statusHidden) }}>
          {
            statusHidden ? "Show detail status" : "Hide detail status"
          }
        </Button>
        <Collapse isOpened={!statusHidden}>
          <div className={
            css`
              display: flex;
              flex-wrap: wrap;
              justify-content: space-between;
            `
          }>
            <StatusMessage msg="Camera Supported:" status={cameraSupported} />
            <StatusMessage msg="Face Detected:" status={detected} />
            <StatusMessage msg="Model Loaded:" status={modelsLoaded} />
          </div>
        </Collapse>
      </div>
      <Button block onClick={() => { setCameraHidden(cameraHidden => !cameraHidden) }}>
          {
            cameraHidden ? "Show Camera" : "Hide Camera"
          }
        </Button>
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
    </div>
  )
}

export default PeriodicFaceDetection