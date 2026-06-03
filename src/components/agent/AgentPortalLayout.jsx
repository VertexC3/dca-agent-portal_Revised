import React, { useState } from 'react';
import { LogOut, BookOpen } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import ProfileEditDialog from './ProfileEditDialog';
import SoftPhone from './SoftPhone';

const getMockUser = () => {
  const stored = localStorage.getItem('facilityUser');
  if (stored) return JSON.parse(stored);
  return { full_name: "Agent User", email: "agent@dcapharmacy.com", role: "representative", profile_picture: null };
};

export default function AgentPortalLayout({ children, currentPageName }) {
  const [mockUser, setMockUser] = useState(getMockUser);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    const stored = localStorage.getItem('agentOnboardingComplete');
    return !stored;
  });

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

  const handleOnboarding = () => {
    window.__agentOnboardingActive = true;
    setShowOnboarding(true);
  };

  return (
    <div className="h-dvh flex flex-col overflow-hidden bg-gray-50">
      {/* Header */}
      <header className="flex-shrink-0 z-50 backdrop-blur-md bg-white/90 border-b border-gray-200 shadow-sm">
        <div className="px-3 sm:px-4 md:px-6 py-2.5 md:py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/user_68b4602065e9569078753897/50e1878da_DCA_Logo_Updated.png"
                alt="DCA Pharmacy"
                className="h-10"
              />
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-[#8B1F1F] leading-tight">Agent Portal</p>
                <p className="text-xs text-gray-500 leading-tight">Customer Service</p>
              </div>
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
                  <DropdownMenuItem 
                    onClick={() => setShowProfileEdit(true)}
                    className="cursor-pointer flex items-center"
                  >
                    👤 Edit Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleOnboarding}
                    className="cursor-pointer flex items-center"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Onboard
                  </DropdownMenuItem>
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
      <main className="flex-1 min-h-0 overflow-hidden px-2 sm:px-3 md:px-3 lg:px-6 pb-4 md:pb-6">
        <div className="max-w-full h-full min-h-0 flex flex-col">
          {children}
        </div>
      </main>

      <SoftPhone />

      <ProfileEditDialog open={showProfileEdit} onClose={() => setShowProfileEdit(false)} />

      {/* Pass onboarding state to children via window */}
      {showOnboarding && (
        <script dangerouslySetInnerHTML={{__html: `window.__agentOnboardingActive = true;`}} />
      )}
    </div>
  );
}