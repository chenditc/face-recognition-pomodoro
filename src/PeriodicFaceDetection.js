import { useRef, useEffect, useState } from 'react';
import Webcam from "react-webcam";
import * as faceapi from 'face-api.js';
import useInterval from 'use-interval'


function PeriodicFaceDetection(props) {
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const webcamRef = useRef(null);
  const [detected, setDetected] = useState(false)
  const [cameraSupported] = useState('mediaDevices' in navigator);
  const onFaceDetectionResult = props.onFaceDetectionResult
  const detectionInterval = props.detectionInterval
  const modelInputSize = 128;
  const scoreThreshold = 0.25
  //  const [faceDescriptor, setFaceDescriptor] = useState(null)

  useInterval(() => {
    if (!modelsLoaded) {
      return
    }

    function detectUsingSsdMobilenet() {
      // Recognize face every X seconds
      faceapi.detectSingleFace(webcamRef.current.video, new faceapi.SsdMobilenetv1Options(
        {
          minConfidence: scoreThreshold
        }
      ))
        .then((detection) => {
          if (detection) {
            console.log("SSD success")
            /*
            setFaceDescriptor(detection.descriptor)
            if (faceDescriptor !== null) {
              const dist = faceapi.euclideanDistance(faceDescriptor, detection.descriptor)
              console.log(dist) // 10
            }
            */
          }
          else {
            console.log("All failed")
          }

          onFaceDetectionResult(detection);
          setDetected(detection)
        }, () => {
          onFaceDetectionResult(undefined);
          console.log("detection failed")
        });
    }

    // Recognize face every X seconds
    faceapi.detectSingleFace(webcamRef.current.video, new faceapi.TinyFaceDetectorOptions(
      {
        inputSize: modelInputSize,
        scoreThreshold: scoreThreshold
      }
    ))
      .then((detection) => {
        if (detection) {
          console.log("Tiny success")
          onFaceDetectionResult(detection);
          setDetected(detection)
          /*
          setFaceDescriptor(detection.descriptor)
          if (faceDescriptor !== null) {
            const dist = faceapi.euclideanDistance(faceDescriptor, detection.descriptor)
            console.log(dist) // 10
          }
          */
        }
        else {
          detectUsingSsdMobilenet();
        }
      }, () => {
        detectUsingSsdMobilenet();
      });
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

  return (
    <div>
      <p> Camera Supported: {cameraSupported.toString()} </p>
      <p> {detected ? `Detected face` : `No face detected`} </p>
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