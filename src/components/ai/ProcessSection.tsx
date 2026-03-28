import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Brain, Wrench, CheckCircle, Loader2 } from 'lucide-react';

interface ProcessStep {
  type: 'thinking' | 'tool';
  content: string;
  timestamp: number;
  tool?: {
    name: string;
    status: 'running' | 'completed';
  };
}

interface ProcessSectionProps {
  thinkingChain: Array<{ type: string; content: string; timestamp: number }>;
  toolChain: Array<{ 
    id: string; 
    name: string; 
    display_name?: string; 
    status: string; 
    timestamp: number 
  }>;
  isProcessing: boolean;
}

export const ProcessSection: React.FC<ProcessSectionProps> = ({
  thinkingChain,
  toolChain,
  isProcessing
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [processSteps, setProcessSteps] = useState<ProcessStep[]>([]);

  // Auto-expand during processing, collapse when done (like ChatGPT)
  useEffect(() => {
    if (isProcessing) {
      setIsExpanded(true);
    } else {
      // Start collapsed when showing completed process
      setIsExpanded(false);
    }
  }, [isProcessing]);

  // Merge thinking and tool chains chronologically
  useEffect(() => {
    const steps: ProcessStep[] = [];
    
    // Add thinking steps
    thinkingChain.forEach(item => {
      if (item.type === 'thinking' && item.content) {
        steps.push({
          type: 'thinking',
          content: item.content,
          timestamp: item.timestamp
        });
      }
    });

    // Add tool steps
    toolChain.forEach(tool => {
      steps.push({
        type: 'tool',
        content: tool.display_name || tool.name,
        timestamp: tool.timestamp,
        tool: {
          name: tool.name,
          status: tool.status as 'running' | 'completed'
        }
      });
    });

    // Sort by timestamp
    steps.sort((a, b) => a.timestamp - b.timestamp);
    setProcessSteps(steps);
  }, [thinkingChain, toolChain]);

  // Don't render if no steps and not processing
  if (processSteps.length === 0 && !isProcessing) return null;

  const getStepIcon = (step: ProcessStep) => {
    if (step.type === 'thinking') {
      return <Brain className="w-4 h-4 text-purple-500" />;
    }
    if (step.tool?.status === 'running') {
      return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
    }
    if (step.tool?.status === 'completed') {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    return <Wrench className="w-4 h-4 text-gray-500" />;
  };

  return (
    <div className="mb-4 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
          <span className="text-sm font-medium text-gray-700">
            {isProcessing ? 'Claude is working on this...' : 'View Claude\'s process'}
          </span>
          {processSteps.length > 0 && (
            <span className="text-xs text-gray-500">
              ({processSteps.length} {processSteps.length === 1 ? 'step' : 'steps'})
            </span>
          )}
        </div>
        {isProcessing && (
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
          </div>
        )}
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="px-4 pb-3 max-h-96 overflow-y-auto">
          {processSteps.length === 0 && isProcessing ? (
            <div className="py-2 text-sm text-gray-500">Starting process...</div>
          ) : (
            <div className="space-y-2">
              {processSteps.map((step, index) => (
                <div key={index} className="flex gap-3 py-2">
                  <div className="flex-shrink-0 mt-0.5">
                    {getStepIcon(step)}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-700">
                      {step.content}
                    </div>
                    {step.type === 'tool' && step.tool && (
                      <div className="text-xs text-gray-500 mt-0.5">
                        {step.tool.status === 'running' ? 'In progress...' : 'Complete'}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};