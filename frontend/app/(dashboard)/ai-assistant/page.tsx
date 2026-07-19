'use client';

import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Brain, Baby, HeartPulse, Users, Accessibility, Languages, BookOpen, Mic, MicOff } from 'lucide-react';
import { aiApi, getErrorMessage } from '@/lib/api';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

type ModuleType =
  | 'lost_child_assistant'
  | 'medical_emergency_assistant'
  | 'crowd_assistance'
  | 'accessibility_assistant'
  | 'translation_assistant'
  | 'knowledge_assistant';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const modules = [
  { id: 'lost_child_assistant' as ModuleType, icon: Baby, label: 'Lost Child', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' },
  { id: 'medical_emergency_assistant' as ModuleType, icon: HeartPulse, label: 'Medical', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-500/10' },
  { id: 'crowd_assistance' as ModuleType, icon: Users, label: 'Crowd', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-500/10' },
  { id: 'accessibility_assistant' as ModuleType, icon: Accessibility, label: 'Accessibility', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-500/10' },
  { id: 'translation_assistant' as ModuleType, icon: Languages, label: 'Translation', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10' },
  { id: 'knowledge_assistant' as ModuleType, icon: BookOpen, label: 'Knowledge', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-500/10' },
];

export default function AiAssistantPage() {
  const [activeModule, setActiveModule] = useState<ModuleType>('knowledge_assistant');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [chatId, setChatId] = useState<string | undefined>(undefined);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Reset chat when module changes
  useEffect(() => {
    setMessages([]);
    setChatId(undefined);
  }, [activeModule]);

  const { mutate: sendMessage, isPending } = useMutation({
    mutationFn: (message: string) => aiApi.chat(message, activeModule, chatId),
    onMutate: (message) => {
      // Optimistically add user message
      const userMsg: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: message,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
    },
    onSuccess: (response) => {
      const { response: aiResponse, chatId: newChatId } = response.data.data;
      if (newChatId) setChatId(newChatId);

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
      // Remove optimistic user message
      setMessages((prev) => prev.slice(0, -1));
    },
  });

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isPending) return;
    setInput('');
    sendMessage(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Voice input (browser Web Speech API)
  const toggleVoice = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      toast.error('Voice input not supported in this browser');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognition }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognition }).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => prev + transcript);
      inputRef.current?.focus();
    };
    recognition.onerror = () => {
      setIsListening(false);
      toast.error('Voice recognition failed');
    };

    recognition.start();
  };

  const currentModule = modules.find((m) => m.id === activeModule)!;

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <Brain className="w-6 h-6 text-white" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">AI Copilot</h1>
          <p className="text-sm text-muted-foreground">Powered by Google Gemini</p>
        </div>
      </div>

      {/* Module selector */}
      <div
        className="flex gap-1.5 overflow-x-auto pb-1 bg-muted/60 rounded-2xl p-1.5"
        role="tablist"
        aria-label="AI assistant modules"
        style={{ scrollbarWidth: 'none' }}
      >
        {modules.map((mod) => {
          const Icon = mod.icon;
          const isActive = activeModule === mod.id;
          return (
            <button
              key={mod.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveModule(mod.id)}
              className={cn(
                'flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1',
                isActive
                  ? 'bg-card text-foreground shadow-sm border border-border/50'
                  : 'text-muted-foreground hover:text-foreground hover:bg-card/60'
              )}
            >
              <Icon
                className={cn(
                  'w-4 h-4 transition-colors',
                  isActive ? mod.color : 'text-muted-foreground'
                )}
                aria-hidden="true"
              />
              {mod.label}
            </button>
          );
        })}
      </div>

      {/* Chat Area */}
      <div
        className="flex-1 bg-card border border-border rounded-2xl overflow-hidden flex flex-col min-h-0"
        role="log"
        aria-label="Chat conversation"
        aria-live="polite"
      >
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className={cn('w-16 h-16 rounded-2xl flex items-center justify-center mb-4', currentModule.bg)}>
                <currentModule.icon className={cn('w-8 h-8', currentModule.color)} aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">{currentModule.label} Assistant</h3>
              <p className="text-muted-foreground text-sm mt-2 max-w-sm">
                Describe your situation and the AI will provide immediate guidance, protocols, and recommendations.
              </p>

              {/* Starter prompts */}
              <div className="mt-4 grid grid-cols-1 gap-2 w-full max-w-sm">
                {getStarterPrompts(activeModule).map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => setInput(prompt)}
                    className="text-sm text-left px-4 py-2.5 bg-muted hover:bg-muted/80 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn('flex gap-3', msg.role === 'user' ? 'justify-end' : 'justify-start')}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-violet-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Brain className="w-4 h-4 text-white" aria-hidden="true" />
                  </div>
                )}
                <div
                  className={cn(
                    'max-w-[80%] px-4 py-3 text-sm leading-relaxed',
                    msg.role === 'user'
                      ? 'chat-user'
                      : 'chat-ai text-foreground'
                  )}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                  <div className="text-xs opacity-60 mt-1">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {isPending && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-violet-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Brain className="w-4 h-4 text-white" aria-hidden="true" />
              </div>
              <div className="chat-ai px-4 py-3" aria-label="AI is typing">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                      aria-hidden="true"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} aria-hidden="true" />
        </div>

        {/* Input */}
        <div className="border-t border-border p-3">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex items-end gap-2"
          >
            <div className="flex-1 relative">
              <label htmlFor="chat-input" className="sr-only">
                Message the AI assistant
              </label>
              <textarea
                id="chat-input"
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Describe the situation to ${currentModule.label} AI...`}
                rows={1}
                className="w-full px-4 py-3 pr-10 bg-muted border border-border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary text-sm placeholder-muted-foreground max-h-32 overflow-y-auto"
                style={{ minHeight: '48px' }}
                aria-label="Message input"
              />
            </div>
            <button
              type="button"
              onClick={toggleVoice}
              className={cn(
                'w-11 h-11 flex items-center justify-center rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-primary flex-shrink-0',
                isListening
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-muted text-muted-foreground hover:bg-accent'
              )}
              aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
              aria-pressed={isListening}
            >
              {isListening ? (
                <MicOff className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Mic className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
            <button
              type="submit"
              disabled={!input.trim() || isPending}
              className="w-11 h-11 flex items-center justify-center bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 flex-shrink-0"
              aria-label="Send message"
            >
              <Send className="w-5 h-5" aria-hidden="true" />
            </button>
          </form>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Press Enter to send • Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}

function getStarterPrompts(module: ModuleType): string[] {
  const prompts: Record<ModuleType, string[]> = {
    lost_child_assistant: [
      'A child aged 6 was last seen near Gate B wearing a red shirt.',
      'Child missing for 20 minutes, guardian is at Section 12 Row 5.',
    ],
    medical_emergency_assistant: [
      'Fan collapsed in Section 7, unconscious, breathing shallow.',
      'Person having seizure near food court, Section C.',
    ],
    crowd_assistance: [
      'Heavy crowd buildup at Gate 4, people pushing and getting stressed.',
      'Exit routes from main stands are extremely congested.',
    ],
    accessibility_assistant: [
      'Wheelchair user needs to get from Gate A to Section 22.',
      'Elderly visitor with walking difficulties needs help reaching their seat.',
    ],
    translation_assistant: [
      'Translate this announcement to Spanish and Arabic: "Please proceed to your seats."',
      'Help me communicate with a French-speaking family who are lost.',
    ],
    knowledge_assistant: [
      'What is the procedure for a medical emergency in the stands?',
      'What are the evacuation protocols for this stadium?',
    ],
  };
  return prompts[module] || [];
}

// Type declaration for SpeechRecognition
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  lang: string;
  onstart: () => void;
  onend: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: () => void;
  start: () => void;
}

interface SpeechRecognitionEvent {
  results: { 0: { 0: { transcript: string } } };
}
