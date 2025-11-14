import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { base44 } from './api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Home, MessageSquare, BarChart3, Settings, LogOut, User, Brain, Zap, Pill } from 'lucide-react';
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
  const [isPatientView, setIsPatientView] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const adminNavItems = [
    { name: 'Dashboard', icon: Home, page: 'Dashboard' },
    { name: 'Communications', icon: MessageSquare, page: 'Communications' },
    { name: 'Analytics', icon: BarChart3, page: 'Analytics' },
  ];

  const patientNavItems = [
    { name: 'Dashboard', icon: Home, page: 'PatientDashboard' },
    { name: 'Prescriptions', icon: Pill, page: 'PatientDashboard' },
    { name: 'Communications', icon: MessageSquare, page: 'PatientCommunications' },
    { name: 'Profile', icon: User, page: 'PatientProfile' },
  ];

  const navItems = isPatientView ? patientNavItems : adminNavItems;

  const handleLogout = () => {
    base44.auth.logout();
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gray-50">
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
              <div className="hidden md:block border-l border-gray-300 pl-3">
                <h1 className="text-gray-800 font-bold text-lg">
                  {isPatientView ? 'Patient Hub' : 'Patient Communication Hub'}
                </h1>
              </div>
            </Link>
            
            <nav className="hidden md:flex items-center gap-4">
              {/* View Toggle */}
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setIsPatientView(false)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                    !isPatientView ? 'bg-white text-[#8B1F1F] shadow' : 'text-gray-600'
                  }`}
                >
                  Staff
                </button>
                <button
                  onClick={() => setIsPatientView(true)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                    isPatientView ? 'bg-white text-[#8B1F1F] shadow' : 'text-gray-600'
                  }`}
                >
                  Patient
                </button>
              </div>

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
              {!isPatientView && <GlobalSearchBar />}
              
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
                  <DropdownMenuItem asChild>
                    <Link to={createPageUrl(isPatientView ? 'PatientProfile' : 'Settings')} className="flex items-center gap-2 cursor-pointer text-gray-700">
                      <Settings className="w-4 h-4" />
                      {isPatientView ? 'My Profile' : 'Settings'}
                    </Link>
                  </DropdownMenuItem>
                  {!isPatientView && (
                    <>
                      <DropdownMenuSeparator />
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
    </div>
  );
}