import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Brain, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';

interface ModeToggleProps {
  className?: string;
}

export const ModeToggle: React.FC<ModeToggleProps> = ({ className }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAIMode = location.pathname.startsWith('/ai');
  
  const handleModeSwitch = () => {
    if (isAIMode) {
      // Return to last dashboard page or default to home
      const lastDashboardPath = sessionStorage.getItem('lastDashboardPath') || '/';
      navigate(lastDashboardPath);
    } else {
      // Save current dashboard path and switch to AI mode
      sessionStorage.setItem('lastDashboardPath', location.pathname);
      navigate('/ai');
    }
  };

  return (
    <div className={clsx("flex items-center gap-2", className)}>
      <button
        onClick={handleModeSwitch}
        className={clsx(
          "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300",
          "bg-gradient-to-r shadow-soft hover:shadow-md transform hover:scale-105",
          isAIMode 
            ? "from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700"
            : "from-primary-600 to-secondary-600 text-white hover:from-primary-700 hover:to-secondary-700"
        )}
      >
        <div className="flex items-center gap-2">
          {isAIMode ? (
            <>
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard Mode</span>
            </>
          ) : (
            <>
              <Brain className="w-4 h-4" />
              <span>AI Intelligence Mode</span>
            </>
          )}
        </div>
        <ArrowRight className="w-4 h-4 ml-1" />
      </button>
      
      {/* Mode indicator */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span className="text-xs uppercase tracking-wider font-semibold">
          Current Mode:
        </span>
        <span className={clsx(
          "px-2 py-1 rounded text-xs font-bold uppercase tracking-wider",
          isAIMode 
            ? "bg-emerald-100 text-emerald-700"
            : "bg-primary-100 text-primary-700"
        )}>
          {isAIMode ? 'AI' : 'Dashboard'}
        </span>
      </div>
    </div>
  );
};