import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Plus,
  Menu,
  User,
  MoreVertical,
  Edit2,
  FileDown,
  Trash2,
  Check,
  X,
  LogIn
} from 'lucide-react';
import { clsx } from 'clsx';
import { ConversationApi } from '../../services/conversationApi';
import { Message, Conversation } from '../../types/chat';
import { useAuth } from '../../contexts/AuthContext';

interface ConversationHistoryProps {
  isHistoryCollapsed: boolean;
  setIsHistoryCollapsed: (collapsed: boolean) => void;
  conversations: Conversation[];
  activeConversation: string | null;
  setActiveConversation: (id: string | null) => void;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  editingTitle: string;
  setEditingTitle: (title: string) => void;
  showMenu: string | null;
  setShowMenu: (id: string | null) => void;
  setMessages: (messages: Message[]) => void;
  startNewConversation: () => void;
  handleRenameConversation: (id: string, title: string) => void;
  handleExportConversation: (id: string) => void;
  setDeleteConfirm: (confirm: { id: string; title: string } | null) => void;
}

export const ConversationHistory: React.FC<ConversationHistoryProps> = ({
  isHistoryCollapsed,
  setIsHistoryCollapsed,
  conversations,
  activeConversation,
  setActiveConversation,
  editingId,
  setEditingId,
  editingTitle,
  setEditingTitle,
  showMenu,
  setShowMenu,
  setMessages,
  startNewConversation,
  handleRenameConversation,
  handleExportConversation,
  setDeleteConfirm
}) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  
  const handleConversationClick = async (conv: Conversation) => {
    setActiveConversation(conv.id);
    try {
      const fullConv = await ConversationApi.getConversation(conv.id);
      if (fullConv.messages) {
        const mappedMessages: Message[] = fullConv.messages.map(msg => ({
          id: msg.id,
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
          timestamp: new Date(msg.timestamp),
          thinkingChain: msg.metadata?.thinkingChain,
          toolChain: msg.metadata?.toolChain,
          activities: msg.metadata?.activities
        }));
        setMessages(mappedMessages);
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
      setMessages([]);
    }
  };

  return (
    <div className={clsx(
      "bg-white border-r border-gray-200 flex flex-col h-screen transition-all duration-300",
      isHistoryCollapsed ? "w-16" : "w-64"
    )}>
      <div className={clsx("border-b border-gray-200", isHistoryCollapsed ? "p-2" : "p-4")}>
        {!isHistoryCollapsed ? (
          <div className="flex items-center gap-3">
            <button
              onClick={() => startNewConversation()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-danger-600 to-rose-600 text-white rounded-lg hover:from-danger-700 hover:to-rose-700 transition-all duration-200 shadow-soft text-sm font-medium"
              title="Start fresh conversation with new context"
            >
              <Plus className="w-4 h-4" />
              <span>New Conversation</span>
            </button>
            <button
              onClick={() => setIsHistoryCollapsed(true)}
              className="p-3 hover:bg-gray-100 rounded-lg transition-colors"
              title="Close conversations"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsHistoryCollapsed(false)}
            className="w-full p-3 hover:bg-gray-100 rounded-lg transition-colors group flex items-center justify-center"
            title="Open conversations"
          >
            <Menu className="w-5 h-5 text-gray-600 group-hover:text-danger-600 flex-shrink-0" />
          </button>
        )}
      </div>

      {/* Collapsed state - vertical icon menu */}
      {isHistoryCollapsed && (
        <div className="flex-1 flex flex-col items-center py-4 space-y-4">
          <button
            onClick={() => startNewConversation()}
            className="p-3 hover:bg-gray-100 rounded-lg transition-colors group"
            title="New conversation"
          >
            <Plus className="w-5 h-5 text-gray-600 group-hover:text-danger-600" />
          </button>

          {/* Visual indicators for recent conversations */}
          <div className="flex-1 flex flex-col items-center justify-center space-y-2 py-4">
            {conversations.slice(0, 3).map((_, idx) => (
              <div
                key={idx}
                className="w-1.5 h-6 bg-gray-300 rounded-full"
                style={{ opacity: 1 - (idx * 0.25) }}
              />
            ))}
          </div>

          {isAuthenticated ? (
            <div className="relative">
              <button
                className="p-3 hover:bg-gray-100 rounded-lg transition-colors group"
                title={user?.name || 'Profile'}
                onClick={() => setShowMenu(showMenu === 'profile-menu' ? null : 'profile-menu')}
              >
                <div className="relative">
                  <User className="w-5 h-5 text-green-600" />
                  <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-white" />
                </div>
              </button>
              
              {/* Profile dropdown menu */}
              {showMenu === 'profile-menu' && (
                <div className="absolute left-12 bottom-0 bg-white shadow-lg rounded-lg py-2 z-50 min-w-[160px] border border-gray-200">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setShowMenu(null);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <LogIn className="w-3 h-3 rotate-180" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              className="p-3 hover:bg-gray-100 rounded-lg transition-colors group"
              title="Login / Sign up"
              onClick={() => navigate('/login')}
            >
              <LogIn className="w-5 h-5 text-gray-600 group-hover:text-danger-600" />
            </button>
          )}
        </div>
      )}

      <div className={clsx(
        "flex-1 overflow-y-auto p-4 space-y-2",
        isHistoryCollapsed && "hidden"
      )}>
        {conversations.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No conversations yet</p>
            <p className="text-xs text-gray-400 mt-1">Start a new analysis to begin</p>
          </div>
        ) : (
          conversations.map(conv => (
            <div
              key={conv.id}
              className={clsx(
                "group relative rounded-lg transition-all duration-200",
                activeConversation === conv.id
                  ? "bg-rose-50 border border-rose-200"
                  : "hover:bg-gray-50"
              )}
            >
              {editingId === conv.id ? (
                // Edit mode
                <div className="flex items-center px-3 py-2 gap-2">
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleRenameConversation(conv.id, editingTitle);
                      } else if (e.key === 'Escape') {
                        setEditingId(null);
                        setEditingTitle('');
                      }
                    }}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-rose-500"
                    autoFocus
                  />
                  <button
                    onClick={() => handleRenameConversation(conv.id, editingTitle)}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <Check className="w-4 h-4 text-green-600" />
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setEditingTitle('');
                    }}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              ) : (
                // Normal mode
                <div
                  className="flex items-center justify-between px-3 py-2 cursor-pointer"
                  onClick={() => handleConversationClick(conv)}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-sm text-gray-900 truncate">{conv.title}</span>
                  </div>
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(showMenu === conv.id ? null : conv.id);
                      }}
                      className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-200 rounded transition-all"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-600" />
                    </button>
                    
                    {/* Dropdown menu */}
                    {showMenu === conv.id && (
                      <div className="absolute right-0 top-8 bg-white shadow-lg rounded-md py-1 z-50 min-w-[120px]">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingId(conv.id);
                            setEditingTitle(conv.title);
                            setShowMenu(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                        >
                          <Edit2 className="w-3 h-3" />
                          Rename
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExportConversation(conv.id);
                            setShowMenu(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                        >
                          <FileDown className="w-3 h-3" />
                          Export
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirm({ id: conv.id, title: conv.title });
                            setShowMenu(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600 flex items-center gap-2"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};