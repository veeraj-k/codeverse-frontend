import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const SubmissionsList = () => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [stats, setStats] = useState({
    total: 0,
    allPassed: 0,
    partiallyPassed: 0,
    allFailed: 0
  });

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        console.log('Starting to fetch submissions...');
        const token = localStorage.getItem('token');
        console.log('Token available:', !!token);
        
        if (!token) {
          throw new Error('Please log in to view your submissions');
        }

        const userId = localStorage.getItem('userId') || '1';
        console.log('User ID:', userId);

        const url = `${import.meta.env.VITE_BE_URL}/api/submission/`;
        console.log('Fetching from URL:', url);

        const response = await axios.get(url, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          params: {
            user_id: userId
          }
        });

        console.log('API Response:', response.data);
        
        if (!response.data) {
          throw new Error('No data received from the server');
        }

        // Ensure we have an array of submissions and each submission has required fields
        const submissionsData = (Array.isArray(response.data) ? response.data : [response.data])
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

        console.log('Processed submissions data:', submissionsData);
        setSubmissions(submissionsData);
        
        // Calculate stats based on test cases
        const stats = submissionsData.reduce((acc, sub) => {
          acc.total++;
          const accuracy = (sub.test_cases_passed / sub.total_test_cases) * 100;
          
          if (accuracy === 100) {
            acc.allPassed++;
          } else if (accuracy > 0) {
            acc.partiallyPassed++;
          } else {
            acc.allFailed++;
          }
          
          return acc;
        }, { total: 0, allPassed: 0, partiallyPassed: 0, allFailed: 0 });
        
        console.log('Calculated stats:', stats);
        setStats(stats);
        setLoading(false);
      } catch (err) {
        console.error('Detailed error:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
          headers: err.response?.headers,
          config: err.config
        });
        
        let errorMessage = 'Failed to fetch submissions';
        if (err.response) {
          errorMessage = `Server error: ${err.response.status} - ${err.response.data?.message || 'Unknown error'}`;
        } else if (err.request) {
          errorMessage = 'No response from server. Please check your connection.';
        } else {
          errorMessage = err.message || 'An unexpected error occurred';
        }
        
        setError(errorMessage);
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  const filteredSubmissions = submissions
    .filter(submission => {
      const problemTitle = submission.problem?.title?.toLowerCase() || '';
      const submissionStatus = submission.status?.toLowerCase() || '';
      const matchesSearch = problemTitle.includes(searchTerm.toLowerCase());
      const matchesStatus = selectedStatus === 'all' || submissionStatus === selectedStatus.toLowerCase();
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const multiplier = sortOrder === 'desc' ? -1 : 1;
      switch(sortBy) {
        case 'date':
          return multiplier * (new Date(b.submitted_at) - new Date(a.submitted_at));
        case 'runtime':
          return multiplier * ((a.runtime || 0) - (b.runtime || 0));
        case 'memory':
          return multiplier * ((a.memory || 0) - (b.memory || 0));
        default:
          return 0;
      }
    });

  const getStatusColor = (submission) => {
    const accuracy = (submission.test_cases_passed / submission.total_test_cases) * 100;
    
    if (accuracy === 100) {
      return 'bg-success/20 dark:bg-success/10 border-2 border-success dark:border-success/50';
    } else if (accuracy > 0) {
      return 'bg-warning/20 dark:bg-warning/10 border-2 border-warning dark:border-warning/50';
    } else {
      return 'bg-error/20 dark:bg-error/10 border-2 border-error dark:border-error/50';
    }
  };

  const getStatusText = (submission) => {
    const accuracy = (submission.test_cases_passed / submission.total_test_cases) * 100;
    
    if (accuracy === 100) {
      return 'All Tests Passed';
    } else if (accuracy > 0) {
      return 'Partially Passed';
    } else {
      return 'All Tests Failed';
    }
  };

  const getStatusIcon = (submission) => {
    const accuracy = (submission.test_cases_passed / submission.total_test_cases) * 100;
    
    if (accuracy === 100) {
      return (
        <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      );
    } else if (accuracy > 0) {
      return (
        <svg className="w-4 h-4 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    } else {
      return (
        <svg className="w-4 h-4 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
    }
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
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-base-content/70">Loading submissions...</p>
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
          <h3 className="font-bold">Error Loading Submissions</h3>
          <div className="text-sm">{error}</div>
        </div>
      </motion.div>
    );
  }

  if (submissions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto px-4 py-8 mt-16"
      >
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-base-content/70 mb-4">No Submissions Found</h2>
          <p className="text-base-content/50">You haven't made any submissions yet.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-8 mt-16"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <motion.h1
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500 dark:from-indigo-400 dark:via-purple-400 dark:to-indigo-300 bg-clip-text text-transparent"
        >
          My Submissions
        </motion.h1>
        
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="join">
            <div className="relative">
              <input
                type="text"
                placeholder="Search problems..."
                className="input input-bordered join-item w-full md:w-64 pl-10 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-base-content placeholder-base-content/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <select
              className="select select-bordered join-item focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-base-content"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="accepted">Accepted</option>
              <option value="wrong answer">Wrong Answer</option>
              <option value="time limit exceeded">Time Limit Exceeded</option>
            </select>
            <select
              className="select select-bordered join-item focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-base-content"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date">Sort by Date</option>
              <option value="runtime">Sort by Runtime</option>
              <option value="memory">Sort by Memory</option>
            </select>
            <button
              className="btn join-item text-base-content"
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            >
              {sortOrder === 'desc' ? '↓' : '↑'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="stat bg-base-200 shadow-lg rounded-lg"
        >
          <div className="stat-title text-base-content/70">Total Submissions</div>
          <div className="stat-value text-base-content">{stats.total}</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="stat bg-base-200 shadow-lg rounded-lg"
        >
          <div className="stat-title text-base-content/70">All Tests Passed</div>
          <div className="stat-value text-success">{stats.allPassed}</div>
          <div className="stat-desc text-success/70">
            {((stats.allPassed / stats.total) * 100).toFixed(1)}% success rate
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="stat bg-base-200 shadow-lg rounded-lg"
        >
          <div className="stat-title text-base-content/70">Partially Passed</div>
          <div className="stat-value text-warning">{stats.partiallyPassed}</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="stat bg-base-200 shadow-lg rounded-lg"
        >
          <div className="stat-title text-base-content/70">All Tests Failed</div>
          <div className="stat-value text-error">{stats.allFailed}</div>
        </motion.div>
      </div>

      <AnimatePresence>
        <div className="grid gap-6">
          {filteredSubmissions.map((submission, index) => (
            <motion.div
              key={submission.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              className="card bg-base-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="card-body">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="card-title text-2xl font-semibold text-base-content hover:text-primary transition-colors duration-300">
                      {submission.problem.title}
                    </h2>
                    <div className="flex items-center gap-2 mt-2">
                      <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(submission)} flex items-center gap-1`}>
                        {getStatusIcon(submission)}
                        <span className="text-base-content font-medium">{getStatusText(submission)}</span>
                      </div>
                      <div className="text-sm font-medium text-base-content/70 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {submission.language}
                      </div>
                      <div className="text-sm font-medium text-base-content/70 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        {submission.test_cases_passed} / {submission.total_test_cases} passed
                        <span className="text-xs opacity-70">
                          ({((submission.test_cases_passed / submission.total_test_cases) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn bg-gradient-to-r from-primary to-secondary hover:from-primary-focus hover:to-secondary-focus text-primary-content font-semibold border-none relative overflow-hidden group shadow-lg"
                    onClick={() => navigate(`/submissions/${submission.id}`)}
                  >
                    <span className="relative z-10">View Details</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-focus to-secondary-focus opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </motion.button>
                </div>
                
                <div className="mt-4">
                  <div className="flex flex-wrap gap-2">
                    <motion.span
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-3 py-1 rounded-full text-sm font-medium bg-base-300/50 hover:bg-primary/20 text-base-content/70 hover:text-primary border border-base-300 hover:border-primary/30 transition-all duration-300 cursor-pointer flex items-center gap-1"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      {new Date(submission.submitted_at).toLocaleDateString()}
                    </motion.span>
                    <motion.span
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-3 py-1 rounded-full text-sm font-medium bg-base-300/50 hover:bg-primary/20 text-base-content/70 hover:text-primary border border-base-300 hover:border-primary/30 transition-all duration-300 cursor-pointer flex items-center gap-1"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {new Date(submission.submitted_at).toLocaleTimeString()}
                    </motion.span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>
    </motion.div>
  );
};

export default SubmissionsList; 