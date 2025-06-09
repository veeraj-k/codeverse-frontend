import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const Contests = () => {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedContest, setExpandedContest] = useState(null);
  const [problems, setProblems] = useState({});
  const [problemsLoading, setProblemsLoading] = useState(false);
  const navigate = useNavigate();

  const fetchContests = () => {
    axios
      .get(`${import.meta.env.VITE_START_CONTEST_URL}`)
      .then((response) => {
        setContests(response.data.contests || []);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load contests.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchContests();

    const interval = setInterval(() => {
      const now = new Date();
      contests.forEach((contest) => {
        const start = new Date(contest.start_datetime);
        const end = new Date(contest.end_datetime);

        if (
          start <= now &&
          (!contest.problems_id || contest.problems_id.length === 0)
        ) {
          fetchContests(); // re-fetch to get updated problems_id
        }

        if (end <= now && expandedContest === contest.contest_id) {
          // Redirect to contest page when time ends
          navigate(`/contests`);
        }
      });
    }, 300000); // check every 30 seconds

    return () => clearInterval(interval);
  }, [contests, expandedContest, navigate]);

  const handleEnterContest = async (contest) => {
    if (!contest.problems_id || contest.problems_id.length === 0) {
      setError('Contest problems are not available yet');
      return;
    }

    try {
      setProblemsLoading(true);
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      if (!token) {
        console.error('No authentication token found');
        setError('Please log in to enter the contest');
        return;
      }

      if (!userId) {
        console.error('No user ID found');
        setError('Please log in to enter the contest');
        return;
      }

      // First register for the contest using environment variable
      const payload = {
        user_id: parseInt(userId),
        contest_title: contest.template_id
      };

      console.log('Contest object:', contest); // Debug log
      console.log('Template ID:', contest.template_id); // Debug log
      console.log('Sending payload:', JSON.stringify(payload, null, 2)); // Debug log with formatting

      const response = await axios.post(
        import.meta.env.VITE_CONTEST_REGISTRATION,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Contest registration response:', response.data);

      // Store contest data in localStorage for the contest problems page
      localStorage.setItem('currentContest', JSON.stringify({
        contest_id: contest.contest_id,
        contestName: contest.template_id,
        startTime: contest.start_datetime,
        endTime: contest.end_datetime,
        problems: contest.problems_id,
        prize: contest.prize || contest.prizes ? (Array.isArray(contest.prize) ? contest.prize : JSON.parse(contest.prizes)) : []
      }));

      // Navigate to contest problems page
      navigate(`/contests/${contest.contest_id}`);
    } catch (error) {
      console.error('Failed to enter contest:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        data: error.response?.data,
        payload: JSON.stringify(payload, null, 2) // Log the payload that was sent with formatting
      });

      let errorMessage = 'Failed to enter contest';
      if (error.response?.status === 401) {
        errorMessage = 'Session expired. Please log in again.';
        // Don't clear tokens or redirect
        setError(errorMessage);
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
        setError(errorMessage);
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
        setError(errorMessage);
      } else {
        setError(errorMessage);
      }
    } finally {
      setProblemsLoading(false);
    }
  };

  const ongoingContests = contests.filter(
    (c) => Array.isArray(c.problems_id) && c.problems_id.length > 0
  );
  const upcomingContests = contests.filter(
    (c) => !Array.isArray(c.problems_id) || c.problems_id.length === 0
  );

  const renderContests = (contestList, sectionTitle) => (
    <div className="mb-20 pt-24">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto mb-12"
      >
        <h1 className="text-4xl font-bold text-center mb-4 text-base-content">
          {sectionTitle}
        </h1>
        <div className="h-0.5 w-32 bg-gradient-to-r from-base-content/20 via-base-content/40 to-base-content/20 mx-auto rounded-full"></div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start max-w-7xl mx-auto px-4">
        {contestList.map((contest) => {
          const isActive = expandedContest === contest.contest_id;
          const hasProblems =
            Array.isArray(contest.problems_id) &&
            contest.problems_id.length > 0;

          return (
            <motion.div
              key={contest.contest_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`card bg-base-100 shadow-lg border border-base-300 transition-all duration-300 hover:shadow-xl ${
                isActive ? "ring-2 ring-primary" : ""
              }`}
            >
              <div className="card-body p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="card-title text-xl font-bold text-base-content">
                    {contest.contest_id}
                  </h2>
                  <div className="badge badge-primary badge-outline">
                    {hasProblems ? "Active" : "Upcoming"}
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-base-content/70">Start Time</p>
                      <p className="text-base-content font-semibold">
                        {new Date(contest.start_datetime).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                      <svg className="w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-base-content/70">End Time</p>
                      <p className="text-base-content font-semibold">
                        {new Date(contest.end_datetime).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Prizes Section */}
                  {contest.prize && Array.isArray(contest.prize) && contest.prize.length > 0 && (
                    <div className="mt-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-yellow-400/10 flex items-center justify-center">
                          <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM7 10.82C5.84 10.4 5 9.3 5 8V7h2v3.82zM19 8c0 1.3-.84 2.4-2 2.82V7h2v1z" />
                          </svg>
                        </div>
                        <p className="text-sm font-medium text-base-content/70">Prizes</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {contest.prize.map((prize, index) => (
                          <div key={index} className="badge bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 text-white border-none shadow-sm">
                            {prize}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="card-actions justify-end">
                  <button
                    onClick={() => handleEnterContest(contest)}
                    className="btn bg-gradient-to-r from-blue-800 via-indigo-700 to-blue-900 text-white border-none hover:scale-105 transition-transform duration-300"
                    disabled={problemsLoading && expandedContest === contest.contest_id}
                  >
                    {problemsLoading && expandedContest === contest.contest_id ? (
                      <span className="loading loading-spinner loading-sm"></span>
                    ) : (
                      "Enter Contest"
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-base-200">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-base-content/70">Loading contests...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="alert alert-error m-4 shadow-lg max-w-2xl mx-auto mt-20"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <h3 className="font-bold">Error Loading Contests</h3>
          <div className="text-sm">{error}</div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-base-200 text-base-content transition-colors duration-300"
    >
      {renderContests(ongoingContests, "🏆 Active Challenges")}
      {renderContests(upcomingContests, "📅 Scheduled Events")}
      <div className="h-20"></div>
    </motion.div>
  );
};

export default Contests;
