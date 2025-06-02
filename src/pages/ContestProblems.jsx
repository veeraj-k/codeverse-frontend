import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Leaderboard from "../components/Leaderboard";

const ContestProblems = () => {
  const { contestId } = useParams();
  const [problems, setProblems] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContestProblems = async () => {
      try {
        // First get the contest details to get problems_id
        const contestResponse = await axios.get(
          `${import.meta.env.VITE_START_CONTEST_URL}`
        );
        
        const contest = contestResponse.data.contests.find(
          (c) => c.contest_id === contestId
        );

        if (!contest || !contest.problems_id) {
          setError("Contest not found or no problems available");
          setLoading(false);
          return;
        }

        const fetchedProblems = {};
        await Promise.all(
          contest.problems_id.map(async (pid) => {
            try {
              const res = await axios.get(
                `${import.meta.env.VITE_BE_URL}/api/problems/${pid}`,
                {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
                }
              );
              fetchedProblems[pid] = res.data;
            } catch (e) {
              fetchedProblems[pid] = { error: "Failed to load problem" };
            }
          })
        );

        setProblems(fetchedProblems);
        setLoading(false);
      } catch (err) {
        setError("Failed to load contest problems");
        setLoading(false);
      }
    };

    fetchContestProblems();
  }, [contestId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-base-200">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-base-content/70">Loading contest problems...</p>
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
          <h3 className="font-bold">Error Loading Contest</h3>
          <div className="text-sm">{error}</div>
        </div>
      </motion.div>
    );
  }

  // Only show leaderboard for the specific contest
  const showLeaderboard = true;  // Show leaderboard for all contests

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-base-200 text-base-content transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Problems Section */}
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto mb-12 relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-purple-600/10 rounded-3xl blur-3xl -z-10"></div>
              <h1 className="text-4xl font-bold text-center mb-4 text-base-content">
                {contestId} Problems
              </h1>
              <div className="h-1 w-24 bg-gradient-to-r from-indigo-600 to-purple-600 mx-auto rounded-full"></div>
            </motion.div>

            <div className="space-y-6">
              {Object.entries(problems).map(([pid, problem], index) => {
                if (problem.error) {
                  return (
                    <motion.div
                      key={pid}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="alert alert-error shadow-lg"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <h3 className="font-bold">Error</h3>
                        <div className="text-sm">{problem.error}</div>
                      </div>
                    </motion.div>
                  );
                }
                return (
                  <motion.div
                    key={pid}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="card bg-base-100 shadow-lg border border-base-300 hover:shadow-xl transition-all duration-300 group"
                  >
                    <div className="card-body p-6 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                          <Link
                            to={`/problems/${pid}`}
                            className="text-2xl font-bold text-base-content hover:text-primary transition group-hover:scale-[1.02] inline-block"
                          >
                            {problem.title}
                          </Link>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="btn bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                            onClick={() => navigate(`/problems/${pid}`)}
                          >
                            Solve Problem
                          </motion.button>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mt-2">
                          {problem.tags?.map((tag, idx) => (
                            <motion.span
                              key={idx}
                              whileHover={{ scale: 1.05 }}
                              className="badge badge-outline border-primary/50 text-primary bg-base-100 hover:bg-primary/10 transition-colors duration-300"
                            >
                              {tag}
                            </motion.span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Leaderboard Section */}
          <div className="lg:w-[400px]">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-base-100 rounded-lg shadow-lg p-6 h-fit sticky top-24"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-purple-600/10 rounded-3xl blur-3xl -z-10"></div>
                <h2 className="text-2xl font-bold text-center mb-6 text-base-content border-b border-base-300 pb-4">
                  Leaderboard
                </h2>
                <div className="relative z-10">
                  <Leaderboard contestTitle={contestId} />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ContestProblems; 