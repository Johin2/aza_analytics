import React from 'react';

interface VerificationStatus {
  status: 'verified' | 'calculated' | 'mismatch' | 'error' | 'warning';
  confidence: number;
  method?: string;
  notes?: Array<{
    severity: string;
    message: string;
  }>;
}

interface ConfidenceBadgeProps {
  verification: VerificationStatus;
  showTooltip?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Confidence Badge Component
 * 
 * Displays a visual indicator of data verification status:
 * 🟢 Verified (Green) - Shadow sum matched sheet total
 * 🟡 Calculated (Yellow) - No total found, Python calculated
 * 🔴 Mismatch (Red) - Shadow sum failed, discrepancy detected
 */
export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({
  verification,
  showTooltip = true,
  size = 'sm',
  className = ''
}) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'verified':
        return {
          icon: '✓',
          color: 'bg-emerald-500',
          textColor: 'text-emerald-500',
          borderColor: 'border-emerald-500',
          bgLight: 'bg-emerald-500/10',
          label: 'Verified',
          description: 'Data verified via shadow sum'
        };
      case 'calculated':
        return {
          icon: '⊕',
          color: 'bg-amber-500',
          textColor: 'text-amber-500',
          borderColor: 'border-amber-500',
          bgLight: 'bg-amber-500/10',
          label: 'Calculated',
          description: 'No total found in sheet, calculated by system'
        };
      case 'mismatch':
        return {
          icon: '⚠',
          color: 'bg-red-500',
          textColor: 'text-red-500',
          borderColor: 'border-red-500',
          bgLight: 'bg-red-500/10',
          label: 'Mismatch',
          description: 'Discrepancy detected in source data'
        };
      case 'warning':
        return {
          icon: '!',
          color: 'bg-orange-500',
          textColor: 'text-orange-500',
          borderColor: 'border-orange-500',
          bgLight: 'bg-orange-500/10',
          label: 'Warning',
          description: 'Cross-reference check failed'
        };
      case 'error':
      default:
        return {
          icon: '✕',
          color: 'bg-gray-500',
          textColor: 'text-gray-500',
          borderColor: 'border-gray-500',
          bgLight: 'bg-gray-500/10',
          label: 'Error',
          description: 'Could not validate data'
        };
    }
  };

  const sizeClasses = {
    sm: 'w-4 h-4 text-xs',
    md: 'w-5 h-5 text-sm',
    lg: 'w-6 h-6 text-base'
  };

  const config = getStatusConfig(verification.status);
  const confidencePercent = Math.round(verification.confidence * 100);

  return (
    <div className={`relative inline-flex items-center gap-1 group ${className}`}>
      {/* Badge Icon */}
      <div 
        className={`
          ${sizeClasses[size]} 
          ${config.color} 
          rounded-full 
          flex items-center justify-center 
          text-white font-bold
          shadow-sm
          transition-transform hover:scale-110
          cursor-help
        `}
        title={showTooltip ? `${config.label}: ${confidencePercent}% confidence` : undefined}
      >
        <span className="text-[10px]">{config.icon}</span>
      </div>

      {/* Tooltip on hover */}
      {showTooltip && (
        <div className="
          absolute bottom-full left-1/2 -translate-x-1/2 mb-2
          opacity-0 group-hover:opacity-100
          pointer-events-none group-hover:pointer-events-auto
          transition-opacity duration-200
          z-50
        ">
          <div className="
            bg-gray-900 text-white text-xs rounded-lg px-3 py-2
            shadow-lg min-w-[200px] max-w-[280px]
          ">
            {/* Header */}
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-2 h-2 rounded-full ${config.color}`}></span>
              <span className="font-semibold">{config.label}</span>
              <span className="ml-auto text-gray-400">{confidencePercent}%</span>
            </div>
            
            {/* Description */}
            <p className="text-gray-300 text-[11px] mb-1">{config.description}</p>
            
            {/* Method */}
            {verification.method && (
              <p className="text-gray-400 text-[10px]">
                Method: {verification.method.replace(/_/g, ' ')}
              </p>
            )}
            
            {/* Notes */}
            {verification.notes && verification.notes.length > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-700">
                {verification.notes.map((note, idx) => (
                  <p 
                    key={idx} 
                    className={`
                      text-[10px] 
                      ${note.severity === 'warning' ? 'text-amber-400' : 
                        note.severity === 'error' ? 'text-red-400' : 'text-gray-300'}
                    `}
                  >
                    {note.message}
                  </p>
                ))}
              </div>
            )}
            
            {/* Arrow */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Inline confidence indicator for metric tiles
 */
export const ConfidenceIndicator: React.FC<{
  verification?: VerificationStatus;
  showLabel?: boolean;
}> = ({ verification, showLabel = false }) => {
  if (!verification) return null;

  const getColorClass = (status: string) => {
    switch (status) {
      case 'verified': return 'text-emerald-500';
      case 'calculated': return 'text-amber-500';
      case 'mismatch': return 'text-red-500';
      case 'warning': return 'text-orange-500';
      default: return 'text-gray-500';
    }
  };

  const getIcon = (status: string) => {
    switch (status) {
      case 'verified': return '●';
      case 'calculated': return '◐';
      case 'mismatch': return '◯';
      case 'warning': return '◍';
      default: return '○';
    }
  };

  return (
    <span className={`inline-flex items-center gap-1 ${getColorClass(verification.status)}`}>
      <span className="text-[8px]">{getIcon(verification.status)}</span>
      {showLabel && (
        <span className="text-[10px] uppercase tracking-wider opacity-70">
          {verification.status}
        </span>
      )}
    </span>
  );
};

/**
 * Overall verification status bar
 */
export const VerificationStatusBar: React.FC<{
  overallStatus: string;
  overallConfidence: number;
  metricsCount?: number;
}> = ({ overallStatus, overallConfidence, metricsCount }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'verified':
        return {
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/30',
          text: 'text-emerald-400',
          icon: '✓',
          label: 'All Data Verified'
        };
      case 'calculated':
        return {
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/30',
          text: 'text-amber-400',
          icon: '⊕',
          label: 'Data Calculated'
        };
      case 'mismatch':
        return {
          bg: 'bg-red-500/10',
          border: 'border-red-500/30',
          text: 'text-red-400',
          icon: '⚠',
          label: 'Data Discrepancy Detected'
        };
      default:
        return {
          bg: 'bg-gray-500/10',
          border: 'border-gray-500/30',
          text: 'text-gray-400',
          icon: '○',
          label: 'Verification Status Unknown'
        };
    }
  };

  const config = getStatusConfig(overallStatus);
  const confidencePercent = Math.round(overallConfidence * 100);

  return (
    <div className={`
      flex items-center justify-between
      px-4 py-2 rounded-lg
      ${config.bg} ${config.border} border
      text-sm
    `}>
      <div className="flex items-center gap-2">
        <span className={`${config.text} text-lg`}>{config.icon}</span>
        <span className={config.text}>{config.label}</span>
        {metricsCount && (
          <span className="text-gray-500 text-xs">({metricsCount} metrics checked)</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <div className="w-20 h-1.5 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className={`h-full ${
              confidencePercent >= 90 ? 'bg-emerald-500' :
              confidencePercent >= 70 ? 'bg-amber-500' : 'bg-red-500'
            }`}
            style={{ width: `${confidencePercent}%` }}
          />
        </div>
        <span className="text-gray-400 text-xs">{confidencePercent}%</span>
      </div>
    </div>
  );
};

export default ConfidenceBadge;
