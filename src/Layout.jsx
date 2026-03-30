import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { Settings, User, X, Pill, ShoppingCart, Clock, ChevronDown } from 'lucide-react';
import FacilityLayout from './components/facility/FacilityLayout';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { CartProvider, useCart } from './components/cart/CartContext';
import CartPopup from './components/cart/CartPopup';
import PickupWindowPopup from './components/pickup/PickupWindowPopup';
import { Badge } from '@/components/ui/badge';

// Mock user data
const defaultUser = {
  full_name: "John Doe",
  email: "john.doe@example.com",
  profile_picture: null,
  patient_pref_prescriptions: true,
  patient_pref_communications: true,
  patient_pref_quick_actions: true,
  patient_pref_orders: true,
  patient_pref_prescriptions_nav: true,
  patient_pref_messages_nav: true
};

function LayoutContent({ children, currentPageName }) {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showPickupWindow, setShowPickupWindow] = useState(false);
  const [showPlatformSwitcher, setShowPlatformSwitcher] = useState(false);
  const { cartItems } = useCart();
  
  // Load user from localStorage or use default
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('mockUser');
    return stored ? { ...defaultUser, ...JSON.parse(stored) } : defaultUser;
  });

  // Listen for localStorage changes (when onboarding completes)
  React.useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem('mockUser');
      if (stored) {
        setUser({ ...defaultUser, ...JSON.parse(stored) });
      }
    };
    
    const handleProfileUpdate = () => {
      const stored = localStorage.getItem('mockUser');
      if (stored) {
        setUser({ ...defaultUser, ...JSON.parse(stored) });
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userProfileUpdated', handleProfileUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userProfileUpdated', handleProfileUpdate);
    };
  }, []);

  React.useEffect(() => {
    document.title = "DCA Pharmacy - Patient Portal";
  }, []);

  // No redirect needed anymore - we support both platforms

  React.useEffect(() => {
    if (isChatbotOpen) {
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
  }, [isChatbotOpen]);

  // Build navigation items based on user preferences
  const patientNavItems = [];
  if (user?.patient_pref_prescriptions_nav !== false) {
    patientNavItems.push({ name: 'Prescriptions', page: 'Prescriptions' });
  }
  if (user?.patient_pref_messages_nav !== false) {
    patientNavItems.push({ name: 'Communication', page: 'PatientMessages' });
  }
  patientNavItems.push({ name: 'Complete Profile', page: 'PatientWelcomeFlow' });

  return (
    <div className="min-h-screen relative bg-gray-50" style={{ overflowY: 'scroll' }}>
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
                      src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/user_68b4602065e9569078753897/50e1878da_DCA_Logo_Updated.png" 
                      alt="DCA Pharmacy" 
                      className="h-12"
                    />
                    <ChevronDown className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64 bg-white border-gray-200">
                  <div className="px-3 py-2 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Switch Platform</p>
                  </div>
                  <DropdownMenuItem className="flex items-center gap-3 bg-red-50 border-l-4 border-[#8B1F1F] py-3">
                    <img 
                      src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/user_68b4602065e9569078753897/50e1878da_DCA_Logo_Updated.png" 
                      alt="DCA Pharmacy" 
                      className="h-8"
                    />
                    <div>
                      <p className="font-semibold text-[#8B1F1F]">Patient Portal</p>
                      <p className="text-xs text-gray-600">DCA Pharmacy (Current)</p>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={createPageUrl('FacilityDashboard')} className="flex items-center gap-3 cursor-pointer py-3">
                      <img 
                        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695285fc94e8ef46bde70e16/6281fe319_MochiHealth.png" 
                        alt="Mochi Health" 
                        className="h-8"
                      />
                      <div>
                        <p className="font-semibold text-gray-900">Facility Portal</p>
                        <p className="text-xs text-gray-500">Mochi Health</p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={createPageUrl('AgentPortal')} className="flex items-center gap-3 cursor-pointer py-3">
                      <img 
                        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/user_68b4602065e9569078753897/50e1878da_DCA_Logo_Updated.png" 
                        alt="DCA Pharmacy" 
                        className="h-8"
                      />
                      <div>
                        <p className="font-semibold text-gray-900">Agent Portal</p>
                        <p className="text-xs text-gray-500">DCA Pharmacy — Customer Service</p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <nav className="hidden md:flex items-center gap-4">
              {patientNavItems.map(item => (
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
              {/* Pickup Window Icon */}
              <button
                onClick={() => setShowPickupWindow(true)}
                className="relative p-2 rounded-full hover:bg-gray-100 transition-all"
                title="Pickup Window"
              >
                <Clock className="w-6 h-6 text-gray-700" />
                <Badge className="absolute -top-1 -right-1 bg-green-500 text-white px-1.5 py-0.5 text-xs min-w-[20px] h-5 flex items-center justify-center">
                  1
                </Badge>
              </button>

              {/* Cart Icon */}
              <button
                onClick={() => setShowCart(true)}
                className="relative p-2 rounded-full hover:bg-gray-100 transition-all"
              >
                <ShoppingCart className="w-6 h-6 text-gray-700" />
                {cartItems.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 bg-[#8B1F1F] text-white px-1.5 py-0.5 text-xs min-w-[20px] h-5 flex items-center justify-center">
                    {cartItems.length}
                  </Badge>
                )}
              </button>

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
                    <Link to={createPageUrl('PatientProfile')} className="flex items-center gap-2 cursor-pointer text-gray-700">
                      <User className="w-4 h-4" />
                      My Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={createPageUrl('PatientRoadmap')} className="flex items-center gap-2 cursor-pointer text-gray-700">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                      Roadmap
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={createPageUrl('PatientSettings')} className="flex items-center gap-2 cursor-pointer text-gray-700">
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>

      {/* Agent Chatbot */}
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

      {/* Cart Popup */}
      <CartPopup open={showCart} onClose={() => setShowCart(false)} />

      {/* Pickup Window Popup */}
      <PickupWindowPopup open={showPickupWindow} onClose={() => setShowPickupWindow(false)} />
      </div>
      );
      }

export default function Layout({ children, currentPageName }) {
  // Check if this is a facility page BEFORE wrapping in CartProvider
  const facilityPages = ['FacilityDashboard', 'FacilityInvoices', 'FacilityPatients', 'FacilityPhysicians', 'FacilityUserProfile', 'FacilityProfile', 'FacilitySearchResults'];
  const isFacilityPage = facilityPages.includes(currentPageName);
  
  // If it's a facility page, use FacilityLayout directly (no CartProvider needed)
  if (isFacilityPage) {
    return <FacilityLayout children={children} currentPageName={currentPageName} />;
  }
  
  // Otherwise, use patient layout with CartProvider
  return (
    <CartProvider>
      <LayoutContent children={children} currentPageName={currentPageName} />
    </CartProvider>
  );
}