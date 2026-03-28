import React from 'react';
import { clsx } from 'clsx';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Loading: React.FC<LoadingProps> = ({ size = 'md', className }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={clsx('flex items-center justify-center', className)}>
      <div className={clsx(
        'animate-spin rounded-full border-b-2 border-primary-600',
        sizeClasses[size]
      )} />
    </div>
  );
};

export const LoadingOverlay: React.FC<{ message?: string }> = ({ message }) => {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
      <div className="text-center">
        <Loading size="lg" className="mb-4" />
        {message && <p className="text-gray-600">{message}</p>}
      </div>
    </div>
  );
};