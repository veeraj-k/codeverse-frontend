import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    problemsSolved: 0,
    successRate: 0,
    averageRuntime: 0,
    rank: 'Beginner',
    streak: 0,
    recentSubmissions: [],
    submissionCalendar: {}
  });
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState([new Date().getFullYear()]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Please log in to view your profile');
        }

        const userId = localStorage.getItem('userId');
        const username = localStorage.getItem('username');

        if (!userId || !username) {
          throw new Error('User information not found. Please log in again.');
        }

        console.log('Fetching submission statistics...', {
          userId,
          username,
          apiUrl: `${import.meta.env.VITE_BE_URL}/api/submission/`
        });
        
        // Fetch daily submission counts
        const dailyCountsResponse = await axios.get(`${import.meta.env.VITE_BE_URL}/api/submission/daily/count`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          params: {
            user_id: userId
          }
        });

        // Process daily counts into calendar data
        const calendarData = {};
        if (Array.isArray(dailyCountsResponse.data)) {
          dailyCountsResponse.data.forEach(item => {
            const date = new Date(item.date).toISOString().split('T')[0];
            calendarData[date] = {
              count: item.count,
              successful: 0 // We don't have success info in this endpoint
            };
          });
        }

        // Fetch regular submissions for other stats
        const submissionsResponse = await axios.get(`${import.meta.env.VITE_BE_URL}/api/submission/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          params: {
            user_id: userId
          }
        });

        if (!submissionsResponse.data) {
          throw new Error('No data received from the server');
        }

        console.log('Submissions response:', submissionsResponse.data);
        // Ensure we have an array of submissions and each submission has required fields
        const submissions = (Array.isArray(submissionsResponse.data) ? submissionsResponse.data : [submissionsResponse.data])
          .map(sub => ({
            ...sub,
            problem: {
              id: sub.problem_id,
              title: sub.problem_title || `Submission #${sub.id}`,
              difficulty: sub.problem_difficulty || 'Unknown'
            },
            status: sub.status || 'Unknown',
            language: sub.language || 'Unknown',
            submitted_at: sub.submitted_at || new Date().toISOString(),
            test_cases_passed: sub.test_cases_passed || 0,
            total_test_cases: sub.total_test_cases || 0
          }));
        console.log('Parsed submissions:', submissions);
        const solvedProblems = new Set();
        let totalRuntime = 0;
        let successfulSubmissions = 0;

        // Sort submissions by date for recent activity
        const sortedSubmissions = [...submissions].sort((a, b) => 
          new Date(b.submitted_at) - new Date(a.submitted_at)
        );

        submissions.forEach(sub => {
          if (sub.test_cases_passed === sub.total_test_cases) {
            solvedProblems.add(sub.problem_id);
            totalRuntime += sub.runtime || 0;
            successfulSubmissions++;
          }
        });

        // Calculate rank based on problems solved
        let rank = 'Beginner';
        if (solvedProblems.size > 50) rank = 'Master';
        else if (solvedProblems.size > 30) rank = 'Expert';
        else if (solvedProblems.size > 20) rank = 'Advanced';
        else if (solvedProblems.size > 10) rank = 'Intermediate';

        setStats({
          totalSubmissions: submissions.length,
          problemsSolved: solvedProblems.size,
          successRate: submissions.length ? (successfulSubmissions / submissions.length) * 100 : 0,
          averageRuntime: solvedProblems.size ? totalRuntime / solvedProblems.size : 0,
          rank,
          streak: calculateStreak(submissions),
          recentSubmissions: sortedSubmissions.slice(0, 5),
          submissionCalendar: calendarData
        });

        // Find all years in the data
        const years = Array.from(new Set(Object.keys(calendarData).map(date => new Date(date).getFullYear())));
        years.sort((a, b) => b - a);
        setAvailableYears(years);
        if (!years.includes(selectedYear)) setSelectedYear(years[0]);

        setLoading(false);
      } catch (err) {
        console.error('Profile Error:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
          headers: err.response?.headers,
          stack: err.stack
        });
        
        let errorMessage = 'Failed to load profile';
        if (err.response?.status === 401) {
          errorMessage = 'Session expired. Please log in again.';
          // Optionally redirect to login
          // navigate('/login');
        } else if (err.response?.status === 404) {
          errorMessage = 'Profile data not found.';
        } else if (err.message.includes('log in')) {
          errorMessage = err.message;
        }
        
        setError(errorMessage);
        setLoading(false);
      }
    };
 
    fetchUserData();
  }, [navigate]);

  const calculateStreak = (submissions) => {
    if (!submissions.length) return 0;
    
    const dates = submissions
      .map(sub => new Date(sub.submitted_at).toDateString())
      .sort((a, b) => new Date(b) - new Date(a));
    
    let streak = 1;
    let currentDate = new Date(dates[0]);
    
    for (let i = 1; i < dates.length; i++) {
      const prevDate = new Date(dates[i]);
      const diffDays = Math.floor((currentDate - prevDate) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        streak++;
        currentDate = prevDate;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const getContributionMatrix = () => {
    // 1. Build a map of date (YYYY-MM-DD) to submission count
    const dateCount = {};
    Object.entries(stats.submissionCalendar).forEach(([date, val]) => {
      // Only include dates from the selected year
      if (new Date(date).getFullYear() === selectedYear) {
        dateCount[date] = val.count;
      }
    });

    // 2. Create a matrix of weeks for the entire year
    const weeks = [];
    const firstDayOfYear = new Date(selectedYear, 0, 1);
    const lastDayOfYear = new Date(selectedYear, 11, 31);
    
    // Start from the Sunday before January 1st
    const startDate = new Date(firstDayOfYear);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    // End on the Saturday after December 31st
    const endDate = new Date(lastDayOfYear);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
    
    // Generate all weeks
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        const dateStr = currentDate.toISOString().split('T')[0];
        week.push({
          date: dateStr,
          count: dateCount[dateStr] || 0,
          hasData: dateCount[dateStr] !== undefined,
          month: currentDate.getMonth()
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }
      weeks.push(week);
    }
    
    return weeks;
  };

  const getColorClass = (count, hasData) => {
    if (!hasData) return 'bg-base-300 opacity-30';
    // GitHub style: 0=gray, 1=light, 2=medium, 3=dark, 4+=darker
    if (count === 0) return 'bg-base-300';
    if (count === 1) return 'bg-green-100';
    if (count === 2) return 'bg-green-300';
    if (count === 3) return 'bg-green-500';
    if (count >= 4) return 'bg-green-700';
    return 'bg-base-300';
  };

  const renderContributionHeatmap = () => {
    const weeks = getContributionMatrix();
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Calculate month labels
    const monthLabels = [];
    let lastMonth = -1;
    
    weeks.forEach((week, weekIndex) => {
      // Find the first day of the week that's in the current year
      const firstDayInYear = week.find(day => new Date(day.date).getFullYear() === selectedYear);
      
      if (firstDayInYear) {
        const currentMonth = firstDayInYear.month;
        if (currentMonth !== lastMonth) {
          monthLabels[weekIndex] = new Date(selectedYear, currentMonth, 1)
            .toLocaleString('default', { month: 'short' });
          lastMonth = currentMonth;
        } else {
          monthLabels[weekIndex] = '';
        }
      } else {
        monthLabels[weekIndex] = '';
      }
    });

    return (
      <div className="bg-base-200 rounded-lg shadow-xl p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
          <h2 className="text-2xl font-bold text-base-content">Submission Activity</h2>
          <div>
            <label htmlFor="year-select" className="mr-2 font-medium">Year:</label>
            <select
              id="year-select"
              className="select select-bordered"
              value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
            >
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="w-full overflow-x-auto">
          <div className="flex flex-col">
            {/* Month labels */}
            <div className="flex ml-12 flex-nowrap">
              {weeks.map((week, i) => (
                <div key={i} className="w-4 text-xs text-base-content/70 text-center">
                  {monthLabels[i]}
                </div>
              ))}
            </div>
            <div className="flex flex-nowrap">
              {/* Days of week labels */}
              <div className="flex flex-col justify-between mr-2 h-[100px]">
                {daysOfWeek.map((d, i) => (
                  <div key={i} className="h-4 text-xs text-base-content/70">{d}</div>
                ))}
              </div>
              {/* Heatmap grid */}
              <div className="flex flex-1 flex-nowrap">
                {weeks.map((week, wi) => (
                  <div key={wi} className={`flex flex-col${monthLabels[wi] && wi !== 0 ? ' ml-2 md:ml-4' : ''}`}>
                    {week.map((day, di) => {
                      const isInYear = new Date(day.date).getFullYear() === selectedYear;
                      const formattedDate = new Date(day.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      });
                      return (
                        <div
                          key={di}
                          className={`w-4 h-4 m-[1px] rounded ${getColorClass(day.count, day.hasData)} ${day.hasData ? 'relative group' : ''}`}
                          style={{ opacity: isInYear ? 1 : 0.2 }}
                        >
                          {day.hasData && (
                            <div className="absolute z-10 hidden group-hover:block bg-base-300 text-base-content px-3 py-2 rounded-lg shadow-lg text-sm whitespace-nowrap -top-12 left-1/2 transform -translate-x-1/2">
                              <div className="font-semibold">{formattedDate}</div>
                              <div className="text-base-content/80">
                                {day.count} submission{day.count !== 1 ? 's' : ''}
                              </div>
                              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 border-8 border-transparent border-t-base-300"></div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
            {/* Legend */}
            <div className="flex items-center gap-1 mt-4 ml-12">
              <span className="text-xs text-base-content/70">Less</span>
              <div className="w-4 h-4 rounded bg-base-300"></div>
              <div className="w-4 h-4 rounded bg-green-100"></div>
              <div className="w-4 h-4 rounded bg-green-300"></div>
              <div className="w-4 h-4 rounded bg-green-500"></div>
              <div className="w-4 h-4 rounded bg-green-700"></div>
              <span className="text-xs text-base-content/70">More</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <span className="loading loading-spinner loading-lg text-blue-500"></span>
          <p className="mt-4 text-base-content/70">Loading profile...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="alert alert-error m-4 shadow-lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <h3 className="font-bold">Error Loading Profile</h3>
          <div className="text-sm">{error}</div>
        </div>
      </motion.div>
    );
  }

  const username = localStorage.getItem('username');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-8 mt-16"
    >
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-base-200 rounded-lg shadow-xl p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="avatar">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold">
                {username?.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-base-content mb-2">{username}</h1>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-50 text-blue-700 border border-blue-200 shadow-sm">
                  {stats.rank}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-50 text-gray-700 border border-gray-200 shadow-sm">
                  Streak: {stats.streak} days
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm">
                  Total Submissions: {stats.totalSubmissions}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="stat bg-base-200 shadow-lg rounded-lg"
          >
            <div className="stat-title text-base-content/70">Problems Solved</div>
            <div className="stat-value text-primary">{stats.problemsSolved}</div>
            <div className="stat-desc text-primary/70">Total solved problems</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="stat bg-base-200 shadow-lg rounded-lg"
          >
            <div className="stat-title text-base-content/70">Success Rate</div>
            <div className="stat-value text-success">{stats.successRate.toFixed(1)}%</div>
            <div className="stat-desc text-success/70">Of all submissions</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="stat bg-base-200 shadow-lg rounded-lg"
          >
            <div className="stat-title text-base-content/70">Average Runtime</div>
            <div className="stat-value text-info">{stats.averageRuntime.toFixed(2)}ms</div>
            <div className="stat-desc text-info/70">For solved problems</div>
          </motion.div>
        </div>

        {/* Submission Calendar */}
        {renderContributionHeatmap()}

        {/* Recent Activity */}
        <div className="bg-base-200 rounded-lg shadow-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-base-content mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {stats.recentSubmissions.map((submission, index) => {
              let dateStr = 'Invalid Date';
              let validDate = false;
              if (submission.submitted_at) {
                const d = new Date(submission.submitted_at);
                if (!isNaN(d.getTime())) {
                  dateStr = d.toLocaleDateString();
                  validDate = true;
                } else {
                  console.warn('Invalid submitted_at in recent activity:', submission.submitted_at, submission);
                }
              } else {
                console.warn('Missing submitted_at in recent activity:', submission);
              }
              const problemTitle = submission.problem?.title || 'Unknown Problem';
              return (
                <div key={index} className="flex items-center gap-4 p-4 bg-base-300 rounded-lg">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    submission.test_cases_passed === submission.total_test_cases 
                      ? 'bg-success/20' 
                      : 'bg-error/20'
                  }`}>
                    <svg className={`w-6 h-6 ${
                      submission.test_cases_passed === submission.total_test_cases 
                        ? 'text-success' 
                        : 'text-error'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-base-content">
                      {submission.test_cases_passed === submission.total_test_cases 
                        ? 'Solved' 
                        : 'Attempted'} {problemTitle}
                    </p>
                    <p className="text-sm text-base-content/70">
                      {validDate ? dateStr : <span className="text-error">Invalid Date</span>} • {submission.language}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold border border-blue-700 shadow-md transition-all duration-200 hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            onClick={() => navigate('/problems')}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Practice Problems
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold border border-indigo-700 shadow-md transition-all duration-200 hover:bg-indigo-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            onClick={() => navigate('/submissions')}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            View Submissions
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile; 