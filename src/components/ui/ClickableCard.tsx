import React, { useState } from 'react';
import { Card } from './Card';
import { DataSourceModal } from './DataSourceModal';
import { clsx } from 'clsx';
import { Sparkles } from 'lucide-react';
import { useAIContext } from '../../hooks/useAIContext';
import { generateMetricQuery } from '../../utils/metricQueryGenerator';

interface ClickableCardProps {
  title?: string;
  subtitle?: string;
  className?: string;
  metricKey?: string;
  children: React.ReactNode;
}

export const ClickableCard: React.FC<ClickableCardProps> = ({
  metricKey,
  children,
  className,
  title,
  subtitle
}) => {
  const [showDataSource, setShowDataSource] = useState(false);
  const { sendToAI } = useAIContext();

  const handleAskAI = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!metricKey) return;

    sendToAI({
      source: title || metricKey,
      data: { metricKey, title, subtitle },
      query: generateMetricQuery(metricKey, title)
    });
  };

  const cardContent = (
    <Card
      title={title}
      subtitle={subtitle}
      className={clsx(
        'h-full',
        metricKey && 'cursor-pointer hover:shadow-lg transition-all',
        className
      )}
    >
      {children}
    </Card>
  );

  return (
    <>
      {metricKey ? (
        <div
          className="relative group h-full"
          onClick={(e) => {
            e.stopPropagation();
            setShowDataSource(true);
          }}
          title="Click to view data source"
        >
          {/* Ask AI Button Overlay */}
          <button
            onClick={handleAskAI}
            className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 rounded-full shadow-md"
            title="Ask AI about this metric"
          >
            <Sparkles className="w-3 h-3" />
            <span>Ask AI</span>
          </button>
          {cardContent}
        </div>
      ) : (
        cardContent
      )}

      {metricKey && (
        <DataSourceModal
          metric={metricKey}
          isOpen={showDataSource}
          onClose={() => setShowDataSource(false)}
        />
      )}
    </>
  );
};