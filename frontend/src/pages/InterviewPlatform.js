import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import { useNavigate } from "react-router-dom";

export default function InterviewPlatform() {

  const videoRef = useRef();
  const [riskScore, setRiskScore] = useState(0);
  const [time, setTime] = useState(0);
  const navigate = useNavigate();

  const candidateEmail = localStorage.getItem('candidateEmail') || '';

  // ── Timer ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const timer = setInterval(() => setTime(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = () => {
    const m = Math.floor(time / 60);
    const s = time % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // ── Camera ─────────────────────────────────────────────────────────────────
  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(stream => { videoRef.current.srcObject = stream; });
  };

  // ── Load AI models ─────────────────────────────────────────────────────────
  const loadModels = async () => {
    await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
    startVideo();
  };

  useEffect(() => {
    loadModels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Face detection ─────────────────────────────────────────────────────────
  const detectFaces = async () => {
    const detections = await faceapi.detectAllFaces(
      videoRef.current,
      new faceapi.TinyFaceDetectorOptions()
    );
    if (detections.length > 1) {
      setRiskScore(prev => prev + 20);
      console.log("Multiple faces detected");
    }
  };

  useEffect(() => {
    const interval = setInterval(detectFaces, 3000);
    return () => clearInterval(interval);
  }, []);

  // ── Tab switch detection ───────────────────────────────────────────────────
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) setRiskScore(prev => prev + 10);
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // ── End interview ──────────────────────────────────────────────────────────
  const endInterview = () => {
    const status = riskScore >= 40 ? "Suspicious" : "Safe";

    if (candidateEmail) {
      fetch('https://ai-interview-backend-a7x2.onrender.com/save_result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: candidateEmail,
          interview_time: time,
          risk_score: riskScore,
          status: status
        })
      }).catch(err => console.log('Save error:', err));
    }

    navigate('/');
  };

  const riskColor = riskScore >= 40 ? 'bg-red-600' :
    riskScore >= 20 ? 'bg-yellow-600' : 'bg-green-700';

  return (
    <div className="bg-gray-950 text-white min-h-screen p-6">

      {/* Top Bar */}
      <div className="flex justify-between mb-6 items-center">
        <h1 className="text-2xl font-bold">AI Interview Session</h1>
        <div className="flex gap-4">
          <div className="bg-gray-900 px-4 py-2 rounded-lg border border-gray-700">
            ⏱ {formatTime()}
          </div>
          <div className={`${riskColor} px-4 py-2 rounded-lg font-semibold`}>
            Risk Score: {riskScore}
          </div>
        </div>
      </div>

      {/* Layout */}
      <div className="grid grid-cols-3 gap-6">

        {/* Webcam panel */}
        <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
          <h2 className="mb-4 font-semibold text-gray-300">AI Monitoring</h2>
          <video
            ref={videoRef}
            autoPlay
            muted
            className="rounded-lg w-full"
          />
          <div className="mt-3 space-y-1">
            <p className="text-xs text-gray-500">● Face detection active</p>
            <p className="text-xs text-gray-500">● Tab switch monitoring on</p>
            {riskScore >= 20 && (
              <p className="text-xs text-yellow-400 font-semibold">
                ⚠ Suspicious activity detected
              </p>
            )}
          </div>
        </div>

        {/* Assessment panel */}
        <div className="col-span-2 bg-gray-900 p-6 rounded-xl border border-gray-800">
          <h2 className="text-xl font-semibold mb-2">Assessment Area</h2>
          <p className="text-sm text-gray-500 mb-5">
            Complete all 3 rounds in order. Each round is monitored.
          </p>

          {/* 3 round buttons — NO duplicates */}
          <div className="flex gap-3 mb-6 flex-wrap">

            <button
              onClick={() => navigate("/coding")}
              className="flex items-center gap-2 px-5 py-3 bg-purple-700 hover:bg-purple-600 text-white rounded-xl font-semibold transition"
            >
              <span>💻</span> Coding Round
            </button>

            <button
              onClick={() => navigate("/quiz")}
              className="flex items-center gap-2 px-5 py-3 bg-purple-700 hover:bg-purple-600 text-white rounded-xl font-semibold transition"
            >
              <span>📝</span> Engineering Quiz
            </button>

            <button
              onClick={() => navigate("/hr-interview")}
              className="flex items-center gap-2 px-5 py-3 bg-purple-700 hover:bg-purple-600 text-white rounded-xl font-semibold transition"
            >
              <span>🤖</span> AI HR Interview
            </button>

          </div>

          <div className="bg-gray-800 h-72 flex flex-col items-center justify-center rounded-xl border border-gray-700">
            <p className="text-gray-500 text-lg mb-2">Ready to begin</p>
            <p className="text-gray-600 text-sm">Select a round above to start</p>
          </div>
        </div>

      </div>

      {/* End Interview */}
      <div className="text-center mt-8">
        <button
          onClick={endInterview}
          className="bg-red-600 hover:bg-red-700 px-10 py-3 rounded-xl font-semibold transition"
        >
          End Interview
        </button>
      </div>

    </div>
  );
}