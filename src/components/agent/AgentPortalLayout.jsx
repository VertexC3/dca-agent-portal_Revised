import React, { useState } from 'react';
import { createPageUrl } from '../../utils';
import { LogOut, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
const getMockUser = () => {
  const stored = localStorage.getItem('facilityUser');
  if (stored) return JSON.parse(stored);
  return { full_name: "Agent User", email: "agent@dcapharmacy.com", role: "representative", profile_picture: null };
};

export default function AgentPortalLayout({ children, currentPageName }) {
  const [showPlatformSwitcher, setShowPlatformSwitcher] = useState(false);
  const [mockUser, setMockUser] = useState(getMockUser);

  React.useEffect(() => {
    document.title = "DCA Pharmacy - Agent Portal";
  }, []);

  React.useEffect(() => {
    const handleProfileUpdate = () => setMockUser(getMockUser());
    window.addEventListener('facilityProfileUpdated', handleProfileUpdate);
    window.addEventListener('storage', handleProfileUpdate);
    return () => {
      window.removeEventListener('facilityProfileUpdated', handleProfileUpdate);
      window.removeEventListener('storage', handleProfileUpdate);
    };
  }, []);

  return (
    <div className="min-h-screen relative bg-gray-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/90 border-b border-gray-200 shadow-sm">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Logo + Platform Switcher */}
            <div className="relative">
              <DropdownMenu open={showPlatformSwitcher} onOpenChange={setShowPlatformSwitcher}>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 hover:opacity-80 transition-all group">
                    <img
                      src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/user_68b4602065e9569078753897/50e1878da_DCA_Logo_Updated.png"
                      alt="DCA Pharmacy"
                      className="h-10"
                    />
                    <div className="hidden md:block text-left">
                      <p className="text-xs font-bold text-[#8B1F1F] leading-tight">Agent Portal</p>
                      <p className="text-xs text-gray-500 leading-tight">Customer Service</p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-600 group-hover:text-gray-900" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64 bg-white border-gray-200">
                  <div className="px-3 py-2 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Switch Platform</p>
                  </div>
                  {/* Current: Agent Portal */}
                  <DropdownMenuItem className="flex items-center gap-3 bg-red-50 border-l-4 border-[#8B1F1F] py-3">
                    <img
                      src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/user_68b4602065e9569078753897/50e1878da_DCA_Logo_Updated.png"
                      alt="DCA Pharmacy"
                      className="h-8"
                    />
                    <div>
                      <p className="font-semibold text-[#8B1F1F]">Agent Portal</p>
                      <p className="text-xs text-gray-600">DCA Pharmacy (Current)</p>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a href={createPageUrl('PatientDashboard')} className="flex items-center gap-3 cursor-pointer py-3">
                      <img
                        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/user_68b4602065e9569078753897/50e1878da_DCA_Logo_Updated.png"
                        alt="DCA Pharmacy"
                        className="h-8"
                      />
                      <div>
                        <p className="font-semibold text-gray-900">Patient Portal</p>
                        <p className="text-xs text-gray-500">DCA Pharmacy</p>
                      </div>
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a href={createPageUrl('FacilityDashboard')} className="flex items-center gap-3 cursor-pointer py-3">
                      <img
                        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695285fc94e8ef46bde70e16/6281fe319_MochiHealth.png"
                        alt="Mochi Health"
                        className="h-8"
                      />
                      <div>
                        <p className="font-semibold text-gray-900">Facility Portal</p>
                        <p className="text-xs text-gray-500">Mochi Health</p>
                      </div>
                    </a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Right: user */}
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-all">
                    {mockUser.profile_picture ? (
                      <img src={mockUser.profile_picture} alt={mockUser.full_name} className="w-9 h-9 rounded-full object-cover border-2 border-gray-200" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-[#8B1F1F] flex items-center justify-center text-white font-semibold">
                        {mockUser.full_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-white border-gray-200">
                  <div className="px-3 py-2 border-b border-gray-100">
                    <p className="font-semibold text-gray-800">{mockUser.full_name}</p>
                    <p className="text-xs text-gray-500 truncate">{mockUser.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600 cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" />
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 px-6 pb-8">
        <div className="max-w-full">
          {children}
        </div>
      </main>
    </div>
  );
}