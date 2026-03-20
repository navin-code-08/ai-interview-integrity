import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { useNavigate } from "react-router-dom";

function CodingRound() {

  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [code, setCode] = useState("# Write your code here");
  const [output, setOutput] = useState("");
  const [language, setLanguage] = useState("python");
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [score, setScore] = useState(null);
  const navigate = useNavigate();

  // Fetch random questions from backend
  useEffect(() => {
    fetch("https://ai-interview-backend-a7x2.onrender.com/get_coding_questions")
      .then(res => res.json())
      .then(data => {
        setQuestions(data);
        setCode("# Write your code here");
      })
      .catch(err => console.log("Failed to load questions:", err));
  }, []);

  const question = questions[currentQuestion];

  // ── Save current code against question ID (not index) ──────────────────────
  const saveAnswer = (currentCode) => {
    if (!question) return;
    setAnswers(prev => ({
      ...prev,
      [question.id]: currentCode  // KEY FIX: use question.id not currentQuestion index
    }));
  };

  const goToQuestion = (index, currentCode) => {
    saveAnswer(currentCode);
    setCurrentQuestion(index);
    // Restore previously saved code for that question, or show blank
    const savedCode = answers[questions[index]?.id] || "# Write your code here";
    setCode(savedCode);
  };

  const runCode = async () => {
    setOutput("Running...");
    try {
      const response = await fetch("https://ai-interview-backend-a7x2.onrender.com/run_code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language })
      });
      const data = await response.json();
      setOutput(data.output || "No output");
    } catch (err) {
      setOutput("Error: Could not connect to Flask backend.");
    }
  };

  const submitCodingRound = async () => {
    const finalAnswers = { ...answers, [question.id]: code };
    setSubmitting(true);
    try {
      const response = await fetch("https://ai-interview-backend-a7x2.onrender.com/submit_coding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: finalAnswers,
          language: language,
          email: localStorage.getItem('candidateEmail') || ''  // ← ADD THIS
        })
      });
      const data = await response.json();
      setScore(data.score);
    } catch (err) {
      setOutput("Error: Could not connect to Flask backend.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Default code templates per language ────────────────────────────────────
  const getTemplate = (lang) => {
    const templates = {
      python: "# Write your code here\n",
      javascript: "// Write your code here\n",
      cpp: "#include<iostream>\nusing namespace std;\nint main() {\n    // Write your code here\n    return 0;\n}",
      c: "#include<stdio.h>\nint main() {\n    // Write your code here\n    return 0;\n}",
      java: "public class Main {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}"
    };
    return templates[lang] || "// Write your code here";
  };

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setLanguage(lang);
    setCode(getTemplate(lang));
    setOutput("");
  };

  // ── Score result screen ────────────────────────────────────────────────────
  if (score !== null) {
    const maxScore = questions.length * 10;
    const percentage = Math.round((score / maxScore) * 100);
    const passed = percentage >= 50;
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className={`rounded-2xl p-10 border ${passed ? 'border-green-500 bg-green-900/20' : 'border-red-500 bg-red-900/20'}`}>
            <div className="text-6xl mb-4">{passed ? '🎉' : '📚'}</div>
            <h1 className="text-3xl font-bold mb-2">Coding Round Complete</h1>
            <p className="text-6xl font-bold my-6">{score}<span className="text-2xl text-gray-400">/{maxScore}</span></p>
            <p className={`text-xl font-semibold mb-6 ${passed ? 'text-green-400' : 'text-red-400'}`}>
              {passed ? 'Passed ✓' : 'Needs improvement'}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => navigate('/interview')}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-semibold transition"
              >
                Back to Interview
              </button>
              <button
                onClick={() => navigate('/quiz')}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl font-semibold transition"
              >
                Next: Quiz →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading questions...</p>
        </div>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">

      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">Coding Round</h1>
          <p className="text-sm text-gray-400">Round 1 of 3</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">
            {answeredCount} / {questions.length} saved
          </span>
          {/* Question number pills */}
          <div className="flex gap-2">
            {questions.map((q, i) => (
              <button
                key={q.id}
                onClick={() => goToQuestion(i, code)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition ${i === currentQuestion
                  ? 'bg-purple-600 text-white'
                  : answers[q.id]
                    ? 'bg-green-700 text-white'
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* Left panel — question */}
        <div className="w-80 bg-gray-900 border-r border-gray-800 p-6 overflow-y-auto">
          <div className="mb-3">
            <span className="px-2 py-1 bg-purple-900/50 text-purple-300 text-xs rounded border border-purple-700">
              Question {currentQuestion + 1} of {questions.length}
            </span>
          </div>
          <h2 className="text-lg font-bold mb-3">{question.title}</h2>
          <p className="text-gray-300 text-sm mb-4">{question.description}</p>
          <div className="bg-gray-800 rounded-xl p-4 text-sm font-mono">
            <p className="text-gray-400 mb-1">Input:</p>
            <p className="text-green-400">{question.input}</p>
            <p className="text-gray-400 mt-3 mb-1">Expected Output:</p>
            <p className="text-yellow-400">{question.output}</p>
          </div>
        </div>

        {/* Right panel — editor */}
        <div className="flex-1 flex flex-col">

          {/* Toolbar */}
          <div className="bg-gray-900 border-b border-gray-800 px-4 py-2 flex items-center gap-3">
            <select
              value={language}
              onChange={handleLanguageChange}
              className="bg-gray-800 border border-gray-700 text-white text-sm px-3 py-1.5 rounded-lg"
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="cpp">C++</option>
              <option value="c">C</option>
              <option value="java">Java</option>
            </select>

            <button
              onClick={runCode}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-sm rounded-lg font-semibold transition"
            >
              ▶ Run Code
            </button>

            <div className="flex-1" />

            <button
              onClick={() => goToQuestion(currentQuestion - 1, code)}
              disabled={currentQuestion === 0}
              className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-sm rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              ← Prev
            </button>

            <button
              onClick={() => goToQuestion(currentQuestion + 1, code)}
              disabled={currentQuestion === questions.length - 1}
              className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-sm rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              Next →
            </button>

            <button
              onClick={submitCodingRound}
              disabled={submitting}
              className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-sm rounded-lg font-semibold transition disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit ✓'}
            </button>
          </div>

          {/* Monaco editor */}
          <div className="flex-1">
            <Editor
              height="100%"
              language={language}
              value={code}
              onChange={(value) => setCode(value || "")}
              theme="vs-dark"
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                padding: { top: 16 }
              }}
            />
          </div>

          {/* Output panel */}
          <div className="h-36 bg-gray-900 border-t border-gray-800">
            <div className="px-4 py-2 border-b border-gray-800">
              <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Output</span>
            </div>
            <pre className="px-4 py-3 text-sm text-green-400 font-mono overflow-auto h-24">
              {output || "Click 'Run Code' to see output here"}
            </pre>
          </div>

        </div>
      </div>
    </div>
  );
}

export default CodingRound;