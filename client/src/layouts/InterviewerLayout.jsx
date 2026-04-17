import { useEffect, useMemo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Header from '../components/common/Header';
import PageTransition from '../components/common/PageTransition';
import { Home, Settings, Calendar, Clipboard, Grid } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { useBookingRequests } from '../hooks/useInterviewerQueries';
import { useAlert } from '../hooks/useAlert';
import { cn } from '@/lib/utils';
import { startOfDay } from 'date-fns';

const InterviewerLayout = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const { showInfo } = useAlert();
  const { askPermissionAndSubscribe } = usePushNotifications();

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
  const { data: bookingRequests = [] } = useBookingRequests({
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
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
    <div className="flex h-screen bg-[#f5f7fb]">
      <Sidebar
        navItems={interviewerNavItems}
        variant="interviewer"
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {!useFullPageLayout && (
          <Header />
        )}

        <main className={cn('flex-1', useFullPageLayout ? 'overflow-hidden' : 'overflow-y-auto')}>
          {useFullPageLayout ? (
             <PageTransition className="h-full">
                <Outlet />
             </PageTransition>
          ) : (
            <PageTransition className="container mx-auto">
                <Outlet />
            </PageTransition>
          )}
        </main>
      </div>
    </div>
  );
};

export default InterviewerLayout;
