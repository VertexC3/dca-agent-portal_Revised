import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { LayoutDashboard, Users, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CollapsibleSidebar({ currentPageName, isCollapsed, setIsCollapsed }) {
  const navItems = [
    { name: 'Dashboard', page: 'FacilityDashboard', icon: LayoutDashboard },
    { name: 'Patients', page: 'FacilityPatients', icon: Users },
    { name: 'Invoices', page: 'FacilityInvoices', icon: FileText },
  ];

  return (
    <motion.div
      initial={false}
      animate={{ width: isCollapsed ? 80 : 240 }}
      className="fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 shadow-sm z-40 flex flex-col"
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 bg-white border border-gray-200 rounded-full p-1 hover:bg-gray-50 shadow-md"
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4 text-gray-600" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        )}
      </button>

      {/* Navigation Items */}
      <nav className="flex-1 pt-8 px-3 space-y-2">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentPageName === item.page;
          
          return (
            <Link
              key={item.page}
              to={createPageUrl(item.page)}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-[#1a1f5c] text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="font-medium whitespace-nowrap">{item.name}</span>
              )}
            </Link>
          );
        })}
      </nav>
    </motion.div>
  );
}