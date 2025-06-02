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
    }, 30000); // check every 30 seconds

    return () => clearInterval(interval);
  }, [contests, expandedContest, navigate]);

  const handleEnterContest = async (contest) => {
    if (!contest.problems_id || contest.problems_id.length === 0) return;

    try {
      // Call contest registration API
      const userId = localStorage.getItem("userId");
      const response = await axios.post(
        `${import.meta.env.VITE_CONTEST_REGISTRATION}`,
        {
          user_id: parseInt(userId),
          contest_title: contest.contest_id
        }
      );

      // If registration is successful, navigate to contest problems page
      navigate(`/contests/${contest.contest_id}`);
    } catch (error) {
      console.error("Failed to register for contest:", error);
      // You might want to show an error message to the user here
    }
  };

  const ongoingContests = contests.filter(
    (c) => Array.isArray(c.problems_id) && c.problems_id.length > 0
  );
  const upcomingContests = contests.filter(
    (c) => !Array.isArray(c.problems_id) || c.problems_id.length === 0
  );

  const renderContests = (contestList, sectionTitle) => (
    <div className="mb-20 pt-16">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto mb-12"
      >
        <h1 className="text-4xl font-bold text-center mb-4 text-base-content">
          {sectionTitle}
        </h1>
        <div className="h-1 w-24 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full"></div>
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

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                      <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-base-content/70">Problems</p>
                      <p className="text-base-content font-semibold">
                        {contest.problems_id ? contest.problems_id.length : 0}
                      </p>
                    </div>
                  </div>
                </div>

                {hasProblems && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`btn w-full font-semibold ${
                      isActive 
                        ? "btn-outline border-primary text-primary hover:bg-primary/10" 
                        : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0"
                    }`}
                    onClick={() => handleEnterContest(contest)}
                  >
                    {isActive ? "Hide Details" : "Enter Contest"}
                  </motion.button>
                )}

                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-6"
                    >
                      {problemsLoading ? (
                        <div className="flex justify-center py-6">
                          <span className="loading loading-spinner loading-md text-primary"></span>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <h3 className="font-semibold text-lg text-base-content border-b border-base-300 pb-2">
                            Problems
                          </h3>
                          <ul className="space-y-3">
                            {contest.problems_id.map((pid) => {
                              const problem = problems[pid];
                              if (!problem)
                                return (
                                  <li key={pid} className="text-base-content/70">
                                    Loading...
                                  </li>
                                );
                              if (problem.error)
                                return (
                                  <li key={pid} className="text-error">
                                    {problem.error}
                                  </li>
                                );
                              return (
                                <motion.li
                                  key={pid}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  className="p-4 bg-base-200 rounded-lg shadow-sm flex flex-col gap-2 border border-base-300 hover:border-primary transition"
                                >
                                  <Link
                                    to={`/problems/${pid}`}
                                    className="text-lg font-semibold text-base-content hover:text-primary transition"
                                  >
                                    {problem.title}
                                  </Link>
                                  <div className="flex flex-wrap gap-2">
                                    {problem.tags?.map((tag, idx) => (
                                      <motion.span
                                        key={idx}
                                        whileHover={{ scale: 1.05 }}
                                        className="badge badge-sm badge-outline border-primary/50 text-primary bg-base-100"
                                      >
                                        {tag}
                                      </motion.span>
                                    ))}
                                  </div>
                                </motion.li>
                              );
                            })}
                          </ul>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
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
      {renderContests(ongoingContests, "🔥 Ongoing Contests")}
      {renderContests(upcomingContests, "🕑 Upcoming Contests")}
    </motion.div>
  );
};

export default Contests;
