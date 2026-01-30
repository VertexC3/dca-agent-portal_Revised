import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Building2, Users, CreditCard, User, LogOut, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

// Mock facility user data
const defaultFacilityUser = {
  full_name: "John Administrator",
  email: "john.admin@mochihealth.com",
  profile_picture: null,
  role: "facility_user"
};

export default function FacilityLayout({ children, currentPageName }) {
  const [user, setUser] = useState(defaultFacilityUser);
  const [showPlatformSwitcher, setShowPlatformSwitcher] = useState(false);

  React.useEffect(() => {
    document.title = "Mochi Health - Facility Portal";
  }, []);

  const facilityNavItems = [
    { name: 'Dashboard', page: 'FacilityDashboard', icon: Building2 },
    { name: 'Patients', page: 'FacilityPatients', icon: Users },
    { name: 'Payment', page: 'FacilityPayment', icon: CreditCard }
  ];

  const handleLogout = () => {
    // Redirect to patient portal
    window.location.href = createPageUrl('PatientDashboard');
  };

  return (
    <div className="min-h-screen relative bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo with Platform Switcher */}
            <div className="relative">
              <DropdownMenu open={showPlatformSwitcher} onOpenChange={setShowPlatformSwitcher}>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 hover:opacity-80 transition-all group">
                    <img 
                      src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695285fc94e8ef46bde70e16/6281fe319_MochiHealth.png" 
                      alt="Mochi Health" 
                      className="h-12"
                    />
                    <ChevronDown className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64 bg-white border-gray-200">
                  <div className="px-3 py-2 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Switch Platform</p>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link to={createPageUrl('PatientDashboard')} className="flex items-center gap-3 cursor-pointer py-3">
                      <img 
                        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/user_68b4602065e9569078753897/50e1878da_DCA_Logo_Updated.png" 
                        alt="DCA Pharmacy" 
                        className="h-8"
                      />
                      <div>
                        <p className="font-semibold text-gray-900">Patient Portal</p>
                        <p className="text-xs text-gray-500">DCA Pharmacy</p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
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
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <nav className="hidden md:flex items-center gap-4">
              {facilityNavItems.map(item => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      currentPageName === item.page
                        ? 'bg-[#1a1f5c] text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

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
                    <div className="w-10 h-10 rounded-full bg-[#1a1f5c] flex items-center justify-center text-white font-semibold border-2 border-gray-200">
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
                  <Link to={createPageUrl('FacilityUserProfile')} className="flex items-center gap-2 cursor-pointer text-gray-700">
                    <User className="w-4 h-4" />
                    User Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={createPageUrl('FacilityProfile')} className="flex items-center gap-2 cursor-pointer text-gray-700">
                    <Building2 className="w-4 h-4" />
                    Facility Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 cursor-pointer text-red-600">
                  <LogOut className="w-4 h-4" />
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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