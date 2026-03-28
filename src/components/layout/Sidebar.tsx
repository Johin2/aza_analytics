import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import { analyticsApi } from '../../services/api';
import {
  LayoutDashboard,
  TrendingUp,
  Users,
  Smartphone,
  Brain,
  BarChart3,
  Settings,
  RefreshCw,
  Database,
  Star,
  Target,
  Activity,
  MapPin,
  Utensils,
  ChevronRight,
  Menu,
  Sparkles,
} from 'lucide-react';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  isSpecial?: boolean;
}

const navItems: NavItem[] = [
  {
    path: '/',
    label: 'Executive Summary',
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    path: '/stores',
    label: 'Store Performance',
    icon: <BarChart3 className="w-5 h-5" />,
  },
  {
    path: '/sales',
    label: 'Sales Analytics',
    icon: <TrendingUp className="w-5 h-5" />,
  },
  {
    path: '/customers',
    label: 'Customer Intelligence',
    icon: <Users className="w-5 h-5" />,
  },
  {
    path: '/platforms',
    label: 'Platform Performance',
    icon: <Smartphone className="w-5 h-5" />,
  },
  {
    path: '/marketing',
    label: 'Marketing ROI',
    icon: <Target className="w-5 h-5" />,
  },
  {
    path: '/reputation',
    label: 'Reputation Management',
    icon: <Star className="w-5 h-5" />,
  },
  {
    path: '/operations',
    label: 'Operational Excellence',
    icon: <Activity className="w-5 h-5" />,
  },
  {
    path: '/customer-journey',
    label: 'Customer Journey',
    icon: <MapPin className="w-5 h-5" />,
  },
  {
    path: '/menu',
    label: 'Collection Intelligence',
    icon: <Utensils className="w-5 h-5" />,
  },
  {
    path: '/predictive',
    label: 'Predictive Insights',
    icon: <Brain className="w-5 h-5" />,
  },
];

interface SidebarProps {
  onRefresh?: () => void;
  onNavigate?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onRefresh, onNavigate }) => {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(true);
  const [warningCounts, setWarningCounts] = useState<Record<string, number>>({});

  // Fetch warning counts on component mount
  useEffect(() => {
    const fetchWarningCounts = async () => {
      try {
        const response = await analyticsApi.getWarningCounts();
        if (response.success) {
          setWarningCounts(response.counts);
        }
      } catch (error) {
        console.error('Failed to fetch warning counts:', error);
      }
    };

    fetchWarningCounts();

    // Optional: Refresh warning counts every 60 seconds
    const interval = setInterval(fetchWarningCounts, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleNavClick = () => {
    // Close mobile menu when navigating
    if (onNavigate) {
      onNavigate();
    }
  };

  // NavBadge component for displaying warning count badges
  const NavBadge: React.FC<{ count: number; isCollapsed: boolean }> = ({ count, isCollapsed }) => {
    if (count === 0) return null;

    if (isCollapsed) {
      // Small dot indicator when sidebar is collapsed
      return (
        <div className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full shadow-sm" />
      );
    }

    // Badge with count when sidebar is expanded
    return (
      <span className={clsx(
        'px-1.5 py-0.5',
        'rounded-full',
        'text-[10px]',
        'font-semibold',
        count > 5 ? 'bg-rose-500' : 'bg-amber-500',
        'text-white',
        'shadow-sm',
        'min-w-[18px]',
        'text-center'
      )}>
        {count > 9 ? '9+' : count}
      </span>
    );
  };

  return (
    <div 
      className={clsx(
        "h-screen bg-white text-gray-800 flex flex-col border-r border-gray-200 transition-all duration-300 ease-in-out overflow-hidden",
        isExpanded ? "w-64" : "w-16"
      )}
    >
      {/* Fixed Logo Header with Toggle Button */}
      <div className="flex-shrink-0 p-3 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-white">
        <div className="flex items-center justify-between">
          {isExpanded ? (
            <>
              <div className="flex items-center gap-2 min-w-0">
                <img
                  src="/aza-logo.svg"
                  alt="Aza Fashions"
                  className="h-8 w-auto max-w-[60px] shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-800 truncate">Aza Fashions</p>
                  <p className="text-xs text-gray-500 truncate">Analytics Dashboard</p>
                </div>
              </div>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors hidden lg:block"
                aria-label="Toggle sidebar"
              >
                <ChevronRight className="w-5 h-5 text-gray-600 rotate-180" />
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center hover:bg-primary-700 transition-colors shadow-soft"
              aria-label="Expand sidebar"
            >
              <Menu className="w-5 h-5 text-white" />
            </button>
          )}
        </div>
      </div>

      {/* AI Intelligence Mode - Special prominent link */}
      <div className="p-2 border-b border-gray-200">
        <Link
          to="/ai"
          onClick={handleNavClick}
          className={clsx(
            'flex items-center rounded-lg transition-all duration-200 group relative',
            isExpanded ? 'gap-3 px-3 py-3' : 'justify-center p-3',
            location.pathname === '/ai'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
              : 'bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-700 hover:from-purple-100 hover:to-indigo-100 border border-purple-200'
          )}
          title={!isExpanded ? "Aza AI" : undefined}
        >
          <div className="flex-shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          {isExpanded && (
            <div className="flex-1">
              <span className="font-semibold text-sm">Aza AI</span>
              <p className={clsx(
                "text-xs mt-0.5",
                location.pathname === '/ai' ? 'text-purple-200' : 'text-purple-500'
              )}>
                Your intelligent assistant
              </p>
            </div>
          )}
          {!isExpanded && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-purple-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              Aza AI
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                onClick={handleNavClick}
                className={clsx(
                  'flex items-center rounded-lg transition-all duration-200 group relative',
                  isExpanded ? 'gap-3 px-3 py-2' : 'justify-center p-3',
                  location.pathname === item.path
                    ? 'bg-gradient-to-r from-primary-600 to-secondary-700 text-white shadow-soft'
                    : 'text-gray-700 hover:bg-primary-50 hover:text-primary-700'
                )}
                title={!isExpanded ? item.label : undefined}
              >
                {/* Icon with badge overlay when collapsed */}
                <div className="flex-shrink-0 relative">
                  {item.icon}
                  {!isExpanded && (
                    <NavBadge count={warningCounts[item.path] || 0} isCollapsed={true} />
                  )}
                </div>

                {/* Label with badge when expanded */}
                {isExpanded && (
                  <div className="flex items-center justify-between flex-1 gap-2">
                    <span className="font-medium text-sm">{item.label}</span>
                    <NavBadge count={warningCounts[item.path] || 0} isCollapsed={false} />
                  </div>
                )}

                {/* Tooltip when collapsed */}
                {!isExpanded && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    {item.label}
                    {warningCounts[item.path] > 0 && (
                      <span className="ml-2 text-amber-300">
                        ({warningCounts[item.path]} alert{warningCounts[item.path] !== 1 ? 's' : ''})
                      </span>
                    )}
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Fixed Footer Actions */}
      <div className="flex-shrink-0 p-2 border-t border-gray-200">
        <div className="space-y-1">
          <Link
            to="/data-sources"
            onClick={handleNavClick}
            className={clsx(
              "flex items-center rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors group relative",
              isExpanded ? "gap-3 px-3 py-2" : "justify-center p-2"
            )}
            title={!isExpanded ? "Data Sources" : undefined}
          >
            <Database className="w-5 h-5 flex-shrink-0" />
            {isExpanded && <span className="font-medium text-sm">Data Sources</span>}
            {!isExpanded && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Data Sources
              </div>
            )}
          </Link>
          <button
            onClick={() => {
              onRefresh?.();
              handleNavClick();
            }}
            className={clsx(
              "flex items-center rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors w-full group relative",
              isExpanded ? "gap-3 px-3 py-2" : "justify-center p-2"
            )}
            title={!isExpanded ? "Refresh Data" : undefined}
          >
            <RefreshCw className="w-5 h-5 flex-shrink-0" />
            {isExpanded && <span className="font-medium text-sm">Refresh Data</span>}
            {!isExpanded && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Refresh Data
              </div>
            )}
          </button>
          <Link
            to="/settings"
            onClick={handleNavClick}
            className={clsx(
              "flex items-center rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors group relative",
              isExpanded ? "gap-3 px-3 py-2" : "justify-center p-2"
            )}
            title={!isExpanded ? "Settings" : undefined}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            {isExpanded && <span className="font-medium text-sm">Settings</span>}
            {!isExpanded && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Settings
              </div>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
};