import React from 'react';

interface MinimalStatusProps {
  activity?: string;
  isActive: boolean;
}

export const MinimalStatus: React.FC<MinimalStatusProps> = ({
  activity,
  isActive
}) => {
  if (!isActive || !activity) return null;

  return (
    <div className="inline-flex items-center gap-2 text-sm text-gray-500 animate-fade-in">
      {/* Simple activity dot animation */}
      <div className="flex gap-1">
        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
      </div>
      <span className="text-gray-600">{activity}</span>
    </div>
  );
};