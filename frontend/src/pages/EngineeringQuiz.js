import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const EngineeringQuiz = () => {
    const navigate = useNavigate();
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
    const [quizState, setQuizState] = useState('loading'); // loading | active | submitted
    const [results, setResults] = useState(null);
    const [tabWarnings, setTabWarnings] = useState(0);

    const candidateEmail = localStorage.getItem('candidateEmail') || 'test@email.com';

    // ── Load questions from backend ──────────────────────────────
    useEffect(() => {
        fetch('http://127.0.0.1:5000/get_quiz')
            .then(res => res.json())
            .then(data => {
                setQuestions(data.questions);
                setQuizState('active');
            })
            .catch(() => {
                alert('Could not load questions. Make sure Flask is running.');
            });
    }, []);

    // ── Submit quiz ──────────────────────────────────────────────
    const submitQuiz = useCallback(() => {
        setQuizState('submitting');
        fetch('http://127.0.0.1:5000/submit_quiz', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: candidateEmail, answers })
        })
            .then(res => res.json())
            .then(data => {
                setResults(data);
                setQuizState('submitted');
            });
    }, [answers, candidateEmail]);

    // ── Countdown timer ──────────────────────────────────────────
    useEffect(() => {
        if (quizState !== 'active') return;
        if (timeLeft <= 0) { submitQuiz(); return; }
        const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
        return () => clearTimeout(timer);
    }, [timeLeft, quizState, submitQuiz]);

    // ── Tab switch detection ─────────────────────────────────────
    useEffect(() => {
        const handleVisibility = () => {
            if (document.hidden && quizState === 'active') {
                setTabWarnings(w => w + 1);
            }
        };
        document.addEventListener('visibilitychange', handleVisibility);
        return () => document.removeEventListener('visibilitychange', handleVisibility);
    }, [quizState]);

    // ── Disable right click and copy paste ───────────────────────
    useEffect(() => {
        const block = e => e.preventDefault();
        document.addEventListener('contextmenu', block);
        document.addEventListener('copy', block);
        document.addEventListener('paste', block);
        return () => {
            document.removeEventListener('contextmenu', block);
            document.removeEventListener('copy', block);
            document.removeEventListener('paste', block);
        };
    }, []);

    const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
    const currentQ = questions[currentIndex];
    const answeredCount = Object.keys(answers).length;
    const progress = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

    // ── Loading screen ───────────────────────────────────────────
    if (quizState === 'loading') return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white text-lg">Loading your quiz...</p>
            </div>
        </div>
    );

    // ── Results screen ───────────────────────────────────────────
    if (quizState === 'submitted' && results) {
        const passed = results.percentage >= 60;
        return (
            <div className="min-h-screen bg-gray-950 text-white p-6">
                <div className="max-w-3xl mx-auto">
                    <div className={`rounded-2xl p-8 mb-8 text-center ${passed ? 'bg-green-900/40 border border-green-500' : 'bg-red-900/40 border border-red-500'}`}>
                        <div className="text-6xl mb-4">{passed ? '🎉' : '📚'}</div>
                        <h1 className="text-3xl font-bold mb-2">Quiz Complete!</h1>
                        <p className="text-5xl font-bold my-4">{results.percentage}%</p>
                        <p className="text-xl">{results.score} / {results.total} correct</p>
                        <p className={`text-lg mt-2 font-semibold ${passed ? 'text-green-400' : 'text-red-400'}`}>
                            {passed ? 'Passed ✓' : 'Needs improvement'}
                        </p>
                        {tabWarnings > 0 && (
                            <p className="text-yellow-400 mt-3 text-sm">⚠ {tabWarnings} tab switch(es) detected and recorded</p>
                        )}
                    </div>

                    <h2 className="text-xl font-bold mb-4 text-gray-300">Question Review</h2>
                    <div className="space-y-4">
                        {results.results.map((r, i) => (
                            <div key={r.id} className={`p-4 rounded-xl border ${r.is_correct ? 'border-green-700 bg-green-900/20' : 'border-red-700 bg-red-900/20'}`}>
                                <p className="font-medium mb-2">Q{i + 1}. {r.question}</p>
                                <p className="text-sm text-gray-400">Your answer: <span className={r.is_correct ? 'text-green-400' : 'text-red-400'}>{r.selected || 'Not answered'}</span></p>
                                {!r.is_correct && <p className="text-sm text-green-400">Correct: {r.correct}</p>}
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-4 mt-8">
                        <button
                            onClick={() => navigate('/interview')}
                            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold transition"
                        >
                            Back to Interview
                        </button>
                        <button
                            onClick={() => navigate('/hr-interview')}
                            className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl font-semibold transition"
                        >
                            Continue to AI HR Interview →
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ── Quiz active screen ───────────────────────────────────────
    return (
        <div className="min-h-screen bg-gray-950 text-white">
            {/* Header */}
            <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
                <div>
                    <h1 className="text-lg font-bold">Engineering Quiz</h1>
                    <p className="text-sm text-gray-400">Round 2 of 3</p>
                </div>
                <div className="flex items-center gap-6">
                    {tabWarnings > 0 && (
                        <span className="text-yellow-400 text-sm">⚠ {tabWarnings} tab switch(es)</span>
                    )}
                    <div className={`text-2xl font-mono font-bold ${timeLeft < 60 ? 'text-red-400 animate-pulse' : 'text-green-400'}`}>
                        {formatTime(timeLeft)}
                    </div>
                </div>
            </div>

            {/* Progress bar */}
            <div className="bg-gray-900 px-6 py-2">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{answeredCount} of {questions.length} answered</span>
                    <span>Question {currentIndex + 1} of {questions.length}</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full">
                    <div
                        className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-6 flex gap-6">
                {/* Main question area */}
                <div className="flex-1">
                    {currentQ && (
                        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="px-3 py-1 bg-blue-900/50 text-blue-300 text-xs rounded-full border border-blue-700">
                                    {currentQ.category}
                                </span>
                                <span className="text-gray-500 text-sm">Question {currentIndex + 1}</span>
                            </div>

                            <h2 className="text-xl font-semibold mb-6 leading-relaxed">{currentQ.question}</h2>

                            <div className="space-y-3">
                                {currentQ.options.map((opt, i) => {
                                    const selected = answers[currentQ.id] === opt;
                                    return (
                                        <button
                                            key={i}
                                            onClick={() => setAnswers(prev => ({ ...prev, [currentQ.id]: opt }))}
                                            className={`w-full text-left px-5 py-4 rounded-xl border transition-all duration-150 ${selected
                                                ? 'border-blue-500 bg-blue-900/40 text-white'
                                                : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:border-gray-500 hover:bg-gray-800'
                                                }`}
                                        >
                                            <span className={`inline-block w-7 h-7 rounded-full text-center text-sm font-bold mr-3 leading-7 ${selected ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-400'}`}>
                                                {String.fromCharCode(65 + i)}
                                            </span>
                                            {opt}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Navigation */}
                            <div className="flex justify-between mt-8">
                                <button
                                    onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
                                    disabled={currentIndex === 0}
                                    className="px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition"
                                >
                                    ← Previous
                                </button>
                                {currentIndex < questions.length - 1 ? (
                                    <button
                                        onClick={() => setCurrentIndex(i => i + 1)}
                                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl transition"
                                    >
                                        Next →
                                    </button>
                                ) : (
                                    <button
                                        onClick={submitQuiz}
                                        className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-xl font-semibold transition"
                                    >
                                        Submit Quiz ✓
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Question navigator panel */}
                <div className="w-48">
                    <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
                        <p className="text-xs text-gray-500 mb-3 font-semibold uppercase tracking-wider">Questions</p>
                        <div className="grid grid-cols-4 gap-2">
                            {questions.map((q, i) => (
                                <button
                                    key={q.id}
                                    onClick={() => setCurrentIndex(i)}
                                    className={`w-9 h-9 rounded-lg text-xs font-bold transition ${i === currentIndex
                                        ? 'bg-blue-600 text-white'
                                        : answers[q.id]
                                            ? 'bg-green-700 text-white'
                                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                        <div className="mt-4 space-y-1 text-xs text-gray-500">
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-green-700"></div> Answered</div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-blue-600"></div> Current</div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-gray-800"></div> Not answered</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EngineeringQuiz;