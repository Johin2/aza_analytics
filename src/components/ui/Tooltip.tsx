import React from 'react';
import { clsx } from 'clsx';

interface TooltipProps {
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ 
  children, 
  position = 'top',
  className 
}) => {
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-gray-800',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-800',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-gray-800',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-gray-800'
  };

  return (
    <div className={clsx(
      'absolute z-50 px-2 py-1 text-xs text-white bg-gray-800 rounded shadow-lg whitespace-nowrap',
      'animate-in fade-in-0 zoom-in-95 duration-100',
      positionClasses[position],
      className
    )}>
      {children}
      <div className={clsx(
        'absolute w-0 h-0 border-4 border-transparent',
        arrowClasses[position]
      )} />
    </div>
  );
};