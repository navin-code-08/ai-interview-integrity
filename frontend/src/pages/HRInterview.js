import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function HRInterview() {
    const navigate = useNavigate();
    const bottomRef = useRef(null);

    const [messages, setMessages] = useState([]);
    const [history, setHistory] = useState([]);
    const [inputText, setInputText] = useState('');
    const [exchangeCount, setExchangeCount] = useState(0);
    const [status, setStatus] = useState('loading');
    const [tabWarnings, setTabWarnings] = useState(0);
    const [currentAI, setCurrentAI] = useState('');

    const candidateName = localStorage.getItem('candidateName') || 'Candidate';
    const candidateEmail = localStorage.getItem('candidateEmail') || '';

    useEffect(() => {
        fetch('https://ai-interview-backend-a7x2.onrender.com/start_hr_interview', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: candidateName })
        })
            .then(r => r.json())
            .then(data => {
                setMessages([{ role: 'hr', text: data.message }]);
                setCurrentAI(data.message);
                setStatus('active');
            })
            .catch(() => {
                setMessages([{ role: 'hr', text: 'Could not connect to backend. Make sure Flask is running.' }]);
                setStatus('active');
            });
    }, [candidateName]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        const handle = () => {
            if (document.hidden && status === 'active') setTabWarnings(w => w + 1);
        };
        document.addEventListener('visibilitychange', handle);
        return () => document.removeEventListener('visibilitychange', handle);
    }, [status]);

    const sendAnswer = async () => {
        const text = inputText.trim();
        if (!text || status !== 'active') return;

        setMessages(prev => [...prev, { role: 'candidate', text }]);
        setInputText('');
        setStatus('thinking');

        const newEntry = { ai: currentAI, candidate: text };
        const newHistory = [...history, newEntry];
        setHistory(newHistory);

        try {
            const res = await fetch('https://ai-interview-backend-a7x2.onrender.com/hr_chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: candidateEmail,
                    name: candidateName,
                    history: newHistory,
                    exchange_count: exchangeCount + 1
                })
            });
            const data = await res.json();
            setMessages(prev => [...prev, { role: 'hr', text: data.message }]);
            setCurrentAI(data.message);
            setExchangeCount(data.exchange_count);
            setStatus(data.is_complete ? 'complete' : 'active');
        } catch (err) {
            setMessages(prev => [...prev, { role: 'hr', text: 'Connection error. Please check Flask is running.' }]);
            setStatus('active');
        }
    };

    const handleKey = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendAnswer();
        }
    };

    const progressPercent = Math.min((exchangeCount / 10) * 100, 100);

    return (
        <div className="min-h-screen bg-gray-950 text-white flex flex-col">

            {/* Header */}
            <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
                <div>
                    <h1 className="text-lg font-bold">AI HR Interview</h1>
                    <p className="text-sm text-gray-400">Round 3 of 3 — Conversational interview</p>
                </div>
                <div className="flex items-center gap-4">
                    {tabWarnings > 0 && (
                        <span className="text-yellow-400 text-sm">⚠ {tabWarnings} tab switch(es)</span>
                    )}
                    <span className="text-sm text-gray-500">{exchangeCount}/10 exchanges</span>
                </div>
            </div>

            {/* Progress bar */}
            <div className="bg-gray-900 px-6 py-2 border-b border-gray-800">
                <div className="h-1.5 bg-gray-800 rounded-full">
                    <div
                        className="h-1.5 bg-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>

            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 max-w-3xl mx-auto w-full">

                {status === 'loading' && (
                    <div className="flex justify-center py-20">
                        <div className="text-center">
                            <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                            <p className="text-gray-400">Starting your interview...</p>
                        </div>
                    </div>
                )}

                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'candidate' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'hr' && (
                            <div className="w-8 h-8 rounded-full bg-purple-700 flex items-center justify-center text-xs font-bold mr-3 mt-1 flex-shrink-0">
                                HR
                            </div>
                        )}
                        <div className={`max-w-xl px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'hr'
                            ? 'bg-gray-800 text-gray-100 rounded-tl-sm'
                            : 'bg-purple-700 text-white rounded-tr-sm'
                            }`}>
                            {msg.text}
                        </div>
                        {msg.role === 'candidate' && (
                            <div className="w-8 h-8 rounded-full bg-teal-700 flex items-center justify-center text-xs font-bold ml-3 mt-1 flex-shrink-0">
                                {candidateName[0]?.toUpperCase() || 'C'}
                            </div>
                        )}
                    </div>
                ))}

                {status === 'thinking' && (
                    <div className="flex justify-start">
                        <div className="w-8 h-8 rounded-full bg-purple-700 flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0">
                            HR
                        </div>
                        <div className="bg-gray-800 px-4 py-3 rounded-2xl rounded-tl-sm">
                            <div className="flex gap-1 items-center h-4">
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </div>
                )}

                <div ref={bottomRef} />
            </div>

            {/* ── Complete screen — goes to Final Score ── */}
            {status === 'complete' && (
                <div className="bg-gray-900 border-t border-gray-800 px-6 py-6">
                    <div className="max-w-3xl mx-auto text-center">
                        <p className="text-green-400 font-semibold text-lg mb-1">
                            🎉 All 3 Rounds Complete!
                        </p>
                        <p className="text-gray-400 text-sm mb-5">
                            Your transcript has been saved.
                            {tabWarnings > 0 && ` (${tabWarnings} tab switch warning(s) recorded)`}
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => navigate('/interview')}
                                className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-xl font-semibold transition text-sm"
                            >
                                ← Back to Interview
                            </button>
                            <button
                                onClick={() => navigate('/final-score')}
                                className="px-8 py-2.5 bg-purple-600 hover:bg-purple-700 rounded-xl font-semibold transition text-sm"
                            >
                                View Final Score →
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Input area */}
            {status !== 'complete' && (
                <div className="bg-gray-900 border-t border-gray-800 px-6 py-4">
                    <div className="max-w-3xl mx-auto flex gap-3">
                        <textarea
                            value={inputText}
                            onChange={e => setInputText(e.target.value)}
                            onKeyDown={handleKey}
                            disabled={status !== 'active'}
                            placeholder={status === 'thinking' ? 'HR is typing...' : 'Type your answer and press Enter...'}
                            rows={2}
                            className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 resize-none focus:outline-none focus:border-purple-500 disabled:opacity-50"
                        />
                        <button
                            onClick={sendAnswer}
                            disabled={status !== 'active' || !inputText.trim()}
                            className="px-5 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl font-semibold text-sm transition disabled:opacity-40 disabled:cursor-not-allowed self-end"
                        >
                            Send
                        </button>
                    </div>
                    <p className="text-center text-xs text-gray-600 mt-2">
                        Press Enter to send · Shift+Enter for new line
                    </p>
                </div>
            )}
        </div>
    );
}