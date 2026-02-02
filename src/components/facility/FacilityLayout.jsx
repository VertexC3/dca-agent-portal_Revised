import React, { useState } from 'react';
import { User, LogOut, ChevronDown } from 'lucide-react';
import { createPageUrl } from '../../utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import CollapsibleSidebar from './CollapsibleSidebar';
import MasterSearchBar from './MasterSearchBar';

const mockUser = {
  full_name: "Admin User",
  email: "admin@mochihealth.com",
  role: "admin"
};

export default function FacilityLayout({ children, currentPageName }) {
  const [showPlatformSwitcher, setShowPlatformSwitcher] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  React.useEffect(() => {
    document.title = "Mochi Health - Facility Portal";
  }, []);

  return (
    <div className="min-h-screen relative bg-gray-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/90 border-b border-gray-200 shadow-sm">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Logo with Platform Switcher */}
            <div className="relative">
              <DropdownMenu open={showPlatformSwitcher} onOpenChange={setShowPlatformSwitcher}>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 hover:opacity-80 transition-all group">
                    <img 
                      src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695285fc94e8ef46bde70e16/6281fe319_MochiHealth.png" 
                      alt="Mochi Health" 
                      className="h-8"
                    />
                    <ChevronDown className="w-4 h-4 text-gray-600 group-hover:text-gray-900" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64 bg-white border-gray-200">
                  <div className="px-3 py-2 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Switch Platform</p>
                  </div>
                  <DropdownMenuItem className="flex items-center gap-3 bg-blue-50 border-l-4 border-[#1a1f5c] py-3">
                    <img 
                      src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695285fc94e8ef46bde70e16/6281fe319_MochiHealth.png" 
                      alt="Mochi Health" 
                      className="h-8"
                    />
                    <div>
                      <p className="font-semibold text-[#1a1f5c]">Facility Portal</p>
                      <p className="text-xs text-gray-600">Mochi Health (Current)</p>
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
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Master Search Bar */}
            <MasterSearchBar />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-all">
                  <div className="w-9 h-9 rounded-full bg-[#1a1f5c] flex items-center justify-center text-white font-semibold">
                    {mockUser.full_name.charAt(0).toUpperCase()}
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-white border-gray-200">
                <div className="px-3 py-2 border-b border-gray-100">
                  <p className="font-semibold text-gray-800">{mockUser.full_name}</p>
                  <p className="text-xs text-gray-500 truncate">{mockUser.email}</p>
                </div>
                <DropdownMenuItem asChild>
                  <a href={createPageUrl('FacilityUserProfile')} className="flex items-center gap-2 cursor-pointer text-gray-700">
                    <User className="w-4 h-4" />
                    User Profile
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href={createPageUrl('FacilityProfile')} className="flex items-center gap-2 cursor-pointer text-gray-700">
                    <User className="w-4 h-4" />
                    Facility Profile
                  </a>
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
      </header>

      {/* Collapsible Sidebar */}
      <CollapsibleSidebar
        currentPageName={currentPageName}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* Main Content */}
      <main 
        className="pt-20 px-6 pb-8 transition-all duration-300"
        style={{ marginLeft: isSidebarCollapsed ? '80px' : '240px' }}
      >
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}