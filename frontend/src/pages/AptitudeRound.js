import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const APTITUDE_QUESTIONS = [
    // Quantitative
    { id: 1, category: "Quantitative", question: "If a train travels 360 km in 4 hours, what is its speed?", options: ["80 km/h", "90 km/h", "100 km/h", "70 km/h"], answer: "90 km/h" },
    { id: 2, category: "Quantitative", question: "What is 15% of 200?", options: ["25", "30", "35", "20"], answer: "30" },
    { id: 3, category: "Quantitative", question: "A man buys an item for Rs.400 and sells for Rs.500. Profit percentage?", options: ["20%", "25%", "30%", "15%"], answer: "25%" },
    { id: 4, category: "Quantitative", question: "If 6 workers finish a job in 12 days, how many days for 9 workers?", options: ["6", "8", "9", "10"], answer: "8" },
    { id: 5, category: "Quantitative", question: "Simple interest on Rs.1000 at 10% per year for 2 years?", options: ["Rs.100", "Rs.200", "Rs.150", "Rs.250"], answer: "Rs.200" },
    { id: 6, category: "Quantitative", question: "The ratio of two numbers is 3:5. If sum is 80, find the larger number.", options: ["30", "50", "48", "40"], answer: "50" },
    { id: 7, category: "Quantitative", question: "A pipe fills a tank in 4 hours. Another empties it in 8 hours. Together?", options: ["8 hours", "6 hours", "10 hours", "12 hours"], answer: "8 hours" },
    { id: 8, category: "Quantitative", question: "If 40% of a number is 120, what is the number?", options: ["200", "250", "300", "350"], answer: "300" },

    // Logical Reasoning
    { id: 9, category: "Logical", question: "Find next number: 2, 6, 12, 20, 30, ?", options: ["40", "42", "44", "46"], answer: "42" },
    { id: 10, category: "Logical", question: "A is B's sister. B is C's brother. C is D's father. How is A related to D?", options: ["Mother", "Aunt", "Sister", "Grandmother"], answer: "Aunt" },
    { id: 11, category: "Logical", question: "If APPLE is coded as BQQMF, then MANGO is coded as?", options: ["NBOHO", "NBOHP", "NBNHP", "NCOHP"], answer: "NBOIP" },
    { id: 12, category: "Logical", question: "Pointing to a man, a woman says his mother is the only daughter of my mother. How is she related?", options: ["Mother", "Sister", "Aunt", "Grandmother"], answer: "Mother" },
    { id: 13, category: "Logical", question: "Find odd one out: 2, 3, 5, 7, 9, 11", options: ["2", "9", "11", "3"], answer: "9" },
    { id: 14, category: "Logical", question: "If South-East becomes North, North-East becomes West, what does South become?", options: ["North-East", "North-West", "South-West", "East"], answer: "North-East" },

    // Verbal
    { id: 15, category: "Verbal", question: "Choose the synonym of ABUNDANT:", options: ["Scarce", "Plentiful", "Limited", "Rare"], answer: "Plentiful" },
    { id: 16, category: "Verbal", question: "Choose the antonym of COURAGE:", options: ["Bravery", "Boldness", "Cowardice", "Strength"], answer: "Cowardice" },
    { id: 17, category: "Verbal", question: "Select the correctly spelled word:", options: ["Accomodate", "Accommodate", "Acommodate", "Acomodate"], answer: "Accommodate" },
    { id: 18, category: "Verbal", question: "Choose the meaning of: TO BURN THE MIDNIGHT OIL", options: ["To sleep early", "To work late at night", "To waste time", "To be lazy"], answer: "To work late at night" },
    { id: 19, category: "Verbal", question: "Fill in the blank: She _____ to school every day.", options: ["go", "goes", "gone", "going"], answer: "goes" },
    { id: 20, category: "Verbal", question: "Choose the antonym of ANCIENT:", options: ["Old", "Modern", "Historic", "Antique"], answer: "Modern" },
];

export default function AptitudeRound() {
    const navigate = useNavigate();
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(600);
    const [status, setStatus] = useState('active');
    const [results, setResults] = useState(null);
    const [tabWarnings, setTabWarnings] = useState(0);

    const candidateEmail = localStorage.getItem('candidateEmail') || '';

    useEffect(() => {
        const shuffled = [...APTITUDE_QUESTIONS].sort(() => Math.random() - 0.5);
        setQuestions(shuffled.slice(0, 10));
    }, []);

    const submitAptitude = useCallback(() => {
        let score = 0;
        const resultList = [];
        questions.forEach(q => {
            const selected = answers[q.id];
            const is_correct = selected === q.answer;
            if (is_correct) score++;
            resultList.push({
                id: q.id, category: q.category,
                question: q.question, options: q.options,
                selected: selected || null,
                correct: q.answer, is_correct
            });
        });
        const percentage = Math.round((score / questions.length) * 100);

        // Save to backend
        fetch(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000'}/submit_aptitude`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: candidateEmail, score, percentage, results: resultList })
        }).catch(e => console.log(e));

        setResults({ score, total: questions.length, percentage, results: resultList });
        setStatus('submitted');
    }, [answers, questions, candidateEmail]);

    useEffect(() => {
        if (status !== 'active' || timeLeft <= 0) {
            if (timeLeft <= 0) submitAptitude();
            return;
        }
        const t = setTimeout(() => setTimeLeft(p => p - 1), 1000);
        return () => clearTimeout(t);
    }, [timeLeft, status, submitAptitude]);

    useEffect(() => {
        const handle = () => {
            if (document.hidden && status === 'active') setTabWarnings(w => w + 1);
        };
        document.addEventListener('visibilitychange', handle);
        return () => document.removeEventListener('visibilitychange', handle);
    }, [status]);

    const formatTime = (s) =>
        `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

    const currentQ = questions[currentIndex];
    const answeredCount = Object.keys(answers).length;

    // Results screen
    if (status === 'submitted' && results) {
        const passed = results.percentage >= 60;
        return (
            <div style={{ backgroundColor: '#052e16' }} className="min-h-screen text-white p-6">
                <div className="max-w-3xl mx-auto">
                    <div style={{
                        border: `1px solid ${passed ? '#10b981' : '#ef4444'}`,
                        backgroundColor: passed ? '#064e2a' : '#3b0000'
                    }}
                        className="rounded-2xl p-8 text-center mb-8">
                        <div className="text-6xl mb-4">{passed ? '🎉' : '📚'}</div>
                        <h1 className="text-3xl font-bold mb-2">Aptitude Round Complete!</h1>
                        <p style={{ color: '#10b981' }} className="text-5xl font-bold my-4">
                            {results.percentage}%
                        </p>
                        <p className="text-xl">{results.score} / {results.total} correct</p>
                        <p className={`text-lg mt-2 font-semibold ${passed ? 'text-green-400' : 'text-red-400'}`}>
                            {passed ? 'Passed ✓' : 'Needs improvement'}
                        </p>
                        {tabWarnings > 0 && (
                            <p className="text-yellow-400 mt-3 text-sm">
                                ⚠ {tabWarnings} tab switch(es) detected
                            </p>
                        )}
                    </div>

                    <h2 className="text-xl font-bold mb-4 text-gray-300">Answer Review</h2>
                    <div className="space-y-4">
                        {results.results.map((r, i) => (
                            <div key={r.id}
                                style={{
                                    border: `1px solid ${r.is_correct ? '#10b981' : '#ef4444'}`,
                                    backgroundColor: r.is_correct ? '#064e2a' : '#3b0000'
                                }}
                                className="p-4 rounded-xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <span style={{ backgroundColor: '#0a5c36' }}
                                        className="text-xs px-2 py-0.5 rounded text-green-300">
                                        {r.category}
                                    </span>
                                    <span className="text-gray-400 text-xs">Q{i + 1}</span>
                                </div>
                                <p className="font-medium mb-2">{r.question}</p>
                                <p className="text-sm text-gray-400">
                                    Your answer:{' '}
                                    <span className={r.is_correct ? 'text-green-400' : 'text-red-400'}>
                                        {r.selected || 'Not answered'}
                                    </span>
                                </p>
                                {!r.is_correct && (
                                    <p className="text-sm text-green-400">Correct: {r.correct}</p>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-4 mt-8">
                        <button onClick={() => navigate('/interview')}
                            style={{ backgroundColor: '#064e2a', border: '1px solid #0f6b38' }}
                            className="flex-1 py-3 rounded-xl font-semibold transition hover:opacity-90">
                            Back to Interview
                        </button>
                        <button onClick={() => navigate('/quiz')}
                            style={{ backgroundColor: '#10b981' }}
                            className="flex-1 py-3 rounded-xl font-semibold transition hover:opacity-90">
                            Continue to Engineering Quiz →
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!currentQ) return (
        <div style={{ backgroundColor: '#052e16' }}
            className="min-h-screen flex items-center justify-center text-white">
            <div className="text-center">
                <div style={{ borderColor: '#10b981' }}
                    className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p>Loading aptitude questions...</p>
            </div>
        </div>
    );

    return (
        <div style={{ backgroundColor: '#052e16' }} className="min-h-screen text-white">

            {/* Header */}
            <div style={{ backgroundColor: '#064e2a', borderBottom: '1px solid #0f6b38' }}
                className="px-6 py-4 flex items-center justify-between">
                <div>
                    <h1 className="text-lg font-bold">Aptitude Round</h1>
                    <p className="text-sm text-gray-400">Round 2 of 4</p>
                </div>
                <div className="flex items-center gap-4">
                    {tabWarnings > 0 && (
                        <span className="text-yellow-400 text-sm">⚠ {tabWarnings} tab switch(es)</span>
                    )}
                    <div style={{ color: timeLeft < 60 ? '#ef4444' : '#10b981' }}
                        className={`text-2xl font-mono font-bold ${timeLeft < 60 ? 'animate-pulse' : ''}`}>
                        {formatTime(timeLeft)}
                    </div>
                </div>
            </div>

            {/* Progress */}
            <div style={{ backgroundColor: '#064e2a', borderBottom: '1px solid #0f6b38' }}
                className="px-6 py-2">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{answeredCount} of {questions.length} answered</span>
                    <span>Question {currentIndex + 1} of {questions.length}</span>
                </div>
                <div style={{ backgroundColor: '#0a5c36' }} className="h-2 rounded-full">
                    <div style={{
                        width: `${(answeredCount / questions.length) * 100}%`,
                        backgroundColor: '#10b981'
                    }}
                        className="h-2 rounded-full transition-all duration-300" />
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-6 flex gap-6">

                {/* Question area */}
                <div className="flex-1">
                    <div style={{ backgroundColor: '#064e2a', border: '1px solid #0f6b38' }}
                        className="rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <span style={{ backgroundColor: '#0a5c36', border: '1px solid #10b981' }}
                                className="px-3 py-1 text-green-300 text-xs rounded-full">
                                {currentQ.category}
                            </span>
                            <span className="text-gray-500 text-sm">Question {currentIndex + 1}</span>
                        </div>

                        <h2 className="text-xl font-semibold mb-6 leading-relaxed">
                            {currentQ.question}
                        </h2>

                        <div className="space-y-3">
                            {currentQ.options.map((opt, i) => {
                                const selected = answers[currentQ.id] === opt;
                                return (
                                    <button key={i}
                                        onClick={() => setAnswers(prev => ({ ...prev, [currentQ.id]: opt }))}
                                        style={{
                                            border: `1px solid ${selected ? '#10b981' : '#0f6b38'}`,
                                            backgroundColor: selected ? '#0a5c36' : '#052e16'
                                        }}
                                        className="w-full text-left px-5 py-4 rounded-xl transition-all">
                                        <span style={{
                                            backgroundColor: selected ? '#10b981' : '#064e2a',
                                            color: selected ? 'white' : '#9ca3af'
                                        }}
                                            className="inline-flex w-7 h-7 rounded-full items-center justify-center text-sm font-bold mr-3">
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
                                style={{ backgroundColor: '#064e2a', border: '1px solid #0f6b38' }}
                                className="px-6 py-2 rounded-xl disabled:opacity-30 transition">
                                ← Previous
                            </button>
                            {currentIndex < questions.length - 1 ? (
                                <button
                                    onClick={() => setCurrentIndex(i => i + 1)}
                                    style={{ backgroundColor: '#0a5c36' }}
                                    className="px-6 py-2 rounded-xl transition hover:opacity-90">
                                    Next →
                                </button>
                            ) : (
                                <button
                                    onClick={submitAptitude}
                                    style={{ backgroundColor: '#10b981' }}
                                    className="px-6 py-2 rounded-xl font-semibold transition hover:opacity-90">
                                    Submit ✓
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Navigator */}
                <div className="w-48">
                    <div style={{ backgroundColor: '#064e2a', border: '1px solid #0f6b38' }}
                        className="rounded-2xl p-4">
                        <p className="text-xs text-gray-500 mb-3 font-semibold uppercase tracking-wider">
                            Questions
                        </p>
                        <div className="grid grid-cols-4 gap-2">
                            {questions.map((q, i) => (
                                <button key={q.id}
                                    onClick={() => setCurrentIndex(i)}
                                    style={{
                                        backgroundColor: i === currentIndex ? '#10b981'
                                            : answers[q.id] ? '#0a5c36' : '#052e16',
                                        border: `1px solid ${i === currentIndex ? '#10b981'
                                            : answers[q.id] ? '#0f6b38' : '#0f6b38'}`
                                    }}
                                    className="w-9 h-9 rounded-lg text-xs font-bold transition">
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                        <div className="mt-4 space-y-1 text-xs text-gray-500">
                            <div className="flex items-center gap-2">
                                <div style={{ backgroundColor: '#0a5c36' }} className="w-3 h-3 rounded" />
                                Answered
                            </div>
                            <div className="flex items-center gap-2">
                                <div style={{ backgroundColor: '#10b981' }} className="w-3 h-3 rounded" />
                                Current
                            </div>
                            <div className="flex items-center gap-2">
                                <div style={{ backgroundColor: '#052e16', border: '1px solid #0f6b38' }}
                                    className="w-3 h-3 rounded" />
                                Not answered
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}