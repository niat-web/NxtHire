// client/src/layouts/InterviewerLayout.jsx
import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import { FiHome, FiUser, FiCalendar, FiMenu } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';

const InterviewerLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser } = useAuth();
  const location = useLocation();
  
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // WhatsApp Chatbot Integration (code remains the same)
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = 'https://wati-integration-prod-service.clare.ai/v2/watiWidget.js?62685';
    const options = {
        "enabled":true,
        "chatButtonSetting":{"backgroundColor":"#00e785","ctaText":"Chat with us","borderRadius":"25","marginLeft":"0","marginRight":"20","marginBottom":"20","ctaIconWATI":false,"position":"right"},
        "brandSetting":{"brandName":"Wati","brandSubTitle":"undefined","brandImg":"https://www.wati.io/wp-content/uploads/2023/04/Wati-logo.svg","welcomeText":"Hi there!\nHow can I help you?","messageText":"Hello, %0A","backgroundColor":"#00e785","ctaText":"Chat with us","borderRadius":"25","autoShow":false,"phoneNumber":"916303639014"}
    };
    script.onload = () => { if (typeof window.CreateWhatsappChatWidget === 'function') { window.CreateWhatsappChatWidget(options); }};
    document.body.appendChild(script);
    return () => {
      if(document.body.contains(script)){ document.body.removeChild(script); }
      const widgetDiv = document.querySelector('.wa-chat-widget-container');
      if (widgetDiv && widgetDiv.parentNode) { widgetDiv.parentNode.removeChild(widgetDiv); }
    };
  }, []);

  // --- MODIFICATION: Reordered navigation items ---
  const interviewerNavItems = [
    { label: 'Dashboard', path: '/interviewer/dashboard', icon: <FiHome className="w-5 h-5" /> },
    { label: 'Availability', path: '/interviewer/availability', icon: <FiCalendar className="w-5 h-5" /> },
    { label: 'My Profile', path: '/interviewer/profile', icon: <FiUser className="w-5 h-5" /> },
  ];

  const getPageTitle = () => {
    const currentNav = interviewerNavItems.find(item => 
      location.pathname === item.path || 
      (item.path !== '/interviewer/dashboard' && location.pathname.startsWith(item.path))
    );
    return currentNav?.label || 'Interviewer Portal';
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        navItems={interviewerNavItems} 
        isOpen={sidebarOpen} 
        toggleSidebar={toggleSidebar} 
        role="interviewer"
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 lg:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={toggleSidebar}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                <FiMenu className="h-6 w-6" />
              </button>
              
              <div className="ml-4 lg:ml-0">
                <h1 className="text-xl font-semibold text-gray-900">{getPageTitle()}</h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="font-semibold text-blue-600 text-sm">
                    {currentUser?.firstName?.charAt(0) || 'I'}
                  </span>
                </div>
                <div className="ml-3 hidden sm:block">
                  <p className="text-sm font-medium text-gray-700">
                    {currentUser?.firstName} {currentUser?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">Interviewer</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-4 py-6 lg:px-6 lg:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default InterviewerLayout;