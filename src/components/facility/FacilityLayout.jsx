import React, { useState } from 'react';
import { User, LogOut, ChevronDown, Bell, ShoppingCart } from 'lucide-react';
import { createPageUrl } from '../../utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import CollapsibleSidebar from './CollapsibleSidebar';
import MasterSearchBar from './MasterSearchBar';
import NotificationPopup from './NotificationPopup';
import NotificationPanel from './NotificationPanel';

const getMockUser = () => {
  const stored = localStorage.getItem('facilityUser');
  if (stored) {
    return JSON.parse(stored);
  }
  return {
    full_name: "Admin User",
    email: "admin@mochihealth.com",
    role: "admin",
    profile_picture: null
  };
};

export default function FacilityLayout({ children, currentPageName }) {
  const [showPlatformSwitcher, setShowPlatformSwitcher] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [mockUser, setMockUser] = useState(getMockUser);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  // Show notification panel on first entry
  React.useEffect(() => {
    const hasSeenPanel = sessionStorage.getItem('facilityNotificationPanelSeen');
    if (!hasSeenPanel) {
      setShowNotificationPanel(true);
      sessionStorage.setItem('facilityNotificationPanelSeen', 'true');
    }
  }, []);

  // Listen for cart updates from FacilityInvoices
  React.useEffect(() => {
    const handleCartUpdate = (event) => {
      setCartItems(event.detail.items);
    };
    
    window.addEventListener('facilityCartUpdate', handleCartUpdate);
    return () => window.removeEventListener('facilityCartUpdate', handleCartUpdate);
  }, []);

  // Listen for profile updates
  React.useEffect(() => {
    const handleProfileUpdate = () => {
      setMockUser(getMockUser());
    };
    
    window.addEventListener('facilityProfileUpdated', handleProfileUpdate);
    window.addEventListener('storage', handleProfileUpdate);
    
    return () => {
      window.removeEventListener('facilityProfileUpdated', handleProfileUpdate);
      window.removeEventListener('storage', handleProfileUpdate);
    };
  }, []);

  const notifications = [
    {
      id: 1,
      orderId: '1234',
      patientName: 'Johnson, Robert',
      medication: 'Semaglutide',
      orderDate: '2/3/26',
      address: '123 Main St, Los Angeles, CA',
      message: 'Information missing for Order 1234',
      type: 'warning',
      unread: true
    }
  ];

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
    setShowNotifications(false);
    setShowNotificationPopup(true);
  };

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

            <div className="flex items-center gap-3">
              {/* Cart Icon - Only show when on Invoices page and has items */}
              {currentPageName === 'FacilityInvoices' && cartItems.length > 0 && (
                <button
                  onClick={() => setShowCart(true)}
                  className="relative p-2 rounded-full hover:bg-gray-100 transition-all"
                >
                  <ShoppingCart className="w-6 h-6 text-gray-700" />
                  <Badge className="absolute -top-1 -right-1 bg-[#1a1f5c] text-white px-1.5 py-0.5 text-xs min-w-[20px] h-5 flex items-center justify-center">
                    {cartItems.length}
                  </Badge>
                </button>
              )}

              {/* Notification Bell */}
              <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
                <DropdownMenuTrigger asChild>
                  <button 
                    className="relative p-2 rounded-full hover:bg-gray-100 transition-all"
                    onClick={() => setShowNotificationPanel(true)}
                  >
                    <Bell className="w-6 h-6 text-gray-700" />
                    {notifications.filter(n => n.unread).length > 0 && (
                      <Badge className="absolute -top-1 -right-1 bg-red-500 text-white px-1.5 py-0.5 text-xs min-w-[20px] h-5 flex items-center justify-center">
                        {notifications.filter(n => n.unread).length}
                      </Badge>
                    )}
                  </button>
                </DropdownMenuTrigger>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-all">
                    {mockUser.profile_picture ? (
                      <img 
                        src={mockUser.profile_picture} 
                        alt={mockUser.full_name}
                        className="w-9 h-9 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-[#1a1f5c] flex items-center justify-center text-white font-semibold">
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

      {/* Notification Popup */}
      <NotificationPopup
        open={showNotificationPopup}
        onClose={() => setShowNotificationPopup(false)}
        notification={selectedNotification}
      />

      {/* Notification Panel */}
      <NotificationPanel
        isOpen={showNotificationPanel}
        onClose={() => setShowNotificationPanel(false)}
      />

      {/* Cart Dialog */}
      <Dialog open={showCart} onOpenChange={setShowCart}>
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-[#1a1f5c]" />
              Selected Invoices ({cartItems.length})
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {cartItems.map(item => (
              <div key={item.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{item.invoice_number}</p>
                    <p className="text-sm text-gray-600">{item.bill_to_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">${item.total_due.toFixed(2)}</p>
                    <Badge className={item.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                      {item.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}