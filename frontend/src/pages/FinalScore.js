import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function FinalScore() {
    const [scores, setScores] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const candidateEmail = localStorage.getItem('candidateEmail') || '';
    const candidateName = localStorage.getItem('candidateName') || 'Candidate';

    useEffect(() => {
        fetch('https://ai-interview-backend-a7x2.onrender.com/calculate_final_score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: candidateEmail })
        })
            .then(r => r.json())
            .then(data => { setScores(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, [candidateEmail]);

    if (loading) return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!scores) return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
            <p>Could not load scores. Make sure Flask is running.</p>
        </div>
    );

    const gradeColor = {
        'A+': 'text-green-400', 'A': 'text-green-400',
        'B': 'text-blue-400', 'C': 'text-yellow-400',
        'D': 'text-orange-400', 'F': 'text-red-400'
    }[scores.grade] || 'text-white';

    const passed = scores.total >= 50;

    return (
        <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-6">
            <div className="w-full max-w-2xl">

                {/* Header card */}
                <div className={`rounded-2xl p-8 text-center mb-6 border ${passed ? 'border-green-500 bg-green-900/20' : 'border-red-500 bg-red-900/20'}`}>
                    <p className="text-gray-400 mb-2">Interview Complete — {candidateName}</p>
                    <p className="text-8xl font-bold my-4">{scores.total}</p>
                    <p className="text-2xl text-gray-400">out of 100</p>
                    <p className={`text-5xl font-bold mt-4 ${gradeColor}`}>Grade: {scores.grade}</p>
                    <p className={`text-lg mt-3 font-semibold ${passed ? 'text-green-400' : 'text-red-400'}`}>
                        {passed ? '✓ Passed' : '✗ Did not pass'}
                    </p>
                </div>

                {/* Score breakdown */}
                <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden mb-6">
                    <div className="px-6 py-4 border-b border-gray-800">
                        <h2 className="font-semibold text-gray-300">Score Breakdown</h2>
                    </div>

                    {[
                        { label: '💻 Coding Round', score: scores.coding_score, max: scores.coding_max, color: 'bg-purple-500' },
                        { label: '📝 Engineering Quiz', score: scores.quiz_marks, max: scores.quiz_max, color: 'bg-blue-500' },
                        { label: '🤖 AI HR Interview', score: scores.hr_marks, max: scores.hr_max, color: 'bg-green-500' },
                    ].map((item, i) => (
                        <div key={i} className="px-6 py-5 border-b border-gray-800/50">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium">{item.label}</span>
                                <span className="text-sm font-bold">
                                    {item.score} / {item.max}
                                </span>
                            </div>
                            <div className="h-2.5 bg-gray-800 rounded-full">
                                <div
                                    className={`h-2.5 rounded-full ${item.color} transition-all duration-1000`}
                                    style={{ width: `${(item.score / item.max) * 100}%` }}
                                />
                            </div>
                        </div>
                    ))}

                    {/* Total row */}
                    <div className="px-6 py-5 bg-gray-800/50">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-white">Total Score</span>
                            <span className="font-bold text-white text-lg">{scores.total} / 100</span>
                        </div>
                        <div className="h-3 bg-gray-700 rounded-full">
                            <div
                                className={`h-3 rounded-full transition-all duration-1000 ${passed ? 'bg-green-500' : 'bg-red-500'}`}
                                style={{ width: `${scores.total}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Risk info */}
                <div className={`rounded-xl px-5 py-4 mb-6 border flex items-center justify-between ${scores.risk_score >= 40 ? 'border-red-700 bg-red-900/20' :
                    scores.risk_score >= 20 ? 'border-yellow-700 bg-yellow-900/20' :
                        'border-green-700 bg-green-900/20'
                    }`}>
                    <span className="text-sm text-gray-300">Integrity Risk Score</span>
                    <span className={`font-bold ${scores.risk_score >= 40 ? 'text-red-400' :
                        scores.risk_score >= 20 ? 'text-yellow-400' : 'text-green-400'
                        }`}>
                        {scores.risk_score} — {scores.risk_score >= 40 ? 'Suspicious' : scores.risk_score >= 20 ? 'Warning' : 'Safe'}
                    </span>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate('/')}
                        className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-semibold transition"
                    >
                        Back to Home
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl font-semibold transition"
                    >
                        Print Result
                    </button>
                </div>

            </div>
        </div>
    );
}