import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
// import Signup from "../pages/Signup";
import Dashboard from "../pages/HomePage";
import Layout from "../components/Layout";
import Signup from "../pages/Signup";
import { useAuth } from "../context/AuthContext"; // Assuming you have an AuthContext
import DiscussionForum from '../components/DiscussionForum';
import ProblemsList from "../components/ProblemsList";
import SolveProblem from "../pages/SolveProblem";
import Contests from "../pages/Contests";
import ContestProblems from "../pages/ContestProblems";
import SubmissionsList from "../components/SubmissionsList";
import SubmissionResult from "../components/SubmissionResult";

const AppRoutes = () => {
  //   const isAuthenticated = !!localStorage.getItem("token");
  const { isAuthenticated, loading } = useAuth();
  if (!loading) {
    return (
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route element={<Layout />}>
          <Route
            path="/dashboard"
            element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
          />
          <Route
            path="/problems"
            element={isAuthenticated ? <ProblemsList /> : <Navigate to="/login" />}
          />
          <Route
            path="/problems/:id"
            element={isAuthenticated ? <SolveProblem /> : <Navigate to="/login" />}
          />
          <Route
            path="/contests"
            element={isAuthenticated ? <Contests /> : <Navigate to="/login" />}
          />
          <Route
            path="/contests/:contestId"
            element={isAuthenticated ? <ContestProblems /> : <Navigate to="/login" />}
          />
          <Route
            path="/central_forum"
            element={isAuthenticated ? <DiscussionForum problemName="central" /> : <Navigate to="/login" />}
          />
          <Route
            path="/problems/:problemId/submissions"
            element={isAuthenticated ? <SubmissionsList /> : <Navigate to="/login" />}
          />
          <Route
            path="/submissions"
            element={isAuthenticated ? <SubmissionsList /> : <Navigate to="/login" />}
          />
          <Route
            path="/submissions/:id"
            element={isAuthenticated ? <SubmissionResult /> : <Navigate to="/login" />}
          />
        </Route>
         
        

        <Route
          path="*"
          element={
            <div className="text-center mt-10 text-xl text-gray-700">
              Page Not Found
            </div>
          }
        />
      </Routes>
    );
  } else {
    return <span className="loading loading-ring loading-xl"></span>;
  }
};

export default AppRoutes;
