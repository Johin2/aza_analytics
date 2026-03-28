import { useNavigate } from 'react-router-dom';

interface AIContextData {
  source: string;
  page: string;
  data?: any;
  filters?: Record<string, any>;
  query?: string;
  timestamp: Date;
}

export const useAIContext = () => {
  const navigate = useNavigate();

  const sendToAI = (contextData: Partial<AIContextData>) => {
    const fullContext: AIContextData = {
      source: contextData.source || 'Dashboard',
      page: contextData.page || window.location.pathname,
      timestamp: new Date(),
      ...contextData
    };

    // Navigate to AI mode with context
    navigate('/ai', { 
      state: { 
        context: fullContext 
      } 
    });
  };

  return { sendToAI };
};