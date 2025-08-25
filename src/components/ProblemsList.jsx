import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const ProblemsList = () => {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BE_URL}/api/problems/`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setProblems(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch problems');
        setLoading(false);
      }
    };

    fetchProblems();
  }, []);

  const filteredProblems = problems.filter(problem => {
    const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         problem.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = selectedDifficulty === 'all' || 
                             problem.rating.toString() === selectedDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <span className="loading loading-spinner loading-lg text-primary"></span>
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
        <span>{error}</span>
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
          className="text-4xl font-bold bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 bg-clip-text text-transparent"
        >
          Coding Problems
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
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
            >
              <option value="all">All Levels</option>
              <option value="1">Easy</option>
              <option value="2">Medium</option>
              <option value="3">Hard</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {filteredProblems.map((problem, index) => (
          <motion.div
            key={problem.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card bg-base-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="card-body">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="card-title text-2xl font-semibold text-base-content hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors duration-300">
                    {problem.title}
                  </h2>
                  <div className="flex items-center gap-2 mt-2">
                    <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      problem.rating === 1 
                        ? 'bg-green-400 dark:bg-emerald-900/30 border-2 border-green-500 dark:border-emerald-800' 
                        : problem.rating === 2 
                        ? 'bg-orange-400 dark:bg-amber-900/30 border-2 border-orange-500 dark:border-amber-800'
                        : 'bg-rose-400 dark:bg-red-900/30 border-2 border-rose-500 dark:border-red-800'
                    }`}>
                      <span className="text-[oklch(0.15_0.01_0)] dark:text-emerald-300">{problem.rating === 1 ? 'Easy' :
                       problem.rating === 2 ? 'Medium' :
                       'Hard'}</span> <span className="text-[oklch(0.15_0.01_0)] dark:text-emerald-300">★</span>
                    </div>
                    <div className="text-sm font-medium text-base-content/80 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      {problem.companies.length} companies
                    </div>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 hover:from-blue-800 hover:via-indigo-700 hover:to-blue-900 text-white font-semibold border-none relative overflow-hidden group shadow-lg"
                  onClick={() => navigate(`/problems/${problem.id}`)}
                >
                  <span className="relative z-10">Solve Problem</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-800 via-indigo-700 to-blue-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </motion.button>
              </div>
              
              <p className="text-base-content/90 mt-4 font-medium leading-relaxed">
                {problem.description}
              </p>
              
              <div className="mt-6">
                <div className="flex flex-wrap gap-2 mb-4">
                  {problem.tags.map((tag, index) => (
                    <motion.span
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-3 py-1 rounded-full text-sm font-medium bg-blue-700/10 text-blue-700 dark:text-blue-400 border border-blue-700/20 hover:bg-blue-700/20 transition-all duration-300 cursor-pointer flex items-center gap-1"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      {tag}
                    </motion.span>
                  ))}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {problem.companies.map((company, index) => (
                    <motion.span
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-3 py-1 rounded-full text-sm font-medium bg-indigo-500/10 text-blue-700 dark:text-blue-400 border border-blue-700/20 hover:bg-blue-700/20 transition-all duration-300 flex items-center gap-1"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      {company}
                    </motion.span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default ProblemsList; 