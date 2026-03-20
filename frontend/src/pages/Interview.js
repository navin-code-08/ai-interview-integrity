import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "@vladmandic/face-api";

function Interview() {

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [time, setTime] = useState(0);
  const [riskScore, setRiskScore] = useState(0);

  // -------------------
  // TIMER
  // -------------------
  useEffect(() => {

    const timer = setInterval(() => {
      setTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);

  }, []);

  // -------------------
  // START CAMERA
  // -------------------
  useEffect(() => {

    const startCamera = async () => {

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

    };

    startCamera();

  }, []);

  // -------------------
  // LOAD AI MODELS
  // -------------------
  useEffect(() => {

    const loadModels = async () => {

      await faceapi.nets.tinyFaceDetector.loadFromUri(
        "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/"
      );

      detectFaces();

    };

    loadModels();

  }, []);

  // -------------------
  // FACE DETECTION
  // -------------------
  const detectFaces = () => {

  const video = videoRef.current;

  const canvas = faceapi.createCanvasFromMedia(video);

  canvas.style.position = "absolute";
  canvas.style.top = video.offsetTop + "px";
  canvas.style.left = video.offsetLeft + "px";

  document.body.append(canvas);

  const displaySize = {
    width: video.width,
    height: video.height
  };

  faceapi.matchDimensions(canvas, displaySize);

  setInterval(async () => {

    const detections = await faceapi.detectAllFaces(
      video,
      new faceapi.TinyFaceDetectorOptions()
    );

    const resized = faceapi.resizeResults(detections, displaySize);

    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    faceapi.draw.drawDetections(canvas, resized);

    // MULTIPLE FACE
    if (detections.length > 1) {

      alert("⚠ Multiple faces detected!");
      setRiskScore(prev => prev + 20);

    }

    // NO FACE
    if (detections.length === 0) {

      alert("⚠ No face detected!");
      setRiskScore(prev => prev + 10);

    }

  }, 2000);

};
  // -------------------
  // TAB SWITCH DETECTION
  // -------------------
  useEffect(() => {

    const handleVisibilityChange = () => {

      if (document.hidden) {

        alert("⚠ Tab switching detected!");
        setRiskScore(prev => prev + 10);

      }

    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };

  }, []);

  // -------------------
  // END INTERVIEW
  // -------------------
  const endInterview = () => {

    const email = localStorage.getItem("email");

    const result = {
      email: email,
      interview_time: time,
      risk_score: riskScore,
      status: riskScore > 40 ? "High Risk" : "Safe"
    };

    fetch("https://ai-interview-backend-a7x2.onrender.com/save_result", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(result)
    })
    .then(res => res.json())
    .then(() => {

      alert("Interview Ended & Result Saved");

      window.location.href = "/dashboard";

    });

  };

  return (

    <div style={{ textAlign:"center", marginTop:"50px" }}>

      <h2>AI Interview Monitoring</h2>

      <video
        ref={videoRef}
        autoPlay
        width="600"
        height="400"
        style={{ border:"3px solid black" }}
      />

      <h3>Interview Time: {time} seconds</h3>

      <h3>Risk Score: {riskScore}</h3>
      <h3>AI Monitoring Active</h3>

      <button
        onClick={endInterview}
        style={{
          padding:"10px 20px",
          fontSize:"16px",
          backgroundColor:"red",
          color:"white"
        }}
      >
        End Interview
      </button>

    </div>

  );

}

export default Interview;