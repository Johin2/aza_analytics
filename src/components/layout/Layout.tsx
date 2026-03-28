import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Menu, X } from 'lucide-react';
import { AIInsights } from '../CommandBar/AIInsights';

interface LayoutProps {
  onRefresh?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ onRefresh }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Menu Button - fixed position */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md hover:bg-gray-100 transition-colors border border-gray-200"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? (
          <X className="w-6 h-6 text-gray-600" />
        ) : (
          <Menu className="w-6 h-6 text-gray-600" />
        )}
      </button>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-30 bg-black/50 transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Hidden on mobile, slide-in when menu open */}
      <div className={`
        fixed lg:sticky top-0 h-screen z-40 flex-shrink-0
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar onRefresh={onRefresh} onNavigate={() => setIsMobileMenuOpen(false)} />
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <Outlet />
      </div>

      {/* Fixed Branding - Bottom Right */}
      <div 
        className="fixed bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm border border-gray-200 text-xs text-gray-500"
        style={{ zIndex: 100 }}
      >
        Dashboard for <span className="font-semibold text-danger-600">Aza Fashions</span> by <span className="font-medium text-gray-700">Someware</span>
      </div>
    </div>
  );
};