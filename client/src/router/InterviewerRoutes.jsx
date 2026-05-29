// client/src/router/InterviewerRoutes.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const InterviewerRoutes = () => {
  const { currentUser, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Allow real interviewers AND dual-role admins (admins with alsoInterviewer = true)
  const isAuthorized =
    currentUser?.role === 'interviewer' ||
    (currentUser?.role === 'admin' && currentUser?.alsoInterviewer === true);

  if (!isAuthorized) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default InterviewerRoutes;
