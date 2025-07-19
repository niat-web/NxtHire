// client/src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import InterviewerLayout from './layouts/InterviewerLayout';

// Public Pages
import Home from '@/pages/public/Home';
import Login from '@/pages/public/Login';
import ApplicationSuccess from '@/pages/public/ApplicationSuccess';
import SkillAssessment from '@/pages/public/SkillAssessment';
import SkillAssessmentSuccess from '@/pages/public/SkillAssessmentSuccess';
import Guidelines from '@/pages/public/Guidelines';
import GuidelinesSubmissionSuccess from '@/pages/public/GuidelinesSubmissionSuccess';
import CreatePassword from '@/pages/public/CreatePassword';
import ForgotPassword from '@/pages/public/ForgotPassword';
import ResetPassword from '@/pages/public/ResetPassword';
import PublicBookingPage from '@/pages/public/PublicBookingPage';

// Admin Pages
import AdminDashboard from '@/pages/admin/Dashboard';
import Applicants from '@/pages/admin/Applicants';
import LinkedInReviewPage from '@/pages/admin/LinkedInReviewPage';
import SkillCategorizationPage from '@/pages/admin/SkillCategorizationPage';
import AdminGuidelines from '@/pages/admin/Guidelines';
import Interviewers from '@/pages/admin/Interviewers';
import UserManagement from '@/pages/admin/UserManagement';
import InterviewBookings from '@/pages/admin/InterviewBookings';
import BookingSlots from '@/pages/admin/BookingSlots';
import MainSheet from '@/pages/admin/MainSheet';
import MainSheetForm from '@/pages/admin/MainSheetForm'; 
import StudentBookings from '@/pages/admin/StudentBookings';
import EmailTrackingPage from '@/pages/admin/EmailTrackingPage'; // New Import

// Interviewer Pages
import InterviewerDashboard from '@/pages/interviewer/Dashboard';
import Profile from '@/pages/interviewer/Profile';
import Availability from '@/pages/interviewer/Availability';

// Route Protection Components
import AdminRoutes from './router/AdminRoutes';
import InterviewerRoutes from './router/InterviewerRoutes';

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
      </Route>

      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/application-success/:id" element={<ApplicationSuccess />} />
      <Route path="/skill-assessment/:id" element={<SkillAssessment />} />
      <Route path="/skill-assessment-success/:id" element={<SkillAssessmentSuccess />} />
      <Route path="/guidelines/:id" element={<Guidelines />} />
      <Route path="/guidelines-submission-success" element={<GuidelinesSubmissionSuccess />} />
      <Route path="/create-password" element={<CreatePassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      
      {/* New Public Booking Route */}
      <Route path="/book/:publicId" element={<PublicBookingPage />} /> 

      <Route element={<AdminRoutes />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/applicants" element={<Applicants />} />
          <Route path="/admin/main-sheet" element={<MainSheet />} />
          <Route path="/admin/main-sheet/add" element={<MainSheetForm />} />     
          <Route path="/admin/main-sheet/edit/:id" element={<MainSheetForm />} />
          <Route path="/admin/linkedin-review" element={<LinkedInReviewPage />} />
          <Route path="/admin/skill-categorization" element={<SkillCategorizationPage />} />
          <Route path="/admin/guidelines" element={<AdminGuidelines />} />
          <Route path="/admin/interviewers" element={<Interviewers />} />
          <Route path="/admin/user-management" element={<UserManagement />} />
          <Route path="/admin/interview-bookings" element={<InterviewBookings />} />
          <Route path="/admin/booking-slots" element={<BookingSlots />} />
          {/* New Admin Student Bookings Route */}
          <Route path="/admin/student-bookings" element={<StudentBookings />} />
          <Route path="/admin/public-bookings/:id/tracking" element={<EmailTrackingPage />} />
        </Route>
      </Route>

      <Route element={<InterviewerRoutes />}>
        <Route element={<InterviewerLayout />}>
          <Route path="/interviewer" element={<Navigate to="/interviewer/dashboard" replace />} />
          <Route path="/interviewer/dashboard" element={<InterviewerDashboard />} />
          <Route path="/interviewer/profile" element={<Profile />} />
          <Route path="/interviewer/availability" element={<Availability />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;