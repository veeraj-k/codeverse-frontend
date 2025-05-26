import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

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
    <div className="mb-16">
      <h1 className="text-4xl font-extrabold mb-10 text-center bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg">
        {sectionTitle}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 items-start">
        {contestList.map((contest) => {
          const isActive = expandedContest === contest.contest_id;
          const hasProblems =
            Array.isArray(contest.problems_id) &&
            contest.problems_id.length > 0;

          return (
            <div
              key={contest.contest_id}
              className={`card bg-base-100/80 shadow-xl border border-base-300 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-pink-400 ${
                isActive ? "ring-2 ring-pink-400" : ""
              }`}
            >
              <div className="card-body transition-all duration-500 ease-in-out">
                <h2 className="card-title text-2xl font-bold text-indigo-300 mb-2">
                  {contest.contest_id}
                </h2>
                <p>
                  <span className="font-semibold text-purple-300">Start:</span>{" "}
                  {new Date(contest.start_datetime).toLocaleString()}
                </p>
                <p>
                  <span className="font-semibold text-pink-300">End:</span>{" "}
                  {new Date(contest.end_datetime).toLocaleString()}
                </p>
                <p>
                  <span className="font-semibold text-indigo-200">Problems:</span>{" "}
                  {contest.problems_id ? contest.problems_id.length : 0}
                </p>
                {hasProblems && (
                  <button
                    className={`btn btn-primary mt-6 w-full transition-all duration-200 transform hover:scale-105 active:scale-95 bg-gradient-to-r from-indigo-600 to-pink-600 border-0 text-white font-semibold shadow-md`}
                    onClick={() => handleEnterContest(contest)}
                    style={{
                      boxShadow: isActive
                        ? "0 4px 24px 0 rgba(236, 72, 153, 0.2)"
                        : undefined,
                    }}
                  >
                    {isActive ? "Hide" : "Enter Contest"}
                  </button>
                )}
                {isActive && (
                  <div className="transition-all duration-500 ease-in-out overflow-hidden mt-6">
                    {problemsLoading ? (
                      <div className="flex justify-center py-6">
                        <span className="loading loading-spinner loading-md"></span>
                      </div>
                    ) : (
                      <div>
                        <h3 className="font-semibold mb-3 text-lg text-indigo-300">
                          Problems:
                        </h3>
                        <ul className="space-y-3">
                          {contest.problems_id.map((pid) => {
                            const problem = problems[pid];
                            if (!problem)
                              return <li key={pid}>Loading...</li>;
                            if (problem.error)
                              return (
                                <li key={pid} className="text-error">
                                  {problem.error}
                                </li>
                              );
                            return (
                              <li
                                key={pid}
                                className="p-3 bg-base-200 rounded-lg shadow flex flex-col gap-1 border border-base-300 hover:border-pink-400 transition"
                              >
                                <Link
                                  to={`/problems/${pid}`}
                                  className="text-lg font-bold text-indigo-200 hover:text-pink-400 hover:underline transition"
                                >
                                  {problem.title}
                                </Link>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {problem.tags?.map((tag, idx) => (
                                    <span
                                      key={idx}
                                      className="badge badge-outline border-pink-400 text-pink-300 bg-base-100"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

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

  return (
    <div className="min-h-screen bg-base-200 p-8 text-base-content transition-colors duration-300">
      {renderContests(ongoingContests, "🔥 Ongoing Contests")}
      {renderContests(upcomingContests, "🕑 Upcoming Contests")}
    </div>
  );
};

export default Contests;
