import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { FaArrowLeft, FaCode, FaClock, FaMemory, FaLanguage } from 'react-icons/fa';

const SubmissionResult = ({ submissionId: propSubmissionId, onBackToProblem }) => {
  const { id: paramSubmissionId } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const submissionId = propSubmissionId || paramSubmissionId;

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BE_URL}/api/submission/${submissionId}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        setSubmission(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch submission details');
        setLoading(false);
      }
    };

    fetchSubmission();
  }, [submissionId]);

  const handleBack = () => {
    if (onBackToProblem) {
      onBackToProblem();
    } else {
      navigate(-1);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-4"
        >
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="text-base-content/70">Loading submission details...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 mt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="alert alert-error shadow-lg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </motion.div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="container mx-auto px-4 py-8 mt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="alert alert-warning shadow-lg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>No submission details found</span>
        </motion.div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'accepted':
        return 'bg-success/20 text-success border-success/50';
      case 'wrong answer':
        return 'bg-error/20 text-error border-error/50';
      case 'time limit exceeded':
        return 'bg-warning/20 text-warning border-warning/50';
      default:
        return 'bg-base-content/20 text-base-content border-base-content/50';
    }
  };

  const getDifficultyColor = (rating) => {
    switch (rating) {
      case 1:
        return 'bg-success/20 text-success border-success/50';
      case 2:
        return 'bg-warning/20 text-warning border-warning/50';
      case 3:
        return 'bg-error/20 text-error border-error/50';
      default:
        return 'bg-base-content/20 text-base-content border-base-content/50';
    }
  };

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
          className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
        >
          Submission Result
        </motion.h1>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn btn-primary gap-2"
          onClick={handleBack}
        >
          <FaArrowLeft />
          Back to Problems
        </motion.button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-base-200 shadow-xl"
      >
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <FaCode className="text-primary" />
                  Problem Details
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium opacity-70">Title</h3>
                    <p className="text-lg">{submission.problem?.title || 'N/A'}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium opacity-70">Difficulty</h3>
                    <div className={`inline-block px-4 py-2 rounded-full text-sm font-semibold border ${getDifficultyColor(submission.problem?.rating)}`}>
                      {submission.problem?.rating === 1 ? 'Easy' :
                       submission.problem?.rating === 2 ? 'Medium' :
                       submission.problem?.rating === 3 ? 'Hard' : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <FaCode className="text-primary" />
                  Submission Details
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium opacity-70">Status</h3>
                    <div className={`inline-block px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(submission.status)}`}>
                      {submission.status || 'N/A'}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-lg font-medium opacity-70 flex items-center gap-2">
                        <FaClock className="text-primary" />
                        Runtime
                      </h3>
                      <p className="text-lg">{submission.runtime ? `${submission.runtime} ms` : 'N/A'}</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium opacity-70 flex items-center gap-2">
                        <FaMemory className="text-primary" />
                        Memory
                      </h3>
                      <p className="text-lg">{submission.memory ? `${submission.memory} MB` : 'N/A'}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium opacity-70 flex items-center gap-2">
                      <FaLanguage className="text-primary" />
                      Language
                    </h3>
                    <p className="text-lg">{submission.language || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="divider"></div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <FaCode className="text-primary" />
              Your Code
            </h2>
            <div className="bg-base-300 rounded-lg overflow-hidden">
              <Editor
                height="400px"
                defaultLanguage={submission.language?.toLowerCase()}
                value={submission.code}
                theme="vs-dark"
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  roundedSelection: false,
                  scrollBeyondLastLine: false,
                }}
              />
            </div>
          </div>

          {submission.error_message && (
            <div className="mt-8 space-y-4">
              <h2 className="text-2xl font-semibold text-error flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Error Message
              </h2>
              <div className="bg-error/10 rounded-lg p-4 border border-error/20">
                <pre className="text-error whitespace-pre-wrap font-mono text-sm">
                  {submission.error_message}
                </pre>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SubmissionResult; 
