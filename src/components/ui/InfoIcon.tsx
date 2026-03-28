import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { clsx } from 'clsx';
import { Tooltip } from './Tooltip';

interface InfoIconProps {
  metric: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export const InfoIcon: React.FC<InfoIconProps> = ({ 
  metric, 
  className,
  size = 'sm',
  onClick
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4', 
    lg: 'w-5 h-5'
  };

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={onClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={clsx(
          'text-gray-400 hover:text-aza-navy transition-colors cursor-pointer',
          'focus:outline-none focus:ring-2 focus:ring-aza-navy focus:ring-opacity-50 rounded-full',
          className
        )}
        aria-label={`View data source for ${metric}`}
      >
        <Info className={sizeClasses[size]} />
      </button>
      
      {showTooltip && !onClick && (
        <Tooltip>
          Click to view data source
        </Tooltip>
      )}
    </div>
  );
};