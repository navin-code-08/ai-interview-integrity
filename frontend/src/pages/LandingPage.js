import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ backgroundColor: '#052e16' }} className="text-white min-h-screen">

      {/* Navbar */}
      <nav style={{ backgroundColor: '#052e16', borderBottom: '1px solid #0f6b38' }}
        className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div style={{ backgroundColor: '#10b981' }}
            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm">
            AI
          </div>
          <span className="font-bold text-white text-lg">Interview Integrity</span>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={() => scrollTo('features')}
            className="text-gray-300 hover:text-white text-sm transition">
            Features
          </button>
          <button onClick={() => scrollTo('how-it-works')}
            className="text-gray-300 hover:text-white text-sm transition">
            How It Works
          </button>
          <button onClick={() => navigate('/login')}
            style={{ backgroundColor: '#10b981' }}
            className="hover:opacity-90 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
            Start Interview
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ backgroundColor: '#052e16' }}
        className="text-center pt-40 pb-32 px-6">
        <div style={{ backgroundColor: '#0a5c36', border: '1px solid #10b981' }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm text-green-300 mb-6">
          <span style={{ backgroundColor: '#10b981' }}
            className="w-2 h-2 rounded-full animate-pulse inline-block" />
          AI Powered Interview Platform — Free for Students
        </div>
        <h1 className="text-6xl font-bold text-white mb-6 leading-tight">
          Practice Interviews<br />
          <span style={{ color: '#10b981' }}>Before The Real One</span>
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10">
          A complete AI monitored interview platform for final year students.
          Code, quiz, and HR interview — all in one place, completely free.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button onClick={() => navigate('/login')}
            style={{ backgroundColor: '#10b981' }}
            className="hover:opacity-90 text-white px-8 py-4 rounded-xl text-lg font-semibold transition">
            Start Assessment →
          </button>
          <button onClick={() => scrollTo('features')}
            style={{ border: '1px solid #10b981', color: '#10b981' }}
            className="hover:bg-green-900/20 px-8 py-4 rounded-xl text-lg font-semibold transition">
            Learn More
          </button>
          <button onClick={() => navigate('/admin')}
            style={{ backgroundColor: '#064e2a', border: '1px solid #0f6b38' }}
            className="hover:opacity-90 text-white px-8 py-4 rounded-xl text-lg font-semibold transition">
            Admin Dashboard
          </button>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-8 mt-16">
          {[
            { num: '4', label: 'Interview Rounds' },
            { num: '50', label: 'Quiz Questions' },
            { num: '100', label: 'Marks Total' },
            { num: 'Free', label: 'Zero Cost' },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <p style={{ color: '#10b981' }} className="text-4xl font-bold">{s.num}</p>
              <p className="text-gray-400 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ backgroundColor: '#064e2a' }} className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-white mb-4">Platform Features</h2>
          <p className="text-center text-gray-400 mb-16">
            Everything you need for a complete interview practice experience
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '👁', title: 'AI Monitoring', desc: 'Real time face detection and tab switch tracking with automatic risk scoring throughout the session.' },
              { icon: '💻', title: 'Coding Round', desc: 'Write real code in VS Code style editor. Supports Python, JavaScript, C, C++ and Java with auto evaluation.' },
              { icon: '🧮', title: 'Aptitude Round', desc: 'Quantitative aptitude and logical reasoning questions to test analytical thinking and problem solving.' },
              { icon: '📝', title: 'Engineering Quiz', desc: '50 questions across Data Structures, Databases, Networking and more. 10 random questions per session.' },
              { icon: '🤖', title: 'AI HR Interview', desc: 'Groq AI conducts a real conversational interview, follows up on answers and saves the full transcript.' },
              { icon: '📊', title: 'Admin Dashboard', desc: 'Faculty and recruiters can view all student scores, risk flags, and HR transcripts in one place.' },
            ].map((f, i) => (
              <div key={i}
                style={{ backgroundColor: '#052e16', border: '1px solid #0f6b38' }}
                className="p-6 rounded-xl hover:border-green-400 transition">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" style={{ backgroundColor: '#052e16' }} className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-white mb-4">How It Works</h2>
          <p className="text-center text-gray-400 mb-16">
            Five rounds, fully automated, completely monitored
          </p>
          <div className="grid md:grid-cols-5 gap-4">
            {[
              { step: '01', color: '#10b981', title: 'Login', desc: 'Enter name and email to begin session' },
              { step: '02', color: '#3b82f6', title: 'Coding Round', desc: '3 random coding questions in live editor' },
              { step: '03', color: '#f59e0b', title: 'Aptitude Round', desc: '10 aptitude and reasoning questions' },
              { step: '04', color: '#8b5cf6', title: 'Engineering Quiz', desc: '10 random MCQ from 50 questions' },
              { step: '05', color: '#ec4899', title: 'AI HR Interview', desc: '10 exchange AI conversation' },
            ].map((s, i) => (
              <div key={i}
                style={{ backgroundColor: '#064e2a', border: '1px solid #0f6b38' }}
                className="p-5 rounded-xl text-center">
                <p style={{ color: s.color }} className="text-4xl font-bold mb-3">{s.step}</p>
                <h3 className="text-sm font-semibold text-white mb-2">{s.title}</h3>
                <p className="text-gray-400 text-xs">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ backgroundColor: '#0a5c36' }} className="py-20 px-6 text-center">
        <h2 className="text-4xl font-bold text-white mb-4">
          Ready to Practice?
        </h2>
        <p className="text-green-200 mb-8 max-w-xl mx-auto">
          Start your practice interview now. Completely free.
          Built by students for students.
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <button onClick={() => navigate('/login')}
            className="bg-white text-green-800 font-bold px-10 py-4 rounded-xl text-lg hover:opacity-90 transition">
            Start Interview →
          </button>
          <button onClick={() => navigate('/admin')}
            style={{ border: '2px solid white' }}
            className="text-white font-bold px-10 py-4 rounded-xl text-lg hover:bg-white/10 transition">
            Admin Dashboard
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: '#052e16', borderTop: '1px solid #0f6b38' }}
        className="py-8 text-center">
        <p className="text-lg font-bold text-white">AI Interview Integrity System</p>
        <p className="text-gray-400 text-sm mt-1">
          Built by second year students · Free for all students
        </p>
        <p className="text-gray-600 text-xs mt-3">© 2026 AI Interview Integrity Platform</p>
      </footer>

    </div>
  );
}