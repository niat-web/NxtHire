// client/src/App.jsx
import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from './hooks/useAuth';

// Layouts (eager — small, used on every route)
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import InterviewerLayout from './layouts/InterviewerLayout';

// Route protection
import Loader from './components/common/Loader';
import AdminRoutes from './router/AdminRoutes';
import InterviewerRoutes from './router/InterviewerRoutes';

// ─── Public pages ────────────────────────────────────────────
const Home                          = lazy(() => import('@/pages/public/Home'));
const Login                         = lazy(() => import('@/pages/public/Login'));
const ApplicationSuccess            = lazy(() => import('@/pages/public/ApplicationSuccess'));
const SkillAssessment               = lazy(() => import('@/pages/public/SkillAssessment'));
const SkillAssessmentSuccess        = lazy(() => import('@/pages/public/SkillAssessmentSuccess'));
const Guidelines                    = lazy(() => import('@/pages/public/Guidelines'));
const GuidelinesSubmissionSuccess   = lazy(() => import('@/pages/public/GuidelinesSubmissionSuccess'));
const CreatePassword                = lazy(() => import('@/pages/public/CreatePassword'));
const ForgotPassword                = lazy(() => import('@/pages/public/ForgotPassword'));
const ResetPassword                 = lazy(() => import('@/pages/public/ResetPassword'));
const PublicBookingPage             = lazy(() => import('@/pages/public/PublicBookingPage'));
const PaymentConfirmationPage       = lazy(() => import('@/pages/public/PaymentConfirmationPage'));
const PaymentReceivedConfirmationPage = lazy(() => import('@/pages/public/PaymentReceivedConfirmationPage'));
const InterviewerApplication        = lazy(() => import('@/pages/public/InterviewerApplication'));
const ApplicationFormPage           = lazy(() => import('@/pages/public/ApplicationFormPage'));
const AboutPage                     = lazy(() => import('@/pages/public/AboutPage'));
const FAQPage                       = lazy(() => import('@/pages/public/FAQPage'));
const TermsOfServicePage            = lazy(() => import('@/pages/public/TermsOfServicePage'));
const CookiePolicyPage              = lazy(() => import('@/pages/public/CookiePolicyPage'));
const DocsPage                      = lazy(() => import('@/pages/DocsPage'));

// ─── Admin pages ─────────────────────────────────────────────
const AdminDashboard                = lazy(() => import('@/pages/admin/Dashboard'));
const HiringPage                    = lazy(() => import('@/pages/admin/HiringPage'));
const BookingsPage                  = lazy(() => import('@/pages/admin/BookingsPage'));
const Interviewers                  = lazy(() => import('@/pages/admin/Interviewers'));
const UserManagement                = lazy(() => import('@/pages/admin/UserManagement'));
const MainSheet                     = lazy(() => import('@/pages/admin/MainSheet'));
const MainSheetForm                 = lazy(() => import('@/pages/admin/MainSheetForm'));
const EmailTrackingPage             = lazy(() => import('@/pages/admin/EmailTrackingPage'));
const DomainManagement              = lazy(() => import('@/pages/admin/DomainManagement'));
const InterviewerBookingTrackingPage = lazy(() => import('@/pages/admin/InterviewerBookingTrackingPage'));
const AdminDomainEvaluationPage     = lazy(() => import('@/pages/admin/AdminDomainEvaluationPage'));
const EarningsReportPage            = lazy(() => import('@/pages/admin/EarningsReportPage'));
const CustomEmailPage               = lazy(() => import('@/pages/admin/CustomEmailPage'));
const NewInterviewBooking           = lazy(() => import('@/pages/admin/NewInterviewBooking'));
const AuthorizeStudentsPage         = lazy(() => import('@/pages/admin/AuthorizeStudentsPage'));
const NotificationsPage             = lazy(() => import('@/pages/admin/NotificationsPage'));
const NotificationsInboxPage        = lazy(() => import('@/pages/admin/NotificationsInboxPage'));
const InterviewerDetailPage         = lazy(() => import('@/pages/admin/InterviewerDetailPage'));
const PublicLinkEvaluationPage      = lazy(() => import('@/pages/admin/PublicLinkEvaluationPage'));
const AdminSettingsPage             = lazy(() => import('@/pages/admin/AdminSettingsPage'));

// ─── Interviewer pages ──────────────────────────────────────
const InterviewerDashboard          = lazy(() => import('@/pages/interviewer/Dashboard'));
const Availability                  = lazy(() => import('@/pages/interviewer/Availability'));
const InterviewEvaluation           = lazy(() => import('@/pages/interviewer/InterviewEvaluation'));
const PaymentDetails                = lazy(() => import('@/pages/interviewer/PaymentDetails.jsx'));
const InterviewerDomainEvaluationPage = lazy(() => import('@/pages/interviewer/InterviewerDomainEvaluationPage'));
const ProvideAvailabilityPage       = lazy(() => import('@/pages/interviewer/ProvideAvailabilityPage'));
const InterviewerSettingsPage       = lazy(() => import('@/pages/interviewer/SettingsPage'));

// Lightweight suspense fallback for code-split chunks
const RouteFallback = () => (
  <div className="flex items-center justify-center min-h-[40vh]">
    <Loader size="lg" />
  </div>
);

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader size="xl" />
      </div>
    );
  }

  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<RouteFallback />}>
        <Routes location={location} key={location.pathname}>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/terms-of-service" element={<TermsOfServicePage />} />
            <Route path="/cookie-policy" element={<CookiePolicyPage />} />
          </Route>

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
      </Suspense>
    </AnimatePresence>
  );
}

export default App;
