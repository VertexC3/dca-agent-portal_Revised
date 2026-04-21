import React, { useState } from 'react';
import { LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
const getMockUser = () => {
  const stored = localStorage.getItem('facilityUser');
  if (stored) return JSON.parse(stored);
  return { full_name: "Agent User", email: "agent@dcapharmacy.com", role: "representative", profile_picture: null };
};

import SoftPhone from './SoftPhone';

export default function AgentPortalLayout({ children, currentPageName }) {
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

      <SoftPhone />
    </div>
  );
}