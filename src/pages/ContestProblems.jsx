import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useParams, useNavigate } from "react-router-dom";
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
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error m-4">
        <span>{error}</span>
      </div>
    );
  }

  // Only show leaderboard for the specific contest
  const showLeaderboard = true;  // Show leaderboard for all contests

  return (
    <div className="min-h-screen bg-base-200 p-8">
      <div className="flex gap-8">
        {/* Problems Section */}
        <div className="flex-1">
          <h1 className="text-4xl font-extrabold mb-10 text-center bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg">
            {contestId} Problems
          </h1>
          <div className="space-y-4">
            {Object.entries(problems).map(([pid, problem]) => {
              if (problem.error) {
                return (
                  <div key={pid} className="alert alert-error">
                    {problem.error}
                  </div>
                );
              }
              return (
                <div
                  key={pid}
                  className="card bg-base-100 shadow-xl border border-base-300 hover:border-pink-400 transition-all duration-300"
                >
                  <div className="card-body">
                    <Link
                      to={`/problems/${pid}`}
                      className="text-2xl font-bold text-indigo-200 hover:text-pink-400 hover:underline transition"
                    >
                      {problem.title}
                    </Link>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {problem.tags?.map((tag, idx) => (
                        <span
                          key={idx}
                          className="badge badge-outline border-pink-400 text-pink-300 bg-base-100"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Leaderboard Section - Only show for specific contest */}
        {showLeaderboard && (
          <div className="w-[500px] bg-base-100 rounded-lg shadow-xl p-6 h-fit sticky top-8">
            <h2 className="text-2xl font-bold text-center mb-6 text-indigo-300">
              Leaderboard
            </h2>
            <Leaderboard contestTitle={contestId} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ContestProblems; 