import React, { useState } from 'react';
import { FileText, Calendar } from 'lucide-react';
import { DataSourceModal } from './DataSourceModal';
import { clsx } from 'clsx';
import { format } from 'date-fns';

interface DataSourceFooterProps {
  sourceFile?: string;
  lastUpdated?: string;
  metricKey?: string;
  className?: string;
}

export const DataSourceFooter: React.FC<DataSourceFooterProps> = ({
  sourceFile,
  lastUpdated,
  metricKey,
  className
}) => {
  const [showModal, setShowModal] = useState(false);

  if (!sourceFile && !lastUpdated && !metricKey) {
    return null;
  }

  return (
    <>
      <div className={clsx(
        'flex items-center justify-between text-xs text-gray-500 mt-4 pt-3 border-t border-gray-100',
        className
      )}>
        <div className="flex items-center gap-3">
          {sourceFile && (
            <div className="flex items-center gap-1">
              <FileText className="w-3 h-3" />
              <span>Source: {sourceFile}</span>
            </div>
          )}
          {lastUpdated && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>
                Updated: {
                  lastUpdated !== 'Unknown' 
                    ? format(new Date(lastUpdated), 'MMM dd, yyyy')
                    : 'Unknown'
                }
              </span>
            </div>
          )}
        </div>
        {metricKey && (
          <button
            onClick={() => setShowModal(true)}
            className="text-aza-navy hover:text-aza-navy/80 transition-colors text-xs underline"
          >
            View data source
          </button>
        )}
      </div>
      
      {metricKey && (
        <DataSourceModal
          metric={metricKey}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};