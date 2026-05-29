import { useEffect, useMemo, useState, Suspense } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Header from '../components/common/Header';
import PageTransition from '../components/common/PageTransition';
import Loader from '../components/common/Loader';
import { Home, Settings, Calendar, Clipboard, Grid, Menu, ArrowRightLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { useBookingRequests } from '../hooks/useInterviewerQueries';
import { useAlert } from '../hooks/useAlert';
import { cn } from '@/lib/utils';
import { startOfDay } from 'date-fns';

// Local fallback for the right pane only — keeps the sidebar fully mounted
// while a lazy-loaded interviewer page chunk is fetching.
const RightPaneFallback = () => (
  <div className="flex items-center justify-center min-h-[40vh]">
    <Loader size="lg" />
  </div>
);

const InterviewerLayout = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { showInfo } = useAlert();
  const { askPermissionAndSubscribe } = usePushNotifications();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  // Dual-role: if this is actually an admin viewing the interviewer side, let them switch back
  const isDualRoleAdmin = currentUser?.role === 'admin' && currentUser?.alsoInterviewer === true;

  useEffect(() => {
    const timer = setTimeout(() => {
        if (
          currentUser?.role === 'interviewer' &&
          'Notification' in window &&
          Notification.permission === 'default'
        ) {
            askPermissionAndSubscribe();
        }
    }, 5000);

    const handleSWMessage = (event) => {
      if (event.data && event.data.type === 'IN_APP_NOTIFICATION') {
        const payload = event.data.payload;
        showInfo(`${payload.title}: ${payload.body}`);
      }
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleSWMessage);
    }

    return () => {
        clearTimeout(timer);
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.removeEventListener('message', handleSWMessage);
        }
    };
  }, [askPermissionAndSubscribe, showInfo, currentUser]);

  // WATI chat widget — just a "Chat with us" button that opens WhatsApp to support number
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = 'https://wati-integration-prod-service.clare.ai/v2/watiWidget.js?62685';
    const options = {
        "enabled":true,
        "chatButtonSetting":{"backgroundColor":"#00e785","ctaText":"Chat with us","borderRadius":"25","marginLeft":"0","marginRight":"20","marginBottom":"20","ctaIconWATI":false,"position":"right"},
        "brandSetting":{"brandName":"Wati","brandSubTitle":"undefined","brandImg":"https://www.wati.io/wp-content/uploads/2023/4/Wati-logo.svg","welcomeText":"Hi there!\nHow can I help you?","backgroundColor":"#00e785","ctaText":"Chat with us","borderRadius":"25","autoShow":false,"phoneNumber":"916303639014"}
    };
    script.onload = () => { if (typeof window.CreateWhatsappChatWidget === 'function') { window.CreateWhatsappChatWidget(options); }};
    document.body.appendChild(script);
    return () => {
      if(document.body.contains(script)){ document.body.removeChild(script); }
      const widgetDiv = document.querySelector('.wa-chat-widget-container');
      if (widgetDiv && widgetDiv.parentNode) { widgetDiv.parentNode.removeChild(widgetDiv); }
    };
  }, []);

  // Fetch active pending availability requests for sidebar badge
  // Sidebar badge counter: lighter polling cadence — socket.io pushes the urgent updates.
  const { data: bookingRequests = [] } = useBookingRequests({
    staleTime: 2 * 60 * 1000,
    refetchInterval: 3 * 60 * 1000,
    refetchIntervalInBackground: false,
  });
  const pendingAvailabilityCount = useMemo(() => {
    const today = startOfDay(new Date());
    return bookingRequests.filter(r =>
      r.status === 'Pending' && r.bookingStatus === 'Open' && startOfDay(new Date(r.bookingDate)) >= today
    ).length;
  }, [bookingRequests]);

  const interviewerNavItems = [
    { section: 'Overview' },
    { label: 'Dashboard', path: '/interviewer/dashboard', icon: <Home className="w-5 h-5" /> },
    { section: 'Work' },
    { label: 'Availability', path: '/interviewer/availability', icon: <Calendar className="w-5 h-5" />, displayCount: pendingAvailabilityCount },
    { label: 'Scheduled Interviews', path: '/interviewer/interview-evaluation', icon: <Clipboard className="w-5 h-5" /> },
    { label: 'Domain Evaluation', path: '/interviewer/domain-evaluation', icon: <Grid className="w-5 h-5" /> },
    { section: 'Account' },
    { label: 'Settings', path: '/interviewer/settings', icon: <Settings className="w-5 h-5" />, hasSubmenu: true },
  ];

  const fullPageLayoutPaths = [
    '/interviewer/domain-evaluation',
    '/interviewer/interview-evaluation',
    '/interviewer/settings',
    '/interviewer/availability',
    '/interviewer/provide-availability'
  ];

  const useFullPageLayout = fullPageLayoutPaths.some(path => location.pathname.startsWith(path));

  return (
    <div className="flex h-screen bg-background antialiased">
      <Sidebar
        navItems={interviewerNavItems}
        variant="interviewer"
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Mobile top bar — hamburger + brand + (optional) dual-role switch. Hidden at lg+. */}
        <header className="lg:hidden bg-card border-b border-border h-14 flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="h-9 w-9 -ml-1 inline-flex items-center justify-center rounded-md text-foreground hover:bg-muted transition-colors"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-baseline gap-1">
              <span className="font-display text-[18px] font-extrabold tracking-tight text-primary leading-none">NXTHIRE</span>
              <span className="inline-block h-1.5 w-1.5 rounded-[2px]" style={{ backgroundColor: 'var(--brave-amber)' }} aria-hidden="true" />
            </div>
          </div>
          {isDualRoleAdmin && (
            <button
              type="button"
              onClick={() => navigate('/admin/dashboard')}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border border-primary/30 bg-primary/5 text-[12px] font-semibold text-primary hover:bg-primary/10 transition-colors"
              title="Switch to Admin view"
            >
              <ArrowRightLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          )}
        </header>

        {!useFullPageLayout && (
          <div className="hidden lg:block relative">
            <Header />
            {isDualRoleAdmin && (
              <button
                type="button"
                onClick={() => navigate('/admin/dashboard')}
                className="absolute right-6 top-1/2 -translate-y-1/2 inline-flex items-center gap-2 h-9 px-3.5 rounded-md border border-primary/30 bg-primary/5 text-[12.5px] font-semibold text-primary hover:bg-primary/10 transition-colors"
                title="Switch to Admin view"
              >
                <ArrowRightLeft className="h-3.5 w-3.5" />
                Switch to Admin
              </button>
            )}
          </div>
        )}

        {/* For full-page-layout interviewer routes, dock the switch button at the top-right floating */}
        {isDualRoleAdmin && useFullPageLayout && (
          <div className="hidden lg:flex justify-end px-6 lg:px-10 pt-3 pb-1 shrink-0 bg-background">
            <button
              type="button"
              onClick={() => navigate('/admin/dashboard')}
              className="inline-flex items-center gap-2 h-8 px-3 rounded-md border border-primary/30 bg-primary/5 text-[12px] font-semibold text-primary hover:bg-primary/10 transition-colors"
              title="Switch to Admin view"
            >
              <ArrowRightLeft className="h-3.5 w-3.5" />
              Switch to Admin
            </button>
          </div>
        )}

        <main className={cn('flex-1 bg-background', useFullPageLayout ? 'overflow-hidden' : 'overflow-y-auto')}>
          {useFullPageLayout ? (
             <PageTransition className="h-full">
                <Suspense fallback={<RightPaneFallback />}>
                  <Outlet />
                </Suspense>
             </PageTransition>
          ) : (
            <PageTransition className="container mx-auto">
                <Suspense fallback={<RightPaneFallback />}>
                  <Outlet />
                </Suspense>
            </PageTransition>
          )}
        </main>
      </div>
    </div>
  );
};

export default InterviewerLayout;
