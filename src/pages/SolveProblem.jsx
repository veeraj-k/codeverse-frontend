import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Editor from '@monaco-editor/react';
import DiscussionForum from '../components/DiscussionForum';
import { FaComments, FaCode, FaPlay, FaPaperPlane, FaArrowLeft, FaLightbulb, FaBuilding, FaTag } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import SubmissionResult from '../components/SubmissionResult';

const SolveProblem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState('');
  const [editorTheme, setEditorTheme] = useState('vs-dark');
  const [showAllTestCases, setShowAllTestCases] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [submissionMessage, setSubmissionMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ws, setWs] = useState(null);
  const [showForum, setShowForum] = useState(false);
  const [showSubmissionResult, setShowSubmissionResult] = useState(false);
  const [currentSubmissionId, setCurrentSubmissionId] = useState(null);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        // Fetch problem details
        const problemResponse = await axios.get(
          `${import.meta.env.VITE_BE_URL}/api/problems/${id}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        setProblem(problemResponse.data);

        // Fetch code template
        const codeResponse = await axios.get(
          `${import.meta.env.VITE_BE_URL}/api/problems/${id}/metadata/${language.toLowerCase()}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          }
        );
        setCode(codeResponse.data.evaluator);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch problem details');
        setLoading(false);
      }
    };

    fetchProblem();

    // Cleanup WebSocket connection on component unmount
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [id, language]);

  const handleLanguageChange = async (newLanguage) => {
    setLanguage(newLanguage);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BE_URL}/api/problems/${id}/metadata/${newLanguage.toLowerCase()}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      setCode(response.data.evaluator);
    } catch (err) {
      setError('Failed to fetch code template');
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmissionStatus('submitting');
    setSubmissionMessage('Submitting your solution...');

    try {
      const userId = localStorage.getItem('userId');
      const response = await axios.post(
        `${import.meta.env.VITE_BE_URL}/api/submission/`,
        {
          user_id: parseInt(userId),
          problem_id: parseInt(id),
          language: language.toLowerCase(),
          code: code
        },
        {
          headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
          },
          withCredentials: true
      }
      );

      setCurrentSubmissionId(response.data.submission.id);

      // Connect to WebSocket
      const token = localStorage.getItem('token');
      const wsUrl = `${import.meta.env.VITE_SUBMISSION_URL}/api/submission/status/${response.data.submission.id}`;
      console.log("Connecting to WebSocket:", wsUrl);

      const newWs = new WebSocket(wsUrl, []);

      newWs.onopen = () => {
        console.log("WebSocket connection established");
        setSubmissionMessage('Connected to submission server...');
      };

      newWs.onmessage = (event) => {
        console.log("WebSocket message received:", event.data);
        try {
          const data = JSON.parse(event.data);
          setSubmissionStatus(data.status.toLowerCase());
          setSubmissionMessage(data.message || `Status: ${data.status}`);

          if (data.status === 'COMPLETED' || data.status === 'FAILED') {
            newWs.close();
            setIsSubmitting(false);
            setShowSubmissionResult(true);
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
          setSubmissionStatus('error');
          setSubmissionMessage('Error processing server response');
        }
      };

      newWs.onerror = (error) => {
        console.error("WebSocket error:", error);
        setSubmissionStatus('error');
        setSubmissionMessage('Error connecting to submission server');
        setIsSubmitting(false);
      };

      newWs.onclose = (event) => {
        console.log("WebSocket connection closed:", event.code, event.reason);
      };

      setWs(newWs);
    } catch (err) {
      setSubmissionStatus('error');
      setSubmissionMessage(err.response?.data?.message || 'Submission failed');
      setIsSubmitting(false);
    }
  };

  const getTagColor = (tag) => {
    const colors = {
      'Array': 'from-blue-500 to-cyan-500',
      'String': 'from-green-500 to-emerald-500',
      'Dynamic Programming': 'from-purple-500 to-pink-500',
      'Tree': 'from-orange-500 to-amber-500',
      'Graph': 'from-red-500 to-rose-500',
      'Hash Table': 'from-indigo-500 to-violet-500',
      'Math': 'from-yellow-500 to-orange-500',
      'Sorting': 'from-teal-500 to-cyan-500',
      'Greedy': 'from-pink-500 to-rose-500',
      'Binary Search': 'from-emerald-500 to-green-500',
      'Backtracking': 'from-violet-500 to-purple-500',
      'Stack': 'from-amber-500 to-yellow-500',
      'Queue': 'from-rose-500 to-red-500',
      'Linked List': 'from-cyan-500 to-blue-500',
    };
    return colors[tag] || 'from-primary to-secondary';
  };

  if (showSubmissionResult) {
    return (
      <SubmissionResult 
        submissionId={currentSubmissionId}
        onBackToProblem={() => {
          setShowSubmissionResult(false);
          setSubmissionStatus(null);
          setSubmissionMessage('');
          setCurrentSubmissionId(null);
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-base-200">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-base-content/70">Loading problem details...</p>
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
          <h3 className="font-bold">Error Loading Problem</h3>
          <div className="text-sm">{error}</div>
        </div>
      </motion.div>
    );
  }

  const displayedTestCases = showAllTestCases 
    ? problem.testCases 
    : problem.testCases.slice(0, 3);

  return (
    <div className="min-h-screen bg-base-200 pt-16">
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)]">
        {/* Problem Description Section */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full lg:w-1/2 overflow-y-auto p-4 lg:p-6 bg-base-100"
        >
          <div className="max-w-4xl mx-auto">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/problems')}
              className="btn btn-ghost btn-sm mb-6 gap-2 hover:bg-base-200"
            >
              <FaArrowLeft /> Back to Problems
            </motion.button>

            <div className="space-y-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-indigo-600/10 rounded-3xl blur-3xl -z-10"></div>
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-4xl font-bold mb-4 text-base-content bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
                >
                  {problem.title}
                </motion.h1>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="badge badge-primary gap-2 shadow-lg bg-gradient-to-r from-yellow-500 to-amber-500 border-0"
                  >
                    <FaLightbulb className="text-white" /> {problem.rating} ★
                  </motion.div>
                  {problem.tags.map((tag, index) => (
                    <motion.span 
                      key={index} 
                      whileHover={{ scale: 1.05 }}
                      className={`badge gap-2 shadow-lg border-0 text-white bg-gradient-to-r ${getTagColor(tag)}`}
                    >
                      <FaTag className="text-white/90" /> {tag}
                    </motion.span>
                  ))}
                </div>
              </div>

              <div className="prose max-w-none">
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-lg mb-6 leading-relaxed text-base-content/90"
                >
                  {problem.description}
                </motion.p>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="card bg-base-200 shadow-lg mb-6 hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="card-body">
                    <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2 text-primary">
                      <FaCode className="text-primary" /> Constraints
                    </h2>
                    <ul className="list-disc pl-6 space-y-2">
                      {problem.constraints.map((constraint, index) => (
                        <motion.li 
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + index * 0.1 }}
                          className="text-base-content/80"
                        >
                          {constraint}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="card bg-base-200 shadow-lg mb-6 hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="card-body">
                    <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2 text-primary">
                      <FaPlay className="text-primary" /> Test Cases
                    </h2>
                    <div className="space-y-4">
                      {displayedTestCases.map((testCase, index) => (
                        <motion.div 
                          key={testCase.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6 + index * 0.1 }}
                          className="card bg-base-100 hover:shadow-lg transition-shadow duration-300"
                        >
                          <div className="card-body p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold text-primary">Test Case {index + 1}:</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-base-content/70">Input:</span>
                                  <div className="h-px flex-1 bg-gradient-to-r from-primary/20 to-transparent"></div>
                                </div>
                                <pre className="mt-1 p-3 bg-base-300 rounded-lg font-mono text-sm overflow-x-auto border border-base-300 hover:border-primary/30 transition-colors duration-300">
                                  {JSON.stringify(testCase.input, null, 2)}
                                </pre>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-base-content/70">Output:</span>
                                  <div className="h-px flex-1 bg-gradient-to-r from-primary/20 to-transparent"></div>
                                </div>
                                <pre className="mt-1 p-3 bg-base-300 rounded-lg font-mono text-sm overflow-x-auto border border-base-300 hover:border-primary/30 transition-colors duration-300">
                                  {JSON.stringify(testCase.output.output, null, 2)}
                                </pre>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {problem.testCases.length > 3 && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="btn btn-ghost btn-sm w-full mt-4 hover:bg-primary/10"
                        onClick={() => setShowAllTestCases(!showAllTestCases)}
                      >
                        {showAllTestCases ? 'Show Less' : `Show More (${problem.testCases.length - 3} more)`}
                      </motion.button>
                    )}
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="card bg-base-200 shadow-lg mb-6 hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="card-body">
                    <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2 text-primary">
                      <FaBuilding className="text-primary" /> Companies
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {problem.companies.map((company, index) => (
                        <motion.span 
                          key={index}
                          whileHover={{ scale: 1.05 }}
                          className="badge badge-secondary gap-2 shadow-lg"
                        >
                          <FaBuilding className="text-secondary-content" /> {company}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                </motion.div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn btn-outline btn-info w-full flex items-center gap-2 hover:bg-info/10"
                  onClick={() => setShowForum((prev) => !prev)}
                >
                  <FaComments />
                  {showForum ? 'Hide Discussion Forum' : 'Show Discussion Forum'}
                </motion.button>

                <AnimatePresence>
                  {showForum && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4"
                    >
                      <DiscussionForum problemName={problem?.title} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Code Editor Section */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full lg:w-1/2 bg-base-200 flex flex-col h-[500px] lg:h-auto"
        >
          <div className="p-4 border-b border-base-300 bg-base-100 sticky top-16 z-10 shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="tabs tabs-boxed bg-base-200 w-full sm:w-auto">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`tab ${language === 'python' ? 'tab-active' : ''} hover:bg-primary/10`}
                  onClick={() => handleLanguageChange('python')}
                >
                  Python
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`tab ${language === 'java' ? 'tab-active' : ''} hover:bg-primary/10`}
                  onClick={() => handleLanguageChange('java')}
                >
                  Java
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`tab ${language === 'c' ? 'tab-active' : ''} hover:bg-primary/10`}
                  onClick={() => handleLanguageChange('c')}
                >
                  C
                </motion.button>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn btn-primary btn-sm gap-2 shadow-lg hover:shadow-xl flex-1 sm:flex-none"
                >
                  <FaPlay /> Run
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn btn-accent btn-sm gap-2 shadow-lg hover:shadow-xl flex-1 sm:flex-none"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  <FaPaperPlane />
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </motion.button>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {isSubmitting && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 border-b border-base-300 bg-base-100 sticky top-[7.5rem] z-10 shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <span className={`loading loading-spinner loading-sm ${
                    submissionStatus === 'completed' ? 'text-success' : 
                    submissionStatus === 'failed' ? 'text-error' : ''
                  }`}></span>
                  <span className="text-sm">{submissionMessage}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex-1 overflow-hidden min-h-[300px]">
            <Editor
              height="100%"
              defaultLanguage={language}
              value={code}
              onChange={(value) => setCode(value)}
              theme={editorTheme}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                roundedSelection: false,
                scrollBeyondLastLine: false,
                readOnly: false,
                automaticLayout: true,
                padding: { top: 16, bottom: 16 },
                wordWrap: 'on',
                smoothScrolling: true,
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: true,
                fontFamily: 'JetBrains Mono, monospace',
                bracketPairColorization: { enabled: true },
                guides: { bracketPairs: true },
                renderWhitespace: 'selection',
                renderControlCharacters: true,
                renderIndentGuides: true,
                renderLineHighlight: 'all',
                renderValidationDecorations: 'on',
                scrollbar: {
                  vertical: 'visible',
                  horizontal: 'visible',
                  useShadows: true,
                  verticalScrollbarSize: 10,
                  horizontalScrollbarSize: 10,
                },
              }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SolveProblem; 









 