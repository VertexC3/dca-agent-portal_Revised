import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { base44 } from './api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Home, MessageSquare, BarChart3, Settings, LogOut, User, Brain, Zap, Pill, X } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import GlobalSearchBar from './components/search/GlobalSearchBar';

export default function Layout({ children, currentPageName }) {
  const [isPatientView, setIsPatientView] = useState(() => {
    return localStorage.getItem('viewMode') === 'patient';
  });
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  React.useEffect(() => {
    document.title = "DCA Pharmacy";
  }, []);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: featureFlags = [] } = useQuery({
    queryKey: ['featureFlags'],
    queryFn: () => base44.entities.FeatureFlag.list(),
  });

  const isFeatureEnabled = (key) => {
    const flag = featureFlags.find(f => f.key === key);
    return flag ? flag.is_enabled : true;
  };

  const handleViewToggle = (isPatient) => {
    setIsPatientView(isPatient);
    localStorage.setItem('viewMode', isPatient ? 'patient' : 'staff');
    
    // Navigate to appropriate dashboard
    if (isPatient) {
      window.location.href = createPageUrl('PatientDashboard');
    } else {
      window.location.href = createPageUrl('Dashboard');
    }
  };

  const adminNavItems = [
    { name: 'Dashboard', icon: Home, page: 'Dashboard' },
    { name: 'Communications', icon: MessageSquare, page: 'Communications' },
    { name: 'Messages', icon: MessageSquare, page: 'StaffMessaging' },
    { name: 'Analytics', icon: BarChart3, page: 'Analytics' },
  ];

  const patientNavItems = [];

  const staffPages = ['Dashboard', 'Communications', 'StaffMessaging', 'Analytics', 'CommunicationDetail', 'AITraining', 'Automation', 'Settings', 'DailyView', 'PrescriptionTrends'];
  const patientPages = ['PatientDashboard', 'PatientProfile', 'PatientMessages', 'PatientCommunications', 'PatientCommunicationDetail', 'Prescriptions', 'PatientLogin'];

  const navItems = isPatientView ? patientNavItems : adminNavItems;

  // Auto-redirect if on wrong page type
  React.useEffect(() => {
    if (isPatientView && staffPages.includes(currentPageName)) {
      window.location.href = createPageUrl('PatientDashboard');
    } else if (!isPatientView && patientPages.includes(currentPageName)) {
      window.location.href = createPageUrl('Dashboard');
    }
  }, [isPatientView, currentPageName]);

  const handleLogout = () => {
    if (isPatientView) {
      window.location.href = createPageUrl('PatientLogin');
    } else {
      base44.auth.logout();
    }
  };

  // If on PatientLogin page, render simplified layout without header/nav
  if (currentPageName === 'PatientLogin') {
    return (
      <div className="min-h-screen relative bg-gray-50">
        <main>
          {children}
        </main>
      </div>
    );
  }

  React.useEffect(() => {
    if (isPatientView && isChatbotOpen) {
      const container = document.getElementById('chatbot-container');
      if (!container) return;

      const iframe = document.createElement('iframe');
      iframe.src = 'https://jessica.teleperson.com/industry/dca';
      iframe.id = 'teleperson-iframe';
      iframe.title = 'Teleperson Concierge';
      iframe.allow = "microphone *";
      iframe.style.borderRadius = "14px";
      iframe.style.border = "none";
      iframe.style.boxShadow = "0 25px 50px -12px rgb(0 0 0 / 0.25)";
      iframe.style.width = "500px";
      iframe.style.height = "600px";
      container.appendChild(iframe);

      return () => {
        if (iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
      };
    }
  }, [isPatientView, isChatbotOpen]);

  return (
    <div className="min-h-screen relative bg-gray-50" style={{ overflowY: 'scroll' }}>
      {/* Header - Already Sticky */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl(isPatientView ? 'PatientDashboard' : 'Dashboard')} className="flex items-center gap-3">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/user_68b4602065e9569078753897/50e1878da_DCA_Logo_Updated.png" 
                alt="DCA Pharmacy" 
                className="h-12"
              />
            </Link>

            {/* View Toggle */}
            <nav className="hidden md:flex items-center gap-4">
              {/* Nav Items */}
              {navItems.map(item => (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    currentPageName === item.page
                      ? 'bg-[#8B1F1F] text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              <GlobalSearchBar maxWidth={isPatientView ? 'max-w-5xl' : 'max-w-2xl'} />

              {/* View Toggle */}
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => handleViewToggle(false)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                    !isPatientView ? 'bg-white text-[#8B1F1F] shadow' : 'text-gray-600'
                  }`}
                >
                  Staff
                </button>
                <button
                  onClick={() => handleViewToggle(true)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                    isPatientView ? 'bg-white text-[#8B1F1F] shadow' : 'text-gray-600'
                  }`}
                >
                  Patient
                </button>
              </div>
              
              <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-all">
                    {user?.profile_picture ? (
                      <img 
                        src={user.profile_picture} 
                        alt={user.full_name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#8B1F1F] flex items-center justify-center text-white font-semibold border-2 border-gray-200">
                        {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-white border-gray-200">
                  <div className="px-3 py-2 border-b border-gray-100">
                    <p className="font-semibold text-gray-800">{user?.full_name || 'User'}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
                  </div>
                  {isPatientView ? (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl('PatientProfile')} className="flex items-center gap-2 cursor-pointer text-gray-700">
                          <User className="w-4 h-4" />
                          My Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl('PatientSettings')} className="flex items-center gap-2 cursor-pointer text-gray-700">
                          <Settings className="w-4 h-4" />
                          Settings
                        </Link>
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl('Settings')} className="flex items-center gap-2 cursor-pointer text-gray-700">
                          <Settings className="w-4 h-4" />
                          Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl('PrescriptionTrends')} className="flex items-center gap-2 cursor-pointer text-gray-700">
                          <Pill className="w-4 h-4" />
                          Rx Trends
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl('Roadmap')} className="flex items-center gap-2 cursor-pointer text-gray-700">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                          </svg>
                          Roadmap
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl('AITraining')} className="flex items-center gap-2 cursor-pointer text-gray-700">
                          <Brain className="w-4 h-4" />
                          AI Training
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl('Automation')} className="flex items-center gap-2 cursor-pointer text-gray-700">
                          <Zap className="w-4 h-4" />
                          Automation
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 cursor-pointer text-red-600">
                    <LogOut className="w-4 h-4" />
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>

      {/* Agent Chatbot - Patient View Only */}
      {isPatientView && (
        <>
          {isChatbotOpen ? (
            <div className="fixed bottom-6 right-6 z-50">
              <button
                onClick={() => setIsChatbotOpen(false)}
                className="absolute -top-3 -right-3 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-all z-10 border border-gray-200"
              >
                <X className="w-5 h-5 text-gray-700" />
              </button>
              <div id="chatbot-container" />
            </div>
          ) : (
            <button
              onClick={() => setIsChatbotOpen(true)}
              className="fixed bottom-6 right-6 z-50 bg-[#8B1F1F] text-white px-6 py-3 rounded-full shadow-lg hover:bg-[#721919] transition-all font-semibold"
            >
              Agent
            </button>
          )}
        </>
      )}
    </div>
  );
}