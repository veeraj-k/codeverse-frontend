import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import Leaderboard from "../components/Leaderboard";

const ContestProblems = () => {
  const { contestId } = useParams();
  const navigate = useNavigate();
  const [contest, setContest] = useState(null);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLeaderboard, setShowLeaderboard] = useState(true);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [wsConnected, setWsConnected] = useState(false);

  // Fetch initial leaderboard data and then connect to WebSocket
  useEffect(() => {
    let ws = null;

    const initializeLeaderboard = async () => {
      if (!contest || !contest.contestName) {
        console.log('Waiting for contest data to load...');
        return;
      }

      // Ensure we have a valid contest name
      const contestName = contest.contestName || contest.contest_id;
      if (!contestName) {
        console.error('No valid contest name found');
        return;
      }
      
      try {
        // First fetch initial leaderboard data
        const response = await axios.get(
          `${import.meta.env.VITE_LEADERBOARD_URL}/?contest_title=${encodeURIComponent(contestName)}`,
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (response.data && response.data.message && Array.isArray(response.data.message)) {
          console.log('Initial leaderboard data received:', response.data.message);
          setLeaderboardData(response.data.message);
          
          // After getting initial data, connect to WebSocket
          const formattedContestName = contestName.replace(/\s+/g, '_');
          const wsUrl = `${import.meta.env.VITE_LEADERBOARD_WEB_SOCKET}/${formattedContestName}/`;
          console.log('Connecting to WebSocket:', wsUrl);

          // Close existing connection if any
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.close();
          }

          // Create new WebSocket connection
          ws = new WebSocket(wsUrl);
          
          ws.onopen = () => {
            console.log('WebSocket Connected Successfully');
            setWsConnected(true);
          };

          ws.onmessage = (event) => {
            try {
              const data = JSON.parse(event.data);
             
              
              if (data.message && Array.isArray(data.message)) {
                console.log('Updating leaderboard with WebSocket data:', data.message);
                setLeaderboardData(data.message);
              }
            } catch (error) {
              console.error('Error parsing WebSocket message:', error);
            }
          };

          ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            setWsConnected(false);
          };

          ws.onclose = (event) => {
            console.log('WebSocket Disconnected:', event.code, event.reason);
            setWsConnected(false);
          };
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error.response?.data || error.message);
      }
    };

    // Only initialize if we have contest data
    if (contest) {
      
      initializeLeaderboard();
    } else {
      console.log('Waiting for contest data...');
    }

    // Cleanup function
    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        console.log('Closing WebSocket connection on cleanup');
        ws.close();
      }
    };
  }, [contest]);

  // Fetch contest data
  useEffect(() => {
    const loadContestData = async () => {
      try {
        const storedContest = localStorage.getItem('currentContest');
        if (!storedContest) {
          throw new Error('No contest data found');
        }

        const contestData = JSON.parse(storedContest);
        console.log('Loaded contest data:', contestData);
        
        // Handle both prizes and prize fields
        let prizeArray = [];
        if (contestData.prize && Array.isArray(contestData.prize)) {
          prizeArray = contestData.prize;
        } else if (contestData.prizes) {
          try {
            // Handle string format prizes
            if (typeof contestData.prizes === 'string') {
              prizeArray = JSON.parse(contestData.prizes);
            } else if (Array.isArray(contestData.prizes)) {
              prizeArray = contestData.prizes;
            }
          } catch (e) {
            console.error('Error parsing prizes:', e);
          }
        }
        
        const formattedContestData = {
          ...contestData,
          contestName: contestData.contestName || contestData.contest_id,
          startTime: contestData.startTime || contestData.start_datetime,
          endTime: contestData.endTime || contestData.end_datetime,
          prize: prizeArray
        };
        
        console.log('Formatted contest data:', formattedContestData);
        setContest(formattedContestData);

        // Fetch problem details
        const baseUrl = import.meta.env.VITE_BE_URL;
        const token = localStorage.getItem('token');
        
        if (!baseUrl) {
          throw new Error('API base URL is not configured');
        }

        if (!token) {
          console.error('No authentication token found');
          navigate('/login');
          return;
        }

        const problemPromises = formattedContestData.problems.map(async (problemId) => {
          try {
            const url = `${baseUrl}/api/problems/${problemId}`;
            console.log(`Fetching problem ${problemId} from ${url}`);
            
            const response = await axios.get(url, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            if (!response.data) {
              throw new Error('No data received from API');
            }

            console.log(`Problem ${problemId} response:`, response.data);
            return {
              ...response.data,
              id: problemId
            };
          } catch (error) {
            if (error.response?.status === 401) {
              console.error('Authentication failed');
              navigate('/login');
              return null;
            }
            console.error(`Error fetching problem ${problemId}:`, error.response || error);
            return {
              id: problemId,
              title: `Problem ${problemId}`,
              description: 'Problem details not available. Please try again later.',
              difficulty: 'Unknown',
              time_limit: 0,
              memory_limit: 0,
              error: error.response?.data?.message || error.message
            };
          }
        });

        const problemResults = await Promise.all(problemPromises);
        console.log('All problem results:', problemResults);
        
        const validProblems = problemResults.filter(problem => problem !== null);
        console.log('Valid problems:', validProblems);

        if (validProblems.length === 0) {
          throw new Error('No valid problems found for this contest');
        }

        setProblems(validProblems);
        setLoading(false);
      } catch (err) {
        console.error('Error in loadContestData:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    loadContestData();
  }, [contestId, navigate]);

  const handleProblemClick = (problemId) => {
    navigate(`/contests/${contestId}/problems/${problemId}`);
  };

  const handleStartCoding = (problemId) => {
    if (!contest?.contestId) {
      console.error('Contest ID is undefined');
      return;
    }
    navigate(`/solve/${problemId}?contest=${contest.contestId}`);
  };

  const handleSolveClick = (problemId) => {
    navigate(`/solve/${problemId}`);
  };

  // Render leaderboard section
  const renderLeaderboard = () => {
    const currentUser = localStorage.getItem('username');
    const currentUserEntry = leaderboardData?.find(entry => entry.user_name === currentUser);
    const currentUserRank = currentUserEntry ? leaderboardData.indexOf(currentUserEntry) + 1 : null;

    return (
      <div className="bg-base-200 p-6 rounded-lg shadow-lg w-full">
        <h2 className="text-2xl font-bold mb-4 text-base-content">Leaderboard</h2>
        
        {/* Current User Score Card */}
        {currentUserEntry && (
          <div className="bg-primary/10 p-4 rounded-lg mb-6 border-2 border-primary">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-primary mb-2">Your Score</h3>
              <div className="flex justify-center items-center gap-6">
                <div className="text-2xl font-bold text-primary">#{currentUserRank}</div>
                <div className="text-2xl font-bold text-primary">{currentUserEntry.score}</div>
              </div>
            </div>
          </div>
        )}

        <div className="w-full">
          <table className="table w-full">
            <thead>
              <tr>
                <th className="text-base-content w-1/12">Rank</th>
                <th className="text-base-content w-7/12">User</th>
                <th className="text-base-content w-4/12">Score</th>
              </tr>
            </thead>
            <tbody>
              {leaderboardData && leaderboardData.length > 0 ? (
                leaderboardData.map((entry, index) => (
                  <tr 
                    key={entry.user_id} 
                    className={`hover:bg-base-300 ${
                      entry.user_name === currentUser ? 'bg-primary/20 font-semibold' : ''
                    }`}
                  >
                    <td className="text-base-content">{index + 1}</td>
                    <td className="text-base-content">{entry.user_name}</td>
                    <td className="text-base-content">{entry.score}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center text-base-content">No data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="card bg-base-100 shadow-lg max-w-md">
          <div className="card-body">
            <h2 className="card-title text-error">Error</h2>
            <p className="text-base-content/70">{error}</p>
            <div className="card-actions justify-end mt-4">
              <button
                onClick={() => navigate('/contests')}
                className="btn btn-primary btn-lg shadow-lg hover:scale-105 transition-all duration-300"
              >
                Back to Contests
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="card bg-base-100 shadow-lg max-w-md">
          <div className="card-body">
            <h2 className="card-title">Contest Not Found</h2>
            <div className="card-actions justify-end mt-4">
              <button
                onClick={() => navigate('/contests')}
                className="btn btn-primary btn-lg shadow-lg hover:scale-105 transition-all duration-300"
              >
                Back to Contests
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto px-4 pt-20 pb-8">
        {/* Contest Info Section */}
        <div className="bg-base-100 p-6 rounded-lg shadow-lg mb-6 max-w-3xl mx-auto border border-base-300">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-primary/10 px-4 py-1.5 rounded-full">
                <span className="text-primary font-medium text-sm">Weekly Contest</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                <span className="text-base-content/80 text-sm">Active</span>
              </div>
            </div>
            
            <h1 className="text-2xl font-bold mb-4 text-base-content text-center">{contest.contestName}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-6">
              <div className="bg-base-200 p-4 rounded-lg shadow-sm border border-base-300">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-medium text-base-content">Start Time</h3>
                </div>
                <p className="text-base text-base-content/80 pl-10">
                  {new Date(contest.startTime).toLocaleString()}
                </p>
              </div>

              <div className="bg-base-200 p-4 rounded-lg shadow-sm border border-base-300">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-medium text-base-content">End Time</h3>
                </div>
                <p className="text-base text-base-content/80 pl-10">
                  {new Date(contest.endTime).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Prize Section - Only show if there are prizes */}
            {contest.prize && contest.prize.length > 0 && (
              <div className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg shadow-lg border border-blue-100">
                <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
                  <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM7 10.82C5.84 10.4 5 9.3 5 8V7h2v3.82zM19 8c0 1.3-.84 2.4-2 2.82V7h2v1z" />
                  </svg>
                  Contest Prizes
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {contest.prize.map((prize, index) => (
                    <div key={index} className="bg-white p-5 rounded-lg shadow-md border border-blue-100 text-center transform hover:scale-105 transition-all duration-300">
                      <div className="text-4xl mb-3">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                      </div>
                      <div className="text-lg font-semibold text-blue-900 mb-2">
                        {index === 0 ? '1st Place' : index === 1 ? '2nd Place' : '3rd Place'}
                      </div>
                      <div className="text-blue-700 font-bold text-xl">{prize}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Problems and Leaderboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Problems Section */}
          <div className="lg:col-span-2">
            <div className="bg-base-100 p-6 rounded-lg shadow-lg border border-base-300">
              <h2 className="text-xl font-bold mb-4 text-base-content flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Problems
              </h2>
              <div className="space-y-3">
                {problems.map((problem, index) => (
                  <div
                    key={problem.id}
                    className="bg-base-200 p-4 rounded-lg shadow-sm border border-base-300 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold text-base-content mb-1">
                          {problem.title}
                        </h3>
                      </div>
                      <button
                        onClick={() => handleSolveClick(problem.id)}
                        className="btn bg-gradient-to-r from-blue-800 via-indigo-700 to-blue-900 text-white border-none hover:scale-105 transition-transform duration-300"
                      >
                        Solve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Leaderboard Section */}
          <div className="lg:col-span-1">
            {renderLeaderboard()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContestProblems; 
