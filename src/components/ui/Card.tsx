import React from 'react';
import { clsx } from 'clsx';
import { DataSourceFooter } from './DataSourceFooter';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  dataSource?: {
    sourceFile?: string;
    lastUpdated?: string;
    metricKey?: string;
  };
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className,
  title,
  subtitle,
  action,
  dataSource
}) => {
  return (
    <div className={clsx(
      'bg-white rounded-xl shadow-sm border border-gray-100 p-6',
      className
    )}>
      {(title || subtitle || action) && (
        <div className="flex items-start justify-between mb-4">
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
      {dataSource && (
        <DataSourceFooter
          sourceFile={dataSource.sourceFile}
          lastUpdated={dataSource.lastUpdated}
          metricKey={dataSource.metricKey}
        />
      )}
    </div>
  );
};