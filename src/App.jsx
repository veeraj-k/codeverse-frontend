import "./App.css";
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from "./context/AuthContext";
import axiosInstance from "./utils/axiosConfig";
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProblemsList from './components/ProblemsList';
import SolveProblem from './pages/SolveProblem';
import Profile from './components/Profile';
import Contests from './pages/Contests';
import ContestProblems from './pages/ContestProblems';
import DiscussionForum from './components/DiscussionForum';
import SubmissionsList from './components/SubmissionsList';

// Make the configured axios instance available globally
window.axios = axiosInstance;

// Create a wrapper component to handle conditional Navbar rendering
const AppContent = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <div className="min-h-screen bg-base-200">
      {!isAuthPage && <Navbar />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/problems" element={<ProblemsList />} />
        <Route path="/problems/:id" element={<SolveProblem />} />
        <Route path="/solve/:id" element={<SolveProblem />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/contests" element={<Contests />} />
        <Route path="/contests/:id" element={<ContestProblems />} />
        <Route path="/discuss" element={<DiscussionForum />} />
        <Route path="/central_forum" element={<DiscussionForum />} />
        <Route path="/submissions" element={<SubmissionsList />} />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
