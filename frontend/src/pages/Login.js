import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!name.trim() || !email.trim()) {
      setError('Please fill in both fields.');
      return;
    }

    // Save to localStorage so other pages can use them
    localStorage.setItem('candidateName', name.trim());
    localStorage.setItem('candidateEmail', email.trim());

    // Save to backend database
    fetch('http://127.0.0.1:5000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), email: email.trim() })
    }).catch(err => console.log('Login save error:', err));

    // Go to interview
    navigate('/interview');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white px-6">

      <div className="bg-gray-900 p-10 rounded-xl shadow-lg w-full max-w-md border border-gray-800">

        {/* Header */}
        <h2 className="text-3xl font-bold text-center">
          Candidate Login
        </h2>
        <p className="text-gray-400 text-center mt-2">
          Enter your details to start the assessment
        </p>

        {/* Error message */}
        {error && (
          <p className="mt-4 text-center text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-lg py-2">
            {error}
          </p>
        )}

        {/* Form */}
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>

          <div>
            <label className="block text-sm mb-2 text-gray-300">Full Name</label>
            <input
              type="text"
              placeholder="John Smith"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:border-purple-500 text-white placeholder-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm mb-2 text-gray-300">Email Address</label>
            <input
              type="email"
              placeholder="john@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:border-purple-500 text-white placeholder-gray-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 py-3 rounded-lg text-lg font-semibold transition mt-2"
          >
            Start Interview →
          </button>

        </form>

      </div>

    </div>
  );
}