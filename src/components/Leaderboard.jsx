import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Leaderboard = ({ contestTitle }) => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [currentUserScore, setCurrentUserScore] = useState(null);
  const [ws, setWs] = useState(null);

  useEffect(() => {
    // Fetch initial leaderboard data
    const fetchLeaderboardData = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_LEADERBOARD_URL}`, {
          params: {
            contest_title: contestTitle
          }
        });
        
        if (response.data && response.data.message) {
          setLeaderboardData(response.data.message);
          // Find current user's score
          const userId = localStorage.getItem('userId');
          const currentUser = response.data.message.find(user => user.user_id === parseInt(userId));
          if (currentUser) {
            setCurrentUserScore(currentUser.score);
          }
        }
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
      }
    };

    fetchLeaderboardData();

    // Setup WebSocket connection
    const formattedContestTitle = contestTitle.replace(/ /g, '_');
    const wsUrl = `${import.meta.env.VITE_LEADERBOARD_WEB_SOCKET}/${formattedContestTitle}/`;
    const newWs = new WebSocket(wsUrl);

    newWs.onopen = () => {
      console.log('WebSocket connection established');
    };

    newWs.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    newWs.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Received WebSocket message:', data);
        if (data.message) {
          // Sort the leaderboard data by score in descending order
          const sortedData = [...data.message].sort((a, b) => b.score - a.score);
          setLeaderboardData(sortedData);
          
          // Update current user's score
          const userId = localStorage.getItem('userId');
          const currentUser = sortedData.find(user => user.user_id === parseInt(userId));
          if (currentUser) {
            setCurrentUserScore(currentUser.score);
          }
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    setWs(newWs);

    // Cleanup WebSocket connection
    return () => {
      if (newWs) {
        newWs.close();
      }
    };
  }, [contestTitle]);

  const currentUserId = parseInt(localStorage.getItem('userId'));

  return (
    <div>
      {/* Current User Score Display */}
      {currentUserScore !== null && (
        <div className="mb-6 text-center">
          <h3 className="text-lg font-semibold mb-2 text-indigo-300">Your Score</h3>
          <div className="text-3xl font-bold text-primary">{currentUserScore}</div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th className="text-indigo-300 w-16">Rank</th>
              <th className="text-indigo-300">Username</th>
              <th className="text-indigo-300 w-24">Score</th>
            </tr>
          </thead>
          <tbody>
            {leaderboardData.map((user, index) => {
              const isCurrentUser = parseInt(user.user_id) === currentUserId;
              return (
                <tr 
                  key={user.user_id} 
                  className={`${
                    isCurrentUser 
                      ? 'bg-accent/20 border-l-4 border-accent' 
                      : 'hover:bg-base-200'
                  } transition-colors duration-200`}
                >
                  <td className={isCurrentUser ? 'text-accent font-bold' : ''}>{index + 1}</td>
                  <td className={isCurrentUser ? 'text-accent font-bold' : ''}>{user.user_name}</td>
                  <td className={isCurrentUser ? 'text-accent font-bold' : ''}>{user.score}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard; 