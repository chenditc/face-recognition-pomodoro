import { useRef, useEffect, useState } from 'react';
import Webcam from "react-webcam";
import * as faceapi from 'face-api.js';
import useInterval from 'use-interval'


function PeriodicFaceDetection(props) {
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const webcamRef = useRef(null);
  const [detectedFace, setDetectedFace] = useState(null);
  const detectionInterval = props.detectionInterval
  const [cameraSupported] = useState('mediaDevices' in navigator);
  const onFaceDetectionResult = props.onFaceDetectionResult

  useInterval(() => {
    if (!modelsLoaded) {
      return
    }
    // Recognize face every X seconds
    faceapi.detectSingleFace(webcamRef.current.video, new faceapi.TinyFaceDetectorOptions())
      .then((detection) => {
        onFaceDetectionResult(detection);
        setDetectedFace(detection);
      }, () => {
        console.log("detection failed")
        setDetectedFace(null);
      });
  }, detectionInterval * 1000, true)

  // Load ML models 
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = process.env.PUBLIC_URL + '/models';

      Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      ]).then(() => {
        setModelsLoaded(true)
      });
    }
    loadModels();
  }, []);

  return (
    <div>
      <p> Camera Supported: {cameraSupported.toString()} </p>
      <p> {detectedFace ? `Detected face` : `No face detected`} </p>
      <p> {modelsLoaded ? "Model is loaded" : "Loading model"}</p>
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={{ facingMode: "user" }}
        />
    </div>
  )
}

export default PeriodicFaceDetection