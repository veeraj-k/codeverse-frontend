import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Editor from '@monaco-editor/react';

const SubmissionResult = ({ submissionId: propSubmissionId, onBackToProblem }) => {
  const { id: paramSubmissionId } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ws, setWs] = useState(null);

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
        console.log('Fetching submission with ID:', submissionId);
        console.log('API URL:', `${import.meta.env.VITE_BE_URL}/api/submission/${submissionId}/`);
        
        const response = await axios.get(
          `${import.meta.env.VITE_BE_URL}/api/submission/${submissionId}/`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          }
        );

        console.log('API Response:', response.data);

        if (!response.data) {
          setError('No submission data received');
          setLoading(false);
          return;
        }

        // Process the submission data
        const submissionData = {
          ...response.data,
          language: response.data.programming_language || response.data.language || 'Unknown',
          test_cases_passed: response.data.passed_test_cases || response.data.test_cases_passed || 0,
          total_test_cases: response.data.total_test_cases || 0,
          runtime: response.data.execution_time || response.data.runtime || 0,
          memory: response.data.memory_used || response.data.memory || 0,
          created_at: response.data.submitted_at || response.data.created_at || new Date().toISOString(),
          problem: {
            title: response.data.problem_title || response.data.problem?.title || 'Unknown Problem',
            id: response.data.problem_id || response.data.problem?.id
          },
          submission_tests: response.data.test_results || response.data.submission_tests || [],
          code: response.data.source_code || response.data.code || '',
          error: response.data.error_message || response.data.error || null,
          status: response.data.status || 'unknown'
        };

        console.log('Processed submission data:', submissionData);
        setSubmission(submissionData);

        // If submission is still processing, connect to WebSocket
        if (response.data.status === 'PROCESSING') {
          const wsUrl = response.data.ws_url;
          console.log('Connecting to WebSocket:', wsUrl);
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
        console.error('Error response:', err.response);
        console.error('Error request:', err.request);
        console.error('Error config:', err.config);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error m-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{error}</span>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="alert alert-warning m-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span>No submission details found</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Submission Result</h1>
          <button 
            onClick={handleBack}
            className="btn btn-primary"
          >
            Back to Problem
          </button>
        </div>

        {/* Status Card */}
        <div className="card bg-base-200 mb-6">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold mb-2">
                  Status: <span className={submission.status === 'COMPLETED' ? 'text-success' : 'text-error'}>
                    {submission.status}
                  </span>
                </h2>
                <p className="text-lg">
                  Test Cases: {submission.test_cases_passed} / {submission.total_test_cases} passed
                </p>
              </div>
              <div className="stats shadow">
                <div className="stat">
                  <div className="stat-title">Success Rate</div>
                  <div className="stat-value">
                    {Math.round((submission.test_cases_passed / submission.total_test_cases) * 100)}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Code Editor */}
        <div className="card bg-base-200 mb-6">
          <div className="card-body">
            <h3 className="text-xl font-semibold mb-4">Your Solution</h3>
            <div className="h-[400px]">
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
                }}
              />
            </div>
          </div>
        </div>

        {/* Test Cases */}
        <div className="card bg-base-200">
          <div className="card-body">
            <h3 className="text-xl font-semibold mb-4">Test Cases</h3>
            <div className="space-y-4">
              {submission.submission_tests.map((test, index) => (
                <div key={test.id} className="card bg-base-100">
                  <div className="card-body">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">Test Case {index + 1}</span>
                      <span className={`badge ${test.status === 'passed' ? 'badge-success' : 'badge-error'}`}>
                        {test.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-base-content/70">Input:</span>
                        <pre className="mt-1 p-2 bg-base-200 rounded">
                          {JSON.stringify(test.input, null, 2)}
                        </pre>
                      </div>
                      <div>
                        <span className="text-sm text-base-content/70">Output:</span>
                        <pre className="mt-1 p-2 bg-base-200 rounded">
                          {JSON.stringify(test.output, null, 2)}
                        </pre>
                      </div>
                    </div>
                    {test.stdout && (
                      <div className="mt-2">
                        <span className="text-sm text-base-content/70">Console Output:</span>
                        <pre className="mt-1 p-2 bg-base-200 rounded text-sm">
                          {test.stdout}
                        </pre>
                      </div>
                    )}
                    {test.error && (
                      <div className="mt-2">
                        <span className="text-sm text-error">Error:</span>
                        <pre className="mt-1 p-2 bg-error/10 rounded text-sm text-error">
                          {test.error}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionResult; 