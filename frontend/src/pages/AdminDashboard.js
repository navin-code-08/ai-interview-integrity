import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState(null);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [adminAuth, setAdminAuth] = useState(false);
    const [passwordInput, setPasswordInput] = useState('');
    const [wrongPassword, setWrongPassword] = useState(false);

    const ADMIN_PASSWORD = "interview@2006"; // change this to your own password

    const handleAdminLogin = () => {
        if (passwordInput === ADMIN_PASSWORD) {
            setAdminAuth(true);
            setWrongPassword(false);
        } else {
            setWrongPassword(true);
        }
    };
    const fetchCandidates = () => {
        setLoading(true);
        fetch('https://ai-interview-backend-a7x2.onrender.com/candidates', {
            headers: {
                'X-Admin-Token': 'admin-secret-2026'  // must match backend
            }
        })
            .then(r => {
                if (r.status === 401) throw new Error('Unauthorized');
                return r.json();
            })
            .then(data => { setCandidates(data); setLoading(false); })
            .catch(() => { setError('Could not connect to backend.'); setLoading(false); });
    };

    useEffect(() => { fetchCandidates(); }, []);

    const filtered = candidates.filter(c =>
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.email?.toLowerCase().includes(search.toLowerCase())
    );

    const getRisk = (score) => {
        if (score >= 40) return { bg: 'bg-red-900/40', text: 'text-red-400', label: 'Suspicious' };
        if (score >= 20) return { bg: 'bg-yellow-900/40', text: 'text-yellow-400', label: 'Warning' };
        return { bg: 'bg-green-900/40', text: 'text-green-400', label: 'Safe' };
    };

    const getGradeColor = (grade) => {
        if (!grade) return 'text-gray-500';
        if (grade === 'A+' || grade === 'A') return 'text-green-400';
        if (grade === 'B') return 'text-blue-400';
        if (grade === 'C') return 'text-yellow-400';
        if (grade === 'D') return 'text-orange-400';
        return 'text-red-400';
    };

    const formatTime = (secs) => {
        if (!secs) return '—';
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m}m ${s}s`;
    };
    // Admin password gate
    if (!adminAuth) return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center px-6">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 w-full max-w-sm">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-purple-900/40 border border-purple-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span style={{ fontSize: '28px' }}>🔐</span>
                    </div>
                    <h1 className="text-xl font-bold text-white">Admin Access</h1>
                    <p className="text-gray-500 text-sm mt-1">Enter password to continue</p>
                </div>

                {wrongPassword && (
                    <p className="text-red-400 text-sm text-center mb-4 bg-red-900/20 border border-red-800 rounded-lg py-2">
                        Incorrect password
                    </p>
                )}

                <input
                    type="password"
                    placeholder="Enter admin password"
                    value={passwordInput}
                    onChange={e => setPasswordInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAdminLogin()}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500 mb-4"
                />
                <button
                    onClick={handleAdminLogin}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-xl font-semibold text-white transition"
                >
                    Access Dashboard
                </button>
                <button
                    onClick={() => {
                        if (window.confirm('Delete ALL candidate data? This cannot be undone.')) {
                            fetch('https://ai-interview-backend-a7x2.onrender.com/clear_candidates', {
                                method: 'DELETE',
                                headers: { 'X-Admin-Token': 'admin-secret-2026' }
                            })
                                .then(() => fetchCandidates())
                                .catch(() => alert('Error clearing data'));
                        }
                    }}
                    className="px-4 py-2 bg-red-800 hover:bg-red-700 rounded-lg text-sm font-semibold transition"
                >
                    🗑 Clear All Data
                </button>
            </div>
        </div>
    );

    if (loading) return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-white text-lg">Loading candidates...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
            <div className="text-center">
                <p className="text-red-400 text-lg mb-4">{error}</p>
                <button onClick={fetchCandidates}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-xl text-white font-semibold">
                    Retry
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-950 text-white">

            {/* ── Header ── */}
            <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold">Admin Dashboard</h1>
                    <p className="text-sm text-gray-400">AI Interview Integrity System — Recruiter View</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">{candidates.length} total candidate(s)</span>
                    <button onClick={fetchCandidates}
                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition">
                        ↻ Refresh
                    </button>
                    <button onClick={() => navigate('/')}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-semibold transition">
                        ← Home
                    </button>
                </div>
            </div>

            {/* ── Stats bar ── */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 px-6 py-4 bg-gray-900 border-b border-gray-800">
                {[
                    { label: 'Total', value: candidates.length, color: 'text-white' },
                    { label: 'Safe', value: candidates.filter(c => (c.risk_score || 0) < 20).length, color: 'text-green-400' },
                    { label: 'Suspicious', value: candidates.filter(c => (c.risk_score || 0) >= 40).length, color: 'text-red-400' },
                    { label: 'HR Completed', value: candidates.filter(c => c.hr_completed).length, color: 'text-purple-400' },
                    { label: 'Passed', value: candidates.filter(c => (c.final_score || 0) >= 50).length, color: 'text-teal-400' },
                ].map((s, i) => (
                    <div key={i} className="bg-gray-800 rounded-xl px-5 py-4">
                        <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                        <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* ── Search ── */}
            <div className="px-6 pt-5 pb-3">
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full max-w-sm bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
            </div>

            {/* ── Table ── */}
            <div className="px-6 pb-10">
                {filtered.length === 0 ? (
                    <div className="text-center py-24 text-gray-600">
                        {candidates.length === 0
                            ? 'No candidates yet. Complete an interview first.'
                            : 'No results match your search.'}
                    </div>
                ) : (
                    <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wider">
                                    <th className="text-left px-4 py-3">#</th>
                                    <th className="text-left px-4 py-3">Candidate</th>
                                    <th className="text-left px-4 py-3">Duration</th>
                                    <th className="text-left px-4 py-3">Risk</th>
                                    <th className="text-left px-4 py-3">Coding</th>
                                    <th className="text-left px-4 py-3">Quiz</th>
                                    <th className="text-left px-4 py-3">HR</th>
                                    <th className="text-left px-4 py-3">Final Score</th>
                                    <th className="text-left px-4 py-3">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((c, i) => {
                                    const risk = getRisk(c.risk_score || 0);
                                    const passed = (c.final_score || 0) >= 50;
                                    return (
                                        <tr key={c.id}
                                            className="border-b border-gray-800/50 hover:bg-gray-800/30 transition">

                                            <td className="px-4 py-4 text-gray-500">{i + 1}</td>

                                            <td className="px-4 py-4">
                                                <p className="font-semibold">{c.name || '—'}</p>
                                                <p className="text-gray-500 text-xs mt-0.5">{c.email || '—'}</p>
                                            </td>

                                            <td className="px-4 py-4 text-gray-300">
                                                {formatTime(c.interview_time)}
                                            </td>

                                            <td className="px-4 py-4">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${risk.bg} ${risk.text}`}>
                                                    {c.risk_score || 0} — {risk.label}
                                                </span>
                                            </td>

                                            <td className="px-4 py-4">
                                                {(c.coding_score || 0) > 0 ? (
                                                    <span className="font-semibold text-purple-400">
                                                        {c.coding_score}/30
                                                    </span>
                                                ) : <span className="text-gray-600 text-xs">—</span>}
                                            </td>

                                            <td className="px-4 py-4">
                                                {(c.quiz_score || 0) > 0 ? (
                                                    <div>
                                                        <span className="font-semibold">{c.quiz_score}/10</span>
                                                        <span className="text-gray-500 text-xs ml-1">({c.quiz_percentage}%)</span>
                                                    </div>
                                                ) : <span className="text-gray-600 text-xs">—</span>}
                                            </td>

                                            <td className="px-4 py-4">
                                                {c.hr_completed ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-purple-900/40 text-purple-400">
                                                        ✓ Done
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-600 text-xs">—</span>
                                                )}
                                            </td>

                                            <td className="px-4 py-4">
                                                {c.final_score > 0 ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className={`font-bold text-base ${passed ? 'text-green-400' : 'text-red-400'}`}>
                                                            {c.final_score}/100
                                                        </span>
                                                        <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${getGradeColor(c.final_grade)} bg-gray-800`}>
                                                            {c.final_grade}
                                                        </span>
                                                        <span className={`text-xs ${passed ? 'text-green-500' : 'text-red-500'}`}>
                                                            {passed ? '✓ Pass' : '✗ Fail'}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-600 text-xs">Pending</span>
                                                )}
                                            </td>

                                            <td className="px-4 py-4">
                                                <button
                                                    onClick={() => setSelected(c)}
                                                    className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs font-semibold transition">
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ── Detail popup ── */}
            {selected && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6"
                    onClick={() => setSelected(null)}>
                    <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-2xl max-h-[88vh] overflow-y-auto"
                        onClick={e => e.stopPropagation()}>

                        {/* Popup header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
                            <div>
                                <h2 className="text-lg font-bold">{selected.name}</h2>
                                <p className="text-sm text-gray-400">{selected.email}</p>
                            </div>
                            <button onClick={() => setSelected(null)}
                                className="text-gray-500 hover:text-white text-3xl leading-none transition">
                                ×
                            </button>
                        </div>

                        <div className="px-6 py-5 space-y-4">

                            {/* Final score banner */}
                            {selected.final_score > 0 && (
                                <div className={`rounded-xl p-4 text-center border ${selected.final_score >= 50
                                    ? 'border-green-600 bg-green-900/20'
                                    : 'border-red-600 bg-red-900/20'
                                    }`}>
                                    <p className="text-gray-400 text-xs mb-1">Final Score</p>
                                    <p className={`text-5xl font-bold ${selected.final_score >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                                        {selected.final_score}/100
                                    </p>
                                    <p className={`text-lg font-bold mt-1 ${getGradeColor(selected.final_grade)}`}>
                                        Grade: {selected.final_grade}
                                    </p>
                                    <p className={`text-sm mt-1 ${selected.final_score >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                                        {selected.final_score >= 50 ? '✓ PASSED' : '✗ NOT PASSED'}
                                    </p>
                                </div>
                            )}

                            {/* Score breakdown cards */}
                            <div className="grid grid-cols-4 gap-3">
                                {[
                                    { label: 'Coding', value: `${selected.coding_score || 0}/30`, color: 'text-purple-400' },
                                    { label: 'Quiz', value: `${selected.quiz_score || 0}/10`, color: 'text-amber-400' },
                                    { label: 'HR Round', value: selected.hr_completed ? '30/30' : '0/30', color: selected.hr_completed ? 'text-green-400' : 'text-gray-500' },
                                    { label: 'Risk Score', value: selected.risk_score || 0, color: getRisk(selected.risk_score || 0).text },
                                ].map((s, i) => (
                                    <div key={i} className="bg-gray-800 rounded-xl px-3 py-3 text-center">
                                        <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                                        <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Interview time + status */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-gray-800 rounded-xl px-4 py-3 flex items-center justify-between">
                                    <span className="text-sm text-gray-400">Interview Time</span>
                                    <span className="text-sm font-bold text-blue-400">{formatTime(selected.interview_time)}</span>
                                </div>
                                <div className="bg-gray-800 rounded-xl px-4 py-3 flex items-center justify-between">
                                    <span className="text-sm text-gray-400">Integrity</span>
                                    <span className={`text-sm font-bold ${getRisk(selected.risk_score || 0).text}`}>
                                        {getRisk(selected.risk_score || 0).label}
                                    </span>
                                </div>
                            </div>

                            {/* Quiz progress bar */}
                            <div className="bg-gray-800 rounded-xl px-4 py-3">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-400">Quiz score</span>
                                    <span className="text-sm font-bold text-purple-400">{selected.quiz_percentage || 0}%</span>
                                </div>
                                <div className="h-2 bg-gray-700 rounded-full">
                                    <div
                                        className="h-2 bg-purple-500 rounded-full"
                                        style={{ width: `${selected.quiz_percentage || 0}%` }}
                                    />
                                </div>
                            </div>

                            {/* HR Transcript */}
                            <div>
                                <h3 className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                                    HR Interview Transcript
                                </h3>
                                {selected.hr_transcript ? (
                                    <div className="bg-gray-800 rounded-xl p-4 text-xs text-gray-300 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto font-mono">
                                        {selected.hr_transcript}
                                    </div>
                                ) : (
                                    <div className="bg-gray-800 rounded-xl p-6 text-gray-600 text-sm text-center">
                                        HR interview not completed yet
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}