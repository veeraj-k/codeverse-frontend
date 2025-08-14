import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Editor from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaCode, FaClock, FaMemory, FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaCalendarAlt, FaCode as FaLanguage, FaChartLine } from 'react-icons/fa';

const SubmissionResult = ({ submissionId: propSubmissionId, onBackToProblem }) => {
  const { id: paramSubmissionId } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ws, setWs] = useState(null);
  const [complexity, setComplexity] = useState(null);

  // Use either prop or URL param for submission ID
  const submissionId = propSubmissionId || paramSubmissionId;

  useEffect(() => {
    const fetchSubmission = async () => {
      if (!submissionId) {
        setError('No submission ID provided');
        setLoading(false);
        return;
      }

      try {
       
        const response = await axios.get(
          `${import.meta.env.VITE_BE_URL}/api/submission/${submissionId}/`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          }
        );

      

        if (!response.data) {
          setError('No submission data received');
          setLoading(false);
          return;
        }

        setSubmission(response.data);

        // Fetch complexity analysis
        try {
          const complexityResponse = await axios.post(
             `${import.meta.env.VITE_DJ_URL}/message_api/comp/`,
            {
              code: response.data.code
            }
          );
          setComplexity(complexityResponse.data.message);
        } catch (complexityError) {
          console.error('Error fetching complexity:', complexityError);
        }

        // If submission is still processing, connect to WebSocket
        if (response.data.status === 'PROCESSING') {
          const wsUrl = `${import.meta.env.VITE_SUBMISSION_URL}/api/submission/status/${submissionId}`;
         
          const newWs = new WebSocket(wsUrl);

          newWs.onopen = () => {
            console.log('Connected to submission server...');
          };

          newWs.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('WebSocket message received:', data);
            setSubmission(prev => ({
              ...prev,
              status: data.status,
              message: data.message || `Status: ${data.status}`
            }));

            if (data.status === 'COMPLETED' || data.status === 'FAILED') {
              newWs.close();
            }
          };

          newWs.onerror = (error) => {
            console.error('WebSocket error:', error);
            setError('Error connecting to submission server');
          };

          setWs(newWs);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching submission:', err);
        setError(
          err.response?.data?.detail || 
          err.response?.data?.message || 
          err.message || 
          'Failed to fetch submission details'
        );
        setLoading(false);
      }
    };

    fetchSubmission();

    // Cleanup WebSocket connection on component unmount
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [submissionId]);

  const handleBack = () => {
    if (onBackToProblem) {
      onBackToProblem();
    } else {
      navigate(-1);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-success';
      case 'FAILED':
        return 'text-error';
      case 'PROCESSING':
        return 'text-warning';
      default:
        return 'text-base-content';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <FaCheckCircle className="text-success" />;
      case 'FAILED':
        return <FaTimesCircle className="text-error" />;
      case 'PROCESSING':
        return <FaExclamationTriangle className="text-warning" />;
      default:
        return null;
    }
  };

  const getLanguageBadge = (language) => {
    const languageColors = {
      'python': 'bg-blue-500/20 text-blue-500 border-blue-500/30',
      'javascript': 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
      'java': 'bg-red-500/20 text-red-500 border-red-500/30',
      'cpp': 'bg-purple-500/20 text-purple-500 border-purple-500/30',
      'c': 'bg-gray-500/20 text-gray-500 border-gray-500/30',
    };

    const color = languageColors[language.toLowerCase()] || 'bg-primary/20 text-primary border-primary/30';
    
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${color}`}>
        {language.charAt(0).toUpperCase() + language.slice(1)}
      </span>
    );
  };

  const getTestStatusBadge = (status) => {
    if (status === 'passed') {
      return (
        <span className="badge badge-success gap-2 px-4 py-3 text-sm font-medium">
          <FaCheckCircle className="text-sm" />
          Passed
        </span>
      );
    }
    
    return (
      <span className="badge badge-error gap-2 px-4 py-3 text-sm font-medium bg-error/10 text-error border border-error/20 hover:bg-error/20 transition-colors duration-300">
        <FaTimesCircle className="text-sm" />
        Failed
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-base-200">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-base-content/70">Loading submission details...</p>
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
          <h3 className="font-bold">Error Loading Submission</h3>
          <div className="text-sm">{error}</div>
        </div>
      </motion.div>
    );
  }

  if (!submission) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="alert alert-warning m-4 shadow-lg max-w-2xl mx-auto mt-20"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div>
          <h3 className="font-bold">No Submission Found</h3>
          <div className="text-sm">The requested submission details could not be found.</div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-base-200 pt-16"
    >
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="relative">
              <h1 className="text-4xl font-bold text-base-content">
                Submission Result
              </h1>
              <motion.div
                className="h-0.5 w-32 bg-gradient-to-r from-base-content/20 via-base-content/40 to-base-content/20 mx-auto rounded-full"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              />
            </div>
          </motion.div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleBack}
            className="btn btn-ghost btn-sm gap-2 hover:bg-base-300"
          >
            <FaArrowLeft /> Back to Problem
          </motion.button>
        </div>

        {/* Status Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8"
        >
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex items-center gap-4">
                {getStatusIcon(submission.status)}
                <div>
                  <h3 className="card-title text-lg">Status</h3>
                  <p className={`text-xl font-semibold ${getStatusColor(submission.status)}`}>
                    {submission.status}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex items-center gap-4">
                <FaCheckCircle className="text-primary" />
                <div>
                  <h3 className="card-title text-lg">Test Cases</h3>
                  <p className="text-xl font-semibold">
                    {submission.test_cases_passed} / {submission.total_test_cases}
                  </p>
                  <p className="text-sm text-base-content/70 mt-1">
                    Accuracy: {Math.round((submission.test_cases_passed / submission.total_test_cases) * 100)}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex items-center gap-4">
                <FaClock className="text-primary" />
                <div>
                  <h3 className="card-title text-lg">Time Complexity</h3>
                  {complexity ? (
                    <p className="text-xl font-semibold text-success">
                      {complexity['time complexity']}
                    </p>
                  ) : (
                    <p className="text-sm text-base-content/70">Analyzing...</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex items-center gap-4">
                <FaMemory className="text-primary" />
                <div>
                  <h3 className="card-title text-lg">Space Complexity</h3>
                  {complexity ? (
                    <p className="text-xl font-semibold text-success">
                      {complexity['space complexity']}
                    </p>
                  ) : (
                    <p className="text-sm text-base-content/70">Analyzing...</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex items-center gap-4">
                <FaCalendarAlt className="text-primary" />
                <div>
                  <h3 className="card-title text-lg">Submitted</h3>
                  <p className="text-xl font-semibold">
                    {new Date(submission.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Code Editor */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card bg-base-100 shadow-xl mb-8"
        >
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FaCode className="text-primary" />
                <h3 className="text-2xl font-semibold">Your Solution</h3>
              </div>
              {getLanguageBadge(submission.language)}
            </div>
            <div className="h-[500px] rounded-lg overflow-hidden border border-base-300">
              <Editor
                height="100%"
                defaultLanguage={submission.language}
                value={submission.code}
                theme="vs-dark"
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  roundedSelection: false,
                  scrollBeyondLastLine: false,
                  fontFamily: 'JetBrains Mono, monospace',
                  wordWrap: 'on',
                  smoothScrolling: true,
                  cursorBlinking: 'smooth',
                  cursorSmoothCaretAnimation: true,
                  bracketPairColorization: { enabled: true },
                  guides: { bracketPairs: true },
                  renderWhitespace: 'selection',
                  renderControlCharacters: true,
                  renderIndentGuides: true,
                  renderLineHighlight: 'all',
                  renderValidationDecorations: 'on',
                }}
              />
            </div>
          </div>
        </motion.div>

        {/* Test Cases */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card bg-base-100 shadow-xl"
        >
          <div className="card-body">
            <h3 className="text-2xl font-semibold mb-6">Test Cases</h3>
            <div className="space-y-6">
              {submission.submission_tests.map((test, index) => (
                <motion.div
                  key={test.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="card bg-base-200 hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="card-body">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold">Test Case {index + 1}</span>
                        {getTestStatusBadge(test.status)}
                      </div>
                      {test.runtime && (
                        <div className="text-sm text-base-content/70">
                          Runtime: {test.runtime} ms
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-base-content/70">Input:</span>
                          <div className="h-px flex-1 bg-gradient-to-r from-primary/20 to-transparent"></div>
                        </div>
                        <pre className="mt-1 p-3 bg-base-300 rounded-lg font-mono text-sm overflow-x-auto border border-base-300 hover:border-primary/30 transition-colors duration-300">
                          {JSON.stringify(test.input, null, 2)}
                        </pre>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-base-content/70">Output:</span>
                          <div className="h-px flex-1 bg-gradient-to-r from-primary/20 to-transparent"></div>
                        </div>
                        <pre className="mt-1 p-3 bg-base-300 rounded-lg font-mono text-sm overflow-x-auto border border-base-300 hover:border-primary/30 transition-colors duration-300">
                          {JSON.stringify(test.output, null, 2)}
                        </pre>
                      </div>
                    </div>

                    {test.stdout && (
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-base-content/70">Console Output:</span>
                          <div className="h-px flex-1 bg-gradient-to-r from-primary/20 to-transparent"></div>
                        </div>
                        <pre className="mt-1 p-3 bg-base-300 rounded-lg font-mono text-sm overflow-x-auto border border-base-300 hover:border-primary/30 transition-colors duration-300">
                          {test.stdout}
                        </pre>
                      </div>
                    )}

                    {test.error && (
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-error">Error:</span>
                          <div className="h-px flex-1 bg-gradient-to-r from-error/20 to-transparent"></div>
                        </div>
                        <pre className="mt-1 p-3 bg-error/10 rounded-lg font-mono text-sm overflow-x-auto border border-error/20 text-error">
                          {test.error}
                        </pre>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SubmissionResult; 