import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { agentApi } from '../services/api';
import { cn } from '../lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export const AgentChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [currentResponse, setCurrentResponse] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (isOpen && !conversationId) {
      initializeConversation();
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentResponse]);

  useEffect(() => {
    console.log('💬 Messages updated, count:', messages.length);
    messages.forEach((msg, idx) => {
      console.log(`  ${idx}: [${msg.role}] ${msg.content.substring(0, 50)}...`);
    });
  }, [messages]);

  const initializeConversation = async () => {
    try {
      setConnectionStatus('connecting');
      console.log('🔄 Initializing conversation...');
      console.log('📍 Agent ID: 01KMMP47FP6R75PX6R5VTG6SHE');
      console.log('📍 Endpoint: /api/taskade/agents/01KMMP47FP6R75PX6R5VTG6SHE/public-conversations');
      
      const convoId = await agentApi.createConversation();
      console.log('✅ Conversation created:', convoId);
      setConversationId(convoId);
      
      // Open SSE stream
      const streamUrl = agentApi.getStreamUrl(convoId);
      console.log('🌊 Opening stream:', streamUrl);
      const eventSource = new EventSource(streamUrl);
      eventSourceRef.current = eventSource;

      let currentMessageId = '';
      let accumulatedText = '';

      eventSource.onopen = () => {
        console.log('✅ Stream connected successfully');
        setConnectionStatus('connected');
      };

      eventSource.onmessage = (event) => {
        console.log('📨 Stream message:', event.data);
        const data = JSON.parse(event.data);

        switch (data.type) {
          case 'start':
            currentMessageId = data.messageId;
            accumulatedText = '';
            setCurrentResponse('');
            setIsLoading(true);
            break;

          case 'text-delta':
            accumulatedText += data.delta;
            setCurrentResponse(accumulatedText);
            break;

          case 'finish':
            console.log('✅ Message finished, accumulated text length:', accumulatedText.length);
            console.log('Final content:', accumulatedText);
            if (accumulatedText) {
              const finalContent = accumulatedText;
              setMessages(prev => {
                const newMessages = [...prev, {
                  id: currentMessageId || Date.now().toString(),
                  role: 'assistant',
                  content: finalContent
                }];
                console.log('📝 Messages after adding:', newMessages.length);
                return newMessages;
              });
            }
            setCurrentResponse('');
            setIsLoading(false);
            accumulatedText = '';
            currentMessageId = '';
            break;

          case 'error':
            console.error('❌ Stream error:', data.errorText);
            setMessages(prev => [...prev, {
              id: Date.now().toString(),
              role: 'assistant',
              content: '❌ Sorry, I encountered an error. Please try again.'
            }]);
            setCurrentResponse('');
            setIsLoading(false);
            break;
        }
      };

      eventSource.onerror = (error) => {
        console.error('❌ EventSource error:', error);
        console.error('EventSource readyState:', eventSource.readyState);
        setConnectionStatus('disconnected');
        
        // Only show error if we haven't connected yet
        if (eventSource.readyState === EventSource.CLOSED) {
          setMessages(prev => {
            // Don't add duplicate error messages
            const lastMessage = prev[prev.length - 1];
            if (lastMessage?.content.includes('Connection lost')) {
              return prev;
            }
            return [...prev, {
              id: Date.now().toString(),
              role: 'assistant',
              content: '⚠️ Connection lost. The agent stream disconnected. Please try refreshing the page.'
            }];
          });
        }
        setIsLoading(false);
      };

      // Add greeting message
      setMessages([{
        id: 'greeting',
        role: 'assistant',
        content: "👋 Hi! I'm your CRM Assistant. I can help you manage clients, track deals, and optimize your sales pipeline. What would you like to know?"
      }]);
    } catch (error: any) {
      console.error('❌ Failed to initialize conversation:', error);
      
      let errorMessage = 'Unknown error';
      let statusCode = '';
      
      if (error.response) {
        // The request was made and the server responded with a status code
        statusCode = `${error.response.status}`;
        errorMessage = error.response.data?.message || error.response.statusText || error.message;
        console.error('Response error:', error.response.status, error.response.data);
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'No response from server';
        console.error('Request error:', error.request);
      } else {
        // Something happened in setting up the request
        errorMessage = error.message;
        console.error('Error details:', errorMessage);
      }
      
      setConnectionStatus('disconnected');
      
      setMessages([{
        id: 'error',
        role: 'assistant',
        content: `❌ Failed to connect to the agent.\n\nError: Request failed with status code ${statusCode}\n${errorMessage}\n\nPlease refresh the page and try again. If the problem persists, check the browser console for more details.`
      }]);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !conversationId || isLoading) return;

    const messageText = input.trim();
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      console.log('Sending message:', messageText);
      await agentApi.sendMessage(conversationId, messageText);
      console.log('Message sent successfully');
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: '❌ Failed to send message. Please try again.'
      }]);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-4 right-4 md:bottom-6 md:right-6 w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-r from-violet-500 to-pink-500 text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all z-50 flex items-center justify-center"
          >
            <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-0 right-0 md:bottom-6 md:right-6 w-full h-full md:w-96 md:h-[600px] md:rounded-2xl backdrop-blur-2xl bg-white/90 dark:bg-slate-900/90 border-t md:border border-slate-200 dark:border-slate-700 shadow-2xl z-50 flex flex-col overflow-hidden safe-top safe-bottom"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-violet-500/10 to-pink-500/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-violet-500 to-pink-500 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">CRM Assistant</div>
                    <div className="flex items-center gap-1.5 text-xs">
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        connectionStatus === 'connected' && "bg-green-500 animate-pulse",
                        connectionStatus === 'connecting' && "bg-yellow-500 animate-pulse",
                        connectionStatus === 'disconnected' && "bg-red-500"
                      )} />
                      <span className="text-slate-500 dark:text-slate-400">
                        {connectionStatus === 'connected' && 'Connected'}
                        {connectionStatus === 'connecting' && 'Connecting...'}
                        {connectionStatus === 'disconnected' && 'Disconnected'}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'flex',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[80%] p-3 rounded-2xl',
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-violet-500 to-pink-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                    )}
                  >
                    {message.role === 'assistant' ? (
                      <div className="text-sm prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Conversation Starters */}
              {messages.length === 1 && messages[0].id === 'greeting' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-2"
                >
                  <p className="text-xs text-slate-500 dark:text-slate-400 px-1">Try asking:</p>
                  <button
                    onClick={() => {
                      setInput('Show me my highest value deals');
                      setTimeout(() => handleSend(), 100);
                    }}
                    className="w-full text-left p-3 rounded-xl bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-200 dark:border-violet-800 hover:border-violet-300 dark:hover:border-violet-700 transition-all text-sm text-slate-700 dark:text-slate-300"
                  >
                    💎 Show me my highest value deals
                  </button>
                  <button
                    onClick={() => {
                      setInput('Which clients need follow-up?');
                      setTimeout(() => handleSend(), 100);
                    }}
                    className="w-full text-left p-3 rounded-xl bg-gradient-to-r from-pink-500/10 to-rose-500/10 border border-pink-200 dark:border-pink-800 hover:border-pink-300 dark:hover:border-pink-700 transition-all text-sm text-slate-700 dark:text-slate-300"
                  >
                    📞 Which clients need follow-up?
                  </button>
                  <button
                    onClick={() => {
                      setInput('Analyze my pipeline health');
                      setTimeout(() => handleSend(), 100);
                    }}
                    className="w-full text-left p-3 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all text-sm text-slate-700 dark:text-slate-300"
                  >
                    📊 Analyze my pipeline health
                  </button>
                  <button
                    onClick={() => {
                      setInput('What are my top priorities today?');
                      setTimeout(() => handleSend(), 100);
                    }}
                    className="w-full text-left p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-200 dark:border-amber-800 hover:border-amber-300 dark:hover:border-amber-700 transition-all text-sm text-slate-700 dark:text-slate-300"
                  >
                    ⭐ What are my top priorities today?
                  </button>
                </motion.div>
              )}

              {/* Current streaming response */}
              {currentResponse && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="max-w-[80%] p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white">
                    <div className="text-sm prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {currentResponse}
                      </ReactMarkdown>
                    </div>
                  </div>
                </motion.div>
              )}

              {isLoading && !currentResponse && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about your clients..."
                  className="flex-1 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="p-2 rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
