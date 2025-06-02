import "./App.css";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from "./context/AuthContext";
import axiosInstance from "./utils/axiosConfig";
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProblemsList from './components/ProblemsList';
import SolveProblem from './pages/SolveProblem';
import ProfilePage from './pages/ProfilePage';

// Make the configured axios instance available globally
window.axios = axiosInstance;

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-base-200">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/problems" element={<ProblemsList />} />
            <Route path="/problems/:id" element={<SolveProblem />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
