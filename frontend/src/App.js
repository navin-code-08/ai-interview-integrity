import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import InterviewPlatform from "./pages/InterviewPlatform";
import CodingRound from "./pages/CodingRound";
import EngineeringQuiz from './pages/EngineeringQuiz';
import HRInterview from './pages/HRInterview';
import AdminDashboard from './pages/AdminDashboard';
import FinalScore from './pages/FinalScore';
import AptitudeRound from './pages/AptitudeRound';
function App() {

  return (

    <Router>

      <Routes>

        <Route path="/" element={<LandingPage />} />

        <Route path="/login" element={<Login />} />
        <Route path="/coding" element={<CodingRound />} />

        <Route path="/interview" element={<InterviewPlatform />} />
        <Route path="/quiz" element={<EngineeringQuiz />} />
        <Route path="/hr-interview" element={<HRInterview />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/final-score" element={<FinalScore />} />
        <Route path="/aptitude" element={<AptitudeRound />} />
      </Routes>

    </Router>

  );

}

export default App;