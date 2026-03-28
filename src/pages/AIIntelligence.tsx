import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { ConversationApi } from '../services/conversationApi';
import { BusinessVitalityIndex } from '../types/analytics';
import { Message, Conversation, LiveMetrics, KPIs } from '../types/chat';
import { BVIPopup } from '../components/bvi/BVIPopup';
import { ChatInterface } from '../components/chat/ChatInterface';
import { ConversationHistory } from '../components/chat/ConversationHistory';
import { MetricsCards } from '../components/chat/MetricsCards';


export const AIIntelligence: React.FC = () => {
  const location = useLocation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [liveData, setLiveData] = useState<any>(null);
  const [streamingResponse, setStreamingResponse] = useState('');
  const [currentThinking, setCurrentThinking] = useState('');
  const [thinkingChain, setThinkingChain] = useState<any[]>([]);
  const [toolChain, setToolChain] = useState<any[]>([]);
  const [liveActivity, setLiveActivity] = useState<{ activity: string; tool?: string; progress?: any }>({ activity: 'Waiting for input...' });
  const eventSourceRef = useRef<EventSource | null>(null);
  const [isHistoryCollapsed, setIsHistoryCollapsed] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [finalAnswerStarted, setFinalAnswerStarted] = useState(false);
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null);
  const [businessVitality, setBusinessVitality] = useState<BusinessVitalityIndex | null>(null);
  const [liveMetrics, setLiveMetrics] = useState<LiveMetrics | null>(null);
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [showBVIInfo, setShowBVIInfo] = useState(false);
  
  // Responsive state
  const [isMobileHistoryOpen, setIsMobileHistoryOpen] = useState(false);
  const [isMetricsCollapsed, setIsMetricsCollapsed] = useState(() => {
    const saved = localStorage.getItem('metricsCollapsed');
    return saved ? JSON.parse(saved) : false;
  });

  // Persist metrics collapsed state
  useEffect(() => {
    localStorage.setItem('metricsCollapsed', JSON.stringify(isMetricsCollapsed));
  }, [isMetricsCollapsed]);

  // Handle ESC key to close BVI overlay and mobile history
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showBVIInfo) setShowBVIInfo(false);
        if (isMobileHistoryOpen) setIsMobileHistoryOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showBVIInfo, isMobileHistoryOpen]);

  // Initialize session and load conversations on component mount
  useEffect(() => {
    createNewSession();
    loadConversations();
    loadMetrics();
  }, []);

  // Load metrics data
  const loadMetrics = async () => {
    try {
      // Load Business Vitality Index
      const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      const bviResponse = await fetch(`${apiBase}/api/business-vitality`);
      if (bviResponse.ok) {
        const bvi = await bviResponse.json();
        setBusinessVitality(bvi);
      }

      // Load Live Metrics (yesterday's data)
      const liveMetricsResponse = await fetch(`${apiBase}/api/live-metrics`);
      if (liveMetricsResponse.ok) {
        const live = await liveMetricsResponse.json();
        setLiveMetrics(live);
      }

      // Load KPIs
      const kpisResponse = await fetch(`${apiBase}/api/kpis`);
      if (kpisResponse.ok) {
        const kpiData = await kpisResponse.json();
        setKpis(kpiData);
      }
    } catch (error) {
      console.error('Failed to load metrics:', error);
    }
  };

  const loadConversations = async () => {
    try {
      const { conversations: convs } = await ConversationApi.getConversations();
      const mappedConvs: Conversation[] = convs.map(conv => ({
        id: conv.id,
        title: conv.title,
        created_at: conv.created_at,
        updated_at: conv.updated_at,
        message_count: conv.message_count ?? 0,
        lastMessage: conv.last_message || '',
        timestamp: new Date(conv.updated_at),
        messages: []
      }));
      setConversations(mappedConvs);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  // Get context from navigation state
  useEffect(() => {
    if (location.state?.context) {
      // Context passed from dashboard
      setLiveData(location.state.context);
      
      // Auto-generate initial query based on context
      if (location.state.context.query) {
        setMessage(location.state.context.query);
      }
    }
  }, [location.state]);

  // Fetch real-time metrics
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiBase}/api/executive-summary`);
        await response.json();
        // Real-time metrics handled by live metrics state
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      }
    };

    fetchMetrics();
    // Refresh metrics every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

    // Close any existing EventSource
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date(),
      context: liveData
    };

    setMessages([...messages, newMessage]);
    
    // Save user message to database if we have an active conversation
    // Note: Title generation is now deferred until after AI response completion
    if (activeConversation) {
      try {
        await ConversationApi.addMessage(activeConversation, 'user', message);
      } catch (error) {
        console.error('Failed to save user message:', error);
      }
    }
    setMessage('');
    setIsLoading(true);
    setStreamingResponse('');
    setCurrentThinking('');
    setThinkingChain([]);
    setToolChain([]);
    setLiveActivity({ activity: 'Initializing...' });
    setFinalAnswerStarted(false);  // Reset final answer flag
    let responseText = '';

    // Ensure we have a session ID
    const currentSessionId = sessionId || await createNewSession();

    // Create EventSource for SSE with session ID
    const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:8000';
    const apiUrl = `${apiBase}/api/claude/stream?prompt=${encodeURIComponent(message)}&session_id=${encodeURIComponent(currentSessionId)}`;
    const es = new EventSource(apiUrl);
    
    eventSourceRef.current = es;

    es.onerror = (error) => {
      console.error('[Chain of Thought] EventSource error:', error);
      setIsLoading(false);
      setLiveActivity({ activity: 'Connection error. Please check if the API server is running.' });
    };

    es.onopen = () => {
      console.log('EventSource connection opened');
      setLiveActivity({ activity: 'Connected to AI service' });
    };

    es.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'status':
          // Status updates handled by live activity
          break;
          
        case 'connection_status':
          // Connection status handled elsewhere
          break;
          
        case 'live_activity':
          setLiveActivity({
            activity: data.activity,
            tool: data.tool,
            progress: data.progress
          });
          break;
          
        case 'progress':
          setLiveActivity(prev => ({
            ...prev,
            progress: {
              current: data.current,
              total: data.total,
              percentage: Math.round((data.current / data.total) * 100)
            }
          }));
          break;
          
        case 'activity':
          // Activity updates handled elsewhere
          break;
          
        case 'status_text':
          // Status/narration text - show as activity, not in answer
          setLiveActivity({
            activity: data.text,
            tool: 'Claude',
            progress: null
          });
          break;
          
        case 'final_start':
          // Start of final answer - clear any previous streaming
          responseText = '';
          setStreamingResponse('');
          setFinalAnswerStarted(true);  // Mark that final answer has started
          if (data.fallback) {
            console.log('Using fallback answer due to missing SDK result event');
          }
          break;
          
        case 'final_text_delta':
          // Append text incrementally - this is the ONLY final answer content
          responseText += data.text;
          setStreamingResponse(responseText);
          break;
          
        case 'final_done':
          // Final answer complete
          if (data.fallback) {
            console.log('Fallback answer complete:', data.note);
          }
          break;
          
        case 'text_delta':
          // Legacy support - treat as final answer
          console.warn('Received legacy text_delta event - update backend');
          responseText += data.text;
          setStreamingResponse(responseText);
          break;
          
        case 'thinking_delta':
          // Legacy thinking event - should not be used anymore
          console.warn('Received legacy thinking_delta event');
          setCurrentThinking(data.text);
          if (data.text && !thinkingChain.some(t => t.content === data.text)) {
            setThinkingChain(prev => [...prev, {
              type: 'thinking',
              content: data.text,
              timestamp: Date.now() / 1000
            }]);
          }
          break;
          
        case 'thinking_chain_update':
          // Update the thinking and tool chains
          setThinkingChain(data.thinking_chain || []);
          setToolChain(data.tool_chain || []);
          break;
          
        case 'thinking_chain_complete':
          // Mark thinking as complete and prepare for final answer
          console.log('Received thinking_chain_complete:', {
            thinkingChain: data.thinking_chain,
            toolChain: data.tool_chain
          });
          setThinkingChain(data.thinking_chain || []);
          setToolChain(data.tool_chain || []);
          break;
          
        case 'done':
          es.close();
          setLiveActivity({ activity: 'Analysis complete!' });
          
          // Use chains from the done event if provided, otherwise use state
          const finalThinkingChain = data.thinking_chain || thinkingChain;
          const finalToolChain = data.tool_chain || toolChain;
          
          console.log('Saving message with chains:', {
            thinkingChainLength: finalThinkingChain.length,
            toolChainLength: finalToolChain.length,
            thinkingChain: finalThinkingChain,
            toolChain: finalToolChain
          });
          
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: responseText,
            timestamp: new Date(),
            thinkingChain: finalThinkingChain,
            toolChain: finalToolChain
          };
          
          setMessages(prev => [...prev, assistantMessage]);
          
          // Save assistant message to database if we have an active conversation
          if (activeConversation) {
            ConversationApi.addMessage(
              activeConversation, 
              'assistant', 
              responseText,
              { 
                thinkingChain: finalThinkingChain,
                toolChain: finalToolChain
              }
            ).then(result => {
              console.log('Assistant message saved successfully');
              
              // Generate conversation title after AI response completion (deferred)
              // This provides better UX by not blocking the initial user interaction
              ConversationApi.generateTitleDeferred(activeConversation).then(titleResult => {
                if (titleResult.success && titleResult.conversation) {
                  console.log('✓ Generated deferred title:', titleResult.conversation.title);
                  
                  // Update conversation title in the sidebar
                  setConversations(prevConversations => 
                    prevConversations.map(conv => 
                      conv.id === activeConversation 
                        ? { ...conv, title: titleResult.conversation.title }
                        : conv
                    )
                  );
                }
              }).catch(titleError => {
                console.error('Failed to generate deferred title:', titleError);
                // Non-critical error - don't disrupt user experience
              });
              
            }).catch(error => {
              console.error('Failed to save assistant message:', error);
            });
          }
          setIsLoading(false);
          setStreamingResponse('');
          setCurrentThinking('');
          setThinkingChain([]);
          setToolChain([]);
          setFinalAnswerStarted(false);
          break;
          
        case 'error':
          es.close();
          const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: `Error: ${data.message}`,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, errorMessage]);
          setIsLoading(false);
          setStreamingResponse('');
          setCurrentThinking('');
          setLiveActivity({ activity: 'Error occurred' });
          break;
      }
    };

    es.onerror = (error) => {
      console.error('EventSource error:', error);
      es.close();
      setIsLoading(false);
      setLiveActivity({ activity: 'Disconnected' });
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Connection error. Unable to reach the AI service at ${apiBase}. Please ensure the API server is running.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
      setStreamingResponse('');
      setLiveActivity({ activity: 'Connection lost' });
    };
  };

  const createNewSession = async () => {
    try {
      const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiBase}/api/claude/session/new`);
      const data = await response.json();
      setSessionId(data.session_id);
      return data.session_id;
    } catch (error) {
      console.error('Failed to create new session:', error);
      // Fall back to generating UUID on client side
      const newSessionId = Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9);
      setSessionId(newSessionId);
      return newSessionId;
    }
  };

  const startNewConversation = async () => {
    await createNewSession();

    try {
      const apiConv = await ConversationApi.createConversation();
      const newConv: Conversation = {
        id: apiConv.id,
        title: apiConv.title,
        created_at: apiConv.created_at,
        updated_at: apiConv.updated_at,
        message_count: 0,
        lastMessage: '',
        timestamp: new Date(apiConv.created_at),
        messages: []
      };
      
      setConversations([newConv, ...conversations]);
      setActiveConversation(newConv.id);
      setMessages([]);
      setThinkingChain([]);
      setToolChain([]);
      setCurrentThinking('');
      setStreamingResponse('');
    } catch (error) {
      console.error('Failed to create conversation:', error);
      // Fallback to local-only conversation
      const newConv: Conversation = {
        id: Date.now().toString(),
        title: 'New Analysis',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        message_count: 0,
        lastMessage: '',
        timestamp: new Date(),
        messages: []
      };
      setConversations([newConv, ...conversations]);
      setActiveConversation(newConv.id);
      setMessages([]);
      setThinkingChain([]);
      setToolChain([]);
      setCurrentThinking('');
      setStreamingResponse('');
    }
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      await ConversationApi.deleteConversation(id);
      setConversations(conversations.filter(c => c.id !== id));
      if (activeConversation === id) {
        setActiveConversation(null);
        setMessages([]);
      }
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  const handleRenameConversation = async (id: string, newTitle: string) => {
    try {
      await ConversationApi.updateConversation(id, { title: newTitle });
      setConversations(conversations.map(c => 
        c.id === id ? { ...c, title: newTitle } : c
      ));
      setEditingId(null);
      setEditingTitle('');
    } catch (error) {
      console.error('Failed to rename conversation:', error);
    }
  };

  const handleExportConversation = async (id: string) => {
    try {
      const conv = await ConversationApi.getConversation(id);
      const blob = new Blob([JSON.stringify(conv, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `conversation-${id}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export conversation:', error);
    }
  };

  const suggestedQueries = [
    "What are today's top performing stores?",
    "Analyze customer retention trends",
    "Show me revenue patterns by platform",
    "Identify menu optimization opportunities",
    "Predict next week's sales",
    "Compare weekday vs weekend performance"
  ];

  return (
    <div className="h-screen flex flex-col lg:flex-row bg-gray-50 overflow-hidden">
      {/* Mobile Header - Only visible on mobile */}
      <div className="lg:hidden flex items-center justify-between bg-white border-b border-gray-200 px-4 py-3">
        <button
          onClick={() => setIsMobileHistoryOpen(true)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Open conversations"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <img src="/aza-logo.svg" alt="Aza Fashions" className="h-6 w-auto" />
          <span className="text-sm font-semibold text-gray-700">AI Intelligence</span>
        </div>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Mobile History Overlay */}
      {isMobileHistoryOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-50 bg-black/50"
          onClick={() => setIsMobileHistoryOpen(false)}
        >
          <div 
            className="w-80 max-w-[85vw] h-full bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <ConversationHistory
              isHistoryCollapsed={false}
              setIsHistoryCollapsed={() => setIsMobileHistoryOpen(false)}
              conversations={conversations}
              activeConversation={activeConversation}
              setActiveConversation={(id) => {
                setActiveConversation(id);
                setIsMobileHistoryOpen(false);
              }}
              editingId={editingId}
              setEditingId={setEditingId}
              editingTitle={editingTitle}
              setEditingTitle={setEditingTitle}
              showMenu={showMenu}
              setShowMenu={setShowMenu}
              setMessages={setMessages}
              startNewConversation={() => {
                startNewConversation();
                setIsMobileHistoryOpen(false);
              }}
              handleRenameConversation={handleRenameConversation}
              handleExportConversation={handleExportConversation}
              setDeleteConfirm={setDeleteConfirm}
            />
          </div>
        </div>
      )}

      {/* Left Panel - Conversation History (Desktop only) */}
      <div className="hidden lg:block">
        <ConversationHistory
          isHistoryCollapsed={isHistoryCollapsed}
          setIsHistoryCollapsed={setIsHistoryCollapsed}
          conversations={conversations}
          activeConversation={activeConversation}
          setActiveConversation={setActiveConversation}
          editingId={editingId}
          setEditingId={setEditingId}
          editingTitle={editingTitle}
          setEditingTitle={setEditingTitle}
          showMenu={showMenu}
          setShowMenu={setShowMenu}
          setMessages={setMessages}
          startNewConversation={startNewConversation}
          handleRenameConversation={handleRenameConversation}
          handleExportConversation={handleExportConversation}
          setDeleteConfirm={setDeleteConfirm}
        />
      </div>

      {/* Middle Panel - Chat Interface */}
      <ChatInterface
        messages={messages}
        message={message}
        setMessage={setMessage}
        handleSendMessage={handleSendMessage}
        isLoading={isLoading}
        suggestedQueries={suggestedQueries}
        liveData={liveData}
        streamingResponse={streamingResponse}
        currentThinking={currentThinking}
        thinkingChain={thinkingChain}
        toolChain={toolChain}
        finalAnswerStarted={finalAnswerStarted}
        liveActivity={liveActivity}
        messagesEndRef={messagesEndRef}
        isProcessing={false}
      />

      {/* Right Panel - Metrics Dashboard (Desktop only, collapsible) */}
      <div className="hidden lg:block">
        <MetricsCards
          businessVitality={businessVitality}
          liveMetrics={liveMetrics}
          kpis={kpis}
          setShowBVIInfo={setShowBVIInfo}
          isCollapsed={isMetricsCollapsed}
          setIsCollapsed={setIsMetricsCollapsed}
        />
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Delete Conversation?</h3>
            <p className="text-gray-600 mb-4">
              "{deleteConfirm.title}" will be permanently deleted.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteConversation(deleteConfirm.id)}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Business Vitality Index Popup */}
      <BVIPopup
        isOpen={showBVIInfo}
        onClose={() => setShowBVIInfo(false)}
        businessVitality={businessVitality}
      />
    </div>
  );
};