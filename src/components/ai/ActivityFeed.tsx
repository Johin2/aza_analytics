import React from 'react';
import { format } from 'date-fns';
import { MessageContent } from './MessageContent';

interface Activity {
  id: number;
  icon: string;
  message: string;
  timestamp: Date;
}

interface ActivityFeedProps {
  activities: Activity[];
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities }) => {
  if (activities.length === 0) return null;

  return (
    <div className="mb-4 space-y-2">
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
        Claude is working on:
      </div>
      {activities.map((activity) => (
        <div 
          key={activity.id} 
          className="flex items-center gap-3 p-2 bg-blue-50 border border-blue-200 rounded-lg animate-fadeIn"
        >
          <span className="text-lg flex-shrink-0">{activity.icon}</span>
          <span className="text-sm text-gray-700 flex-1">{activity.message}</span>
          <span className="text-xs text-gray-400">
            {format(activity.timestamp, 'HH:mm:ss')}
          </span>
        </div>
      ))}
    </div>
  );
};

export const StreamingMessage: React.FC<{ content: string }> = ({ content }) => {
  if (!content) return null;
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg px-4 py-3">
      <div className="text-sm">
        <MessageContent content={content} isUser={false} />
        <span className="inline-block w-2 h-4 bg-emerald-600 animate-pulse ml-1" />
      </div>
    </div>
  );
};