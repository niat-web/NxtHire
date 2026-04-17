// client/src/App.jsx
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
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
import PaymentConfirmationPage from '@/pages/public/PaymentConfirmationPage';
import PaymentReceivedConfirmationPage from '@/pages/public/PaymentReceivedConfirmationPage';
import InterviewerApplication from '@/pages/public/InterviewerApplication';
import ApplicationFormPage from '@/pages/public/ApplicationFormPage';
import AboutPage from '@/pages/public/AboutPage';
import FAQPage from '@/pages/public/FAQPage';
import TermsOfServicePage from '@/pages/public/TermsOfServicePage';
import CookiePolicyPage from '@/pages/public/CookiePolicyPage';
import DocsPage from '@/pages/DocsPage';

// Admin Pages
import AdminDashboard from '@/pages/admin/Dashboard';
import HiringPage from '@/pages/admin/HiringPage';
import BookingsPage from '@/pages/admin/BookingsPage';
import Interviewers from '@/pages/admin/Interviewers';
import UserManagement from '@/pages/admin/UserManagement';
import MainSheet from '@/pages/admin/MainSheet';
import MainSheetForm from '@/pages/admin/MainSheetForm';
import EmailTrackingPage from '@/pages/admin/EmailTrackingPage';
import DomainManagement from '@/pages/admin/DomainManagement';
import InterviewerBookingTrackingPage from '@/pages/admin/InterviewerBookingTrackingPage';
import AdminDomainEvaluationPage from '@/pages/admin/AdminDomainEvaluationPage';
import EarningsReportPage from '@/pages/admin/EarningsReportPage';
import CustomEmailPage from '@/pages/admin/CustomEmailPage';
import NewInterviewBooking from '@/pages/admin/NewInterviewBooking';
import AuthorizeStudentsPage from '@/pages/admin/AuthorizeStudentsPage';
import NotificationsPage from '@/pages/admin/NotificationsPage';
import NotificationsInboxPage from '@/pages/admin/NotificationsInboxPage';
import InterviewerDetailPage from '@/pages/admin/InterviewerDetailPage';
import PublicLinkEvaluationPage from '@/pages/admin/PublicLinkEvaluationPage';
import AdminSettingsPage from '@/pages/admin/AdminSettingsPage';

// Interviewer Pages
import InterviewerDashboard from '@/pages/interviewer/Dashboard';
import Availability from '@/pages/interviewer/Availability';
import InterviewEvaluation from '@/pages/interviewer/InterviewEvaluation';
import PaymentDetails from '@/pages/interviewer/PaymentDetails.jsx';
import InterviewerDomainEvaluationPage from '@/pages/interviewer/InterviewerDomainEvaluationPage';
import ProvideAvailabilityPage from '@/pages/interviewer/ProvideAvailabilityPage';
import InterviewerSettingsPage from '@/pages/interviewer/SettingsPage';


// Route Protection Components
import Loader from './components/common/Loader';
import AdminRoutes from './router/AdminRoutes';
import InterviewerRoutes from './router/InterviewerRoutes';

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f5f7fb]">
        <Loader size="xl" />
      </div>
    );
  }

  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
    <Routes location={location} key={location.pathname}>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/terms-of-service" element={<TermsOfServicePage />} />
        <Route path="/cookie-policy" element={<CookiePolicyPage />} />
      </Route>

      {/* New route for direct application form */}
      <Route path="/applicationform" element={<ApplicationFormPage />} />
      
      <Route path="/docs" element={<DocsPage />} />
      
      <Route path="/InterviewerApplication" element={<InterviewerApplication />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/application-success/:id" element={<ApplicationSuccess />} />
      <Route path="/skill-assessment/:id" element={<SkillAssessment />} />
      <Route path="/skill-assessment-success/:id" element={<SkillAssessmentSuccess />} />
      <Route path="/guidelines/:id" element={<Guidelines />} />
      <Route path="/guidelines-submission-success" element={<GuidelinesSubmissionSuccess />} />
      <Route path="/create-password" element={<CreatePassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      
      <Route path="/book/:publicId" element={<PublicBookingPage />} /> 
      <Route path="/payment-confirmation" element={<PaymentConfirmationPage />} />
      <Route path="/confirm-payment-received" element={<PaymentReceivedConfirmationPage />} />
      
      <Route element={<AdminRoutes />}>
        {/* ALL ADMIN PAGES IN ADMIN LAYOUT */}
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/hiring/*" element={<HiringPage />} />
          <Route path="/admin/bookings/*" element={<BookingsPage />} />
          <Route path="/admin/public-bookings/:id/authorize" element={<AuthorizeStudentsPage />} />
          <Route path="/admin/main-sheet" element={<MainSheet />} />
          <Route path="/admin/main-sheet/add" element={<MainSheetForm />} />     
          <Route path="/admin/main-sheet/edit/:id" element={<MainSheetForm />} />
          <Route path="/admin/interviewers" element={<Interviewers />} />
          <Route path="/admin/interviewers/:id" element={<InterviewerDetailPage />} />
          <Route path="/admin/user-management" element={<UserManagement />} />
          <Route path="/admin/interview-bookings/:id/tracking" element={<InterviewerBookingTrackingPage />} />
          <Route path="/admin/public-bookings/:id/tracking" element={<EmailTrackingPage />} />
          <Route path="/admin/public-bookings/:id/evaluation" element={<PublicLinkEvaluationPage />} />
          <Route path="/admin/evaluation-setup" element={<DomainManagement />} />
          <Route path="/admin/domain-evaluation" element={<AdminDomainEvaluationPage />} />
          <Route path="/admin/domain-evaluation/:domainName" element={<AdminDomainEvaluationPage />} />
          <Route path="/admin/custom-email" element={<CustomEmailPage />} />
          <Route path="/admin/notifications" element={<NotificationsPage />} />
          <Route path="/admin/notifications-inbox" element={<NotificationsInboxPage />} />
          <Route path="/admin/settings" element={<AdminSettingsPage />} />
          <Route path="/admin/earnings-report/*" element={<EarningsReportPage />} />
          <Route path="/admin/bookings/new" element={<NewInterviewBooking />} />
          <Route path="/admin/bookings/edit/:id" element={<NewInterviewBooking />} />
        </Route>
      </Route>

      <Route element={<InterviewerRoutes />}>
        <Route element={<InterviewerLayout />}>
          <Route path="/interviewer" element={<Navigate to="/interviewer/dashboard" replace />} />
          <Route path="/interviewer/dashboard" element={<InterviewerDashboard />} />
          <Route path="/interviewer/interview-evaluation" element={<InterviewEvaluation />} />
          <Route path="/interviewer/domain-evaluation" element={<InterviewerDomainEvaluationPage />} />
          <Route path="/interviewer/domain-evaluation/:domainName" element={<InterviewerDomainEvaluationPage />} />
          <Route path="/interviewer/settings/*" element={<InterviewerSettingsPage />} />
          <Route path="/interviewer/availability" element={<Availability />} />
          <Route path="/interviewer/provide-availability/:bookingId" element={<ProvideAvailabilityPage />} />
          <Route path="/interviewer/payment-details" element={<PaymentDetails />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </AnimatePresence>
  );
}

export default App;
