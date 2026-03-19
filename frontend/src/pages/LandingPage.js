import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  // Smooth scroll to section by id
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-gray-950 text-white min-h-screen">

      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/90 backdrop-blur border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <span className="text-lg font-bold text-blue-400">AI Interview Integrity</span>
        <div className="flex items-center gap-6">
          <button onClick={() => scrollTo('features')}
            className="text-gray-300 hover:text-white text-sm transition">
            Features
          </button>
          <button onClick={() => scrollTo('how-it-works')}
            className="text-gray-300 hover:text-white text-sm transition">
            How It Works
          </button>
          <Link to="/login"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
            Start Interview
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="text-center pt-40 pb-32 px-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600">
        <h1 className="text-6xl font-bold">AI Interview Integrity System</h1>
        <p className="mt-6 text-lg max-w-2xl mx-auto text-gray-200">
          A global platform for secure coding interviews, engineering
          assessments, and AI HR interviews monitored with advanced AI.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link to="/login"
            className="bg-black hover:bg-gray-800 text-white px-8 py-4 rounded-xl text-lg font-semibold transition">
            Start Assessment
          </Link>
          <button
            onClick={() => scrollTo('features')}
            className="border border-white hover:bg-white hover:text-gray-900 text-white px-8 py-4 rounded-xl text-lg font-semibold transition">
            Learn More
          </button>
          <button
            onClick={() => navigate('/admin')}
            className="bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white px-8 py-4 rounded-xl text-lg font-semibold transition">
            Admin Dashboard
          </button>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 px-6 max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-4">Platform Features</h2>
        <p className="text-center text-gray-400 mb-16">Everything you need for a secure, fair interview process</p>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: "👁", title: "AI Monitoring", desc: "Detect multiple faces, tab switching, and suspicious activity in real time using face-api.js." },
            { icon: "💻", title: "Coding Challenges", desc: "Solve real programming problems in Python, JavaScript, C, C++ and Java with auto-scoring." },
            { icon: "📝", title: "Engineering Quiz", desc: "50-question bank across Data Structures, Databases, Networking and more. 10 random per session." },
            { icon: "🤖", title: "AI HR Interview", desc: "AI conducts a real conversational interview, follows up on answers, saves full transcript." },
            { icon: "📊", title: "Risk Score", desc: "Automatic integrity scoring based on face detection and tab switching throughout the session." },
            { icon: "🗂", title: "Admin Dashboard", desc: "Recruiters can view all candidate results, scores, risk flags and HR transcripts in one place." },
          ].map((f, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 p-8 rounded-xl hover:border-purple-500 hover:scale-105 transition">
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="text-xl font-semibold mb-3">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="bg-gray-900 py-24 px-6">
        <h2 className="text-4xl font-bold text-center mb-4">How It Works</h2>
        <p className="text-center text-gray-400 mb-16">Four rounds, fully automated, completely monitored</p>
        <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {[
            { step: "01", color: "text-purple-400", title: "Login", desc: "Candidate enters name and email to begin the session." },
            { step: "02", color: "text-blue-400", title: "Coding Round", desc: "3 random coding questions in a live Monaco editor." },
            { step: "03", color: "text-amber-400", title: "Engineering Quiz", desc: "10 random MCQ questions from a 50-question bank." },
            { step: "04", color: "text-green-400", title: "AI HR Interview", desc: "10-exchange conversation with AI interviewer." },
          ].map((s, i) => (
            <div key={i} className="bg-gray-800 p-8 rounded-xl text-center">
              <p className={`text-5xl font-bold mb-4 ${s.color}`}>{s.step}</p>
              <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
              <p className="text-gray-400 text-sm">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── AI Monitoring Section ── */}
      <section className="bg-gradient-to-r from-purple-600 to-indigo-600 py-24 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-bold">Advanced AI Monitoring</h2>
            <p className="mt-6 text-gray-200 leading-relaxed">
              Our AI system continuously monitors candidate behavior during the
              interview. It detects multiple faces, absence from camera, and tab
              switching to ensure a fair and secure assessment.
            </p>
            <ul className="mt-6 space-y-3 text-gray-200">
              {["Face Detection", "Multiple Face Detection", "Tab Switch Detection", "Risk Score Calculation"].map((item, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="text-green-400 font-bold">✔</span> {item}
                </li>
              ))}
            </ul>
            <Link to="/login"
              className="mt-8 inline-block bg-white text-purple-700 font-bold px-8 py-3 rounded-xl hover:bg-gray-100 transition">
              Start Interview
            </Link>
          </div>
          <div className="bg-black/40 p-10 rounded-xl text-center border border-white/20">
            <p className="text-gray-300 text-sm uppercase tracking-wider">Live Monitoring</p>
            <p className="text-5xl font-bold text-green-400 mt-4">Safe</p>
            <p className="text-gray-300 mt-2">Risk Score: 0</p>
            <div className="mt-6 space-y-2 text-sm text-gray-400 text-left">
              <p className="flex items-center gap-2"><span className="text-green-400">●</span> Face detected — 1 person</p>
              <p className="flex items-center gap-2"><span className="text-green-400">●</span> No tab switching</p>
              <p className="flex items-center gap-2"><span className="text-green-400">●</span> Monitoring active</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 text-center px-6">
        <h2 className="text-4xl font-bold">Start Your Secure Interview Today</h2>
        <p className="text-gray-400 mt-4 max-w-xl mx-auto">
          Experience AI-powered interview integrity with coding challenges,
          engineering quizzes, and AI HR interviews.
        </p>
        <div className="mt-8 flex justify-center gap-4 flex-wrap">
          <Link to="/login"
            className="bg-purple-600 hover:bg-purple-700 px-10 py-4 rounded-xl text-lg font-semibold transition">
            Get Started →
          </Link>
          <button onClick={() => navigate('/admin')}
            className="bg-gray-800 hover:bg-gray-700 border border-gray-700 px-10 py-4 rounded-xl text-lg font-semibold transition">
            Admin Dashboard
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-black py-10 text-center text-gray-500 border-t border-gray-800">
        <p className="text-lg font-semibold text-white">AI Interview Integrity System</p>
        <p className="mt-2 text-sm">Secure AI-Monitored Technical Interviews</p>
        <p className="mt-4 text-xs">© 2026 AI Interview Integrity Platform</p>
      </footer>

    </div>
  );
}