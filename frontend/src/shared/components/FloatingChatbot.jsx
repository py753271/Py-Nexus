import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, Sparkles, AlertCircle, RefreshCw, Cpu, Zap, Info, Copy, Check, BarChart2, Mic, MicOff, Volume2, Play, Pause, Square } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../utils/api";
import { useUser } from "../../context/UserContext";
import { marked } from "marked";
import DOMPurify from "dompurify";

const STUDENT_SUGGESTIONS = [
  { text: "My active courses?", query: "what are my active courses?", icon: "📖" },
  { text: "Latest announcements?", query: "summarize latest announcements", icon: "📢" },
  { text: "How to submit a report?", query: "how do i submit a report?", icon: "📝" },
  { text: "Who is my mentor?", query: "who is my mentor?", icon: "👤" },
];

const MENTOR_SUGGESTIONS = [
  { text: "Review submissions?", query: "pending submissions", icon: "📑" },
  { text: "My assigned interns?", query: "my interns", icon: "👥" },
  { text: "How to issue a task?", query: "how do i issue a task?", icon: "🔧" },
  { text: "Mentor guidelines?", query: "mentor guidelines", icon: "📋" },
];

const ADMIN_SUGGESTIONS = [
  { text: "Global system stats?", query: "stats", icon: "📊" },
  { text: "Available courses?", query: "what courses are available?", icon: "🎓" },
  { text: "View departments?", query: "list departments", icon: "🏢" },
  { text: "List active interns?", query: "list active interns", icon: "👥" },
];

const SUPER_ADMIN_SUGGESTIONS = [
  { text: "View system audit logs?", query: "audit logs", icon: "📜" },
  { text: "List role permissions?", query: "list role permissions", icon: "🔑" },
  { text: "Organization settings?", query: "organization settings", icon: "⚙️" },
  { text: "Database stats?", query: "database stats", icon: "💾" },
];

const FloatingChatbot = () => {
  const { user } = useUser();

  const getSuggestions = () => {
    if (!user) return STUDENT_SUGGESTIONS;
    if (user.role === "ADMIN") {
      const email = user.email || "";
      if (email.toLowerCase().includes("superadmin")) {
        return SUPER_ADMIN_SUGGESTIONS;
      }
      return ADMIN_SUGGESTIONS;
    }
    if (user.role === "INSTRUCTOR") {
      return MENTOR_SUGGESTIONS;
    }
    return STUDENT_SUGGESTIONS;
  };

  const suggestions = getSuggestions();

  const [isOpen, setIsOpen] = useState(false);
  const [isAiConfigured, setIsAiConfigured] = useState(true);
  const [showBanner, setShowBanner] = useState(true);
  
  const getWelcomeText = (currentUser) => {
    if (!currentUser) return "Hello, there! 🖐️ I'm the Py Nexus AI Assistant. How can I help you clear your doubts today?";
    
    if (currentUser.role === "ADMIN") {
      const email = currentUser.email || "";
      if (email.toLowerCase().includes("superadmin")) {
        return `Hello, Super Admin! 🖐️ I'm the Py Nexus Root Assistant. Ready to review system configurations, audit logs, or database status?`;
      }
      return `Hello, Admin! 🖐️ I'm the Py Nexus Management Assistant. Ready to help you review statistics or manage course systems?`;
    }
    
    if (currentUser.role === "INSTRUCTOR") {
      return `Hello, Coach ${currentUser.name}! 🖐️ I'm the Py Nexus Instructor Assistant. Ready to check intern submissions or task guidelines?`;
    }
    
    return `Hello, ${currentUser.name}! 🖐️ I'm the Py Nexus Learning Assistant. How can I help you with your courses, tasks, or daily reports today?`;
  };

  const [messages, setMessages] = useState(() => [
    {
      id: "init",
      sender: "bot",
      text: getWelcomeText(user),
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);
  const [copiedId, setCopiedId] = useState(null);
  const textareaRef = useRef(null);
  const abortControllerRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [fetchingAnalytics, setFetchingAnalytics] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState("");
  const [currentSpeakingMsgId, setCurrentSpeakingMsgId] = useState(null);
  const [isSpeechPaused, setIsSpeechPaused] = useState(false);

  const recognitionRef = useRef(null);
  const baseInputRef = useRef("");
  const utteranceRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = navigator.language || "en-US";

      rec.onresult = (event) => {
        let SpeechToText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          SpeechToText += event.results[i][0].transcript;
        }
        setInput(baseInputRef.current ? `${baseInputRef.current} ${SpeechToText}` : SpeechToText);
      };

      rec.onerror = (e) => {
        console.error("Speech recognition error:", e);
        setIsRecording(false);
        if (e.error === 'not-allowed') {
          setError("Microphone permission denied. Please allow access in browser settings.");
        }
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = rec;
    }

    const updateVoices = () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        const list = window.speechSynthesis.getVoices();
        setVoices(list);
        if (list.length > 0) {
          const defaultVoice = list.find(v => v.lang.startsWith('en')) || list[0];
          setSelectedVoiceName(prev => prev || defaultVoice.name);
        }
      }
    };

    updateVoices();
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        setError("");
        baseInputRef.current = input;
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Failed to start speech recognition:", err);
      }
    }
  };

  const handleSpeak = (msgId, text) => {
    if (currentSpeakingMsgId === msgId) {
      if (isSpeechPaused) {
        window.speechSynthesis.resume();
        setIsSpeechPaused(false);
      } else {
        window.speechSynthesis.pause();
        setIsSpeechPaused(true);
      }
      return;
    }

    window.speechSynthesis.cancel();

    const cleanText = text.replace(/\[Neural Engine Offline Mode\]/g, "");
    console.log("[SpeechSynthesis] Text to speak:", cleanText);
    if (!cleanText.trim()) {
      console.warn("[SpeechSynthesis] Speech text is empty, aborting.");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utteranceRef.current = utterance; // Retain reference to prevent garbage collection
    
    if (selectedVoiceName && typeof window !== "undefined" && window.speechSynthesis) {
      const freshVoices = window.speechSynthesis.getVoices();
      const selectedVoice = freshVoices.find(v => v.name === selectedVoiceName);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        console.log("[SpeechSynthesis] Selected voice config:", selectedVoice.name);
      }
    }

    utterance.onend = () => {
      if (utteranceRef.current === utterance) {
        setCurrentSpeakingMsgId(null);
        setIsSpeechPaused(false);
        utteranceRef.current = null;
      }
    };

    utterance.onerror = (e) => {
      console.error("[SpeechSynthesis] Utterance error event:", e);
      if (utteranceRef.current === utterance) {
        setCurrentSpeakingMsgId(null);
        setIsSpeechPaused(false);
        utteranceRef.current = null;
      }
    };

    setCurrentSpeakingMsgId(msgId);
    setIsSpeechPaused(false);

    // Timeout prevents Chrome cancel/speak sync race conditions
    setTimeout(() => {
      if (utteranceRef.current === utterance) {
        window.speechSynthesis.speak(utterance);
      }
    }, 50);
  };

  const handleStopSpeech = () => {
    window.speechSynthesis.cancel();
    setCurrentSpeakingMsgId(null);
    setIsSpeechPaused(false);
    utteranceRef.current = null;
  };

  useEffect(() => {
    const fetchAnalytics = async () => {
      setFetchingAnalytics(true);
      try {
        const res = await api.get("/ai/analytics");
        if (res.data.success) {
          setAnalyticsData(res.data.data);
        }
      } catch (err) {
        console.error("[Failed to fetch analytics]", err);
      } finally {
        setFetchingAnalytics(false);
      }
    };

    if (showAnalytics && isOpen) {
      fetchAnalytics();
    }
  }, [showAnalytics, isOpen]);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    if (input === "" && textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [input]);

  // Sync welcome message on login / user object retrieval
  useEffect(() => {
    setMessages([
      {
        id: "init",
        sender: "bot",
        text: getWelcomeText(user),
        timestamp: new Date(),
      },
    ]);
  }, [user]);

  // Load chat history from backend on open
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await api.get("/ai/history");
        if (res.data.success && res.data.messages.length > 0) {
          const mapped = res.data.messages.map(m => ({
            id: m.id.toString(),
            sender: m.sender,
            text: m.text,
            timestamp: m.createdAt,
            responseTime: m.responseTime
          }));
          setMessages(mapped);
        }
      } catch (err) {
        console.error("[Failed to load chat history]", err);
      }
    };

    if (isOpen && user) {
      loadHistory();
    }
  }, [isOpen, user]);

  useEffect(() => {
    const checkAiStatus = async () => {
      try {
        const res = await api.get("/ai/status");
        if (res.data.success) {
          setIsAiConfigured(res.data.isConfigured);
        }
      } catch (err) {
        console.error("[AI Status Check Failed]", err);
      }
    };
    if (user) {
      checkAiStatus();
    }
  }, [user]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const query = textToSend.trim();
    if (!query) return;

    handleStopSpeech();
    setError("");
    setInput("");
    const userMessage = { 
      id: Date.now().toString(), 
      sender: "user", 
      text: query,
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    if (!isAiConfigured) {
      try {
        const res = await api.post("/ai/query", { query });
        if (res.data.success) {
          const botMessage = {
            id: (Date.now() + 1).toString(),
            sender: "bot",
            text: res.data.text,
            timestamp: new Date(),
            responseTime: res.data.responseTime
          };
          setMessages((prev) => [...prev, botMessage]);
        }
      } catch (err) {
        setError("Failed to connect to assistant.");
        const errorMessage = {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: "⚠️ System offline. I couldn't reach the AI engine right now. Please check your backend connection.",
          timestamp: new Date()
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setLoading(false);
      }
      return;
    }

    setIsStreaming(true);
    const botMessageId = (Date.now() + 1).toString();
    const botMessagePlaceholder = {
      id: botMessageId,
      sender: "bot",
      text: "",
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, botMessagePlaceholder]);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const token = localStorage.getItem('token');
      const streamUrl = `${api.defaults.baseURL}/ai/query-stream`;
      const response = await fetch(streamUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ query }),
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';

      setLoading(false);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunkStr = decoder.decode(value, { stream: true });
        const lines = chunkStr.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '').trim();
            if (!dataStr) continue;

            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.error) {
                setError(parsed.error);
                accumulatedText += `\n⚠️ Error: ${parsed.error}`;
              } else if (parsed.text) {
                accumulatedText += parsed.text;
              } else if (parsed.done) {
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === botMessageId
                      ? { ...msg, text: accumulatedText, responseTime: parsed.responseTime }
                      : msg
                  )
                );
                break;
              }

              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === botMessageId
                    ? { ...msg, text: accumulatedText }
                    : msg
                )
              );
            } catch (jsonErr) {
              // ignore partial chunks
            }
          }
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMessageId
              ? { ...msg, text: accumulatedText + " *(Generation cancelled by user)*" }
              : msg
          )
        );
      } else {
        setError("Failed to connect to assistant.");
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMessageId
              ? { ...msg, text: "⚠️ System offline. I couldn't reach the AI engine right now. Please check your backend connection." }
              : msg
          )
        );
      }
    } finally {
      setLoading(false);
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const handleCancelStream = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRegenerate = async (botMessageId) => {
    const idx = messages.findIndex(m => m.id === botMessageId);
    if (idx === -1) return;

    const userMsg = messages.slice(0, idx).reverse().find(m => m.sender === 'user');
    if (!userMsg) return;

    // Filter out the bot response that is being regenerated
    setMessages(prev => prev.filter(m => m.id !== botMessageId));
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/ai/query", { query: userMsg.text });
      if (res.data.success) {
        const newBotMsg = {
          id: botMessageId,
          sender: "bot",
          text: res.data.text,
          timestamp: new Date(),
          responseTime: res.data.responseTime
        };
        setMessages(prev => [...prev, newBotMsg]);
        if (res.data.text.includes("[Neural Engine Offline Mode]")) {
          setIsAiConfigured(false);
        }
      }
    } catch (err) {
      setError("Failed to regenerate response.");
      const errBotMsg = {
        id: botMessageId,
        sender: "bot",
        text: "⚠️ System offline. I couldn't reach the AI engine right now. Please check your backend connection.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errBotMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    let welcomeText = `Chat cleared. Ask me anything about your courses, tasks, or guidelines!`;
    if (user) {
      if (user.role === "ADMIN") {
        const email = user.email || "";
        if (email.toLowerCase().includes("superadmin")) {
          welcomeText = `Console cleared. Ask me about system configurations, logs, or databases!`;
        } else {
          welcomeText = `Dashboard chat cleared. Ask me about courses, interns, or platform statistics!`;
        }
      } else if (user.role === "INSTRUCTOR") {
        welcomeText = `Mentor room cleared. Ask me about student grades, submissions, or task mappings!`;
      } else {
        welcomeText = `Learning space cleared. Ask me anything about your courses, tasks, or guidelines!`;
      }
    }
    setMessages([
      {
        id: "init",
        sender: "bot",
        text: welcomeText,
        timestamp: new Date(),
      },
    ]);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  const cleanMessageText = (text) => {
    return text.replace(/\[Neural Engine Offline Mode\]\s*/i, "");
  };

  const isOfflineMessage = (text) => {
    return text.includes("[Neural Engine Offline Mode]");
  };

  const renderMessageContent = (text) => {
    try {
      const htmlContent = marked.parse(text);
      const cleanHtml = DOMPurify.sanitize(htmlContent);
      return (
        <div 
          className="markdown-content"
          dangerouslySetInnerHTML={{ __html: cleanHtml }} 
        />
      );
    } catch (e) {
      return <p className="whitespace-pre-line">{text}</p>;
    }
  };

  return (
    <>
      <style>{`
        .markdown-content h1 { font-size: 1.1rem; font-weight: 700; margin-top: 0.5rem; margin-bottom: 0.25rem; color: #fff; }
        .markdown-content h2 { font-size: 1rem; font-weight: 700; margin-top: 0.5rem; margin-bottom: 0.25rem; color: #fff; }
        .markdown-content h3 { font-size: 0.95rem; font-weight: 600; margin-top: 0.5rem; margin-bottom: 0.25rem; color: #fff; }
        .markdown-content p { margin-bottom: 0.5rem; }
        .markdown-content ul { list-style-type: disc; padding-left: 1rem; margin-bottom: 0.5rem; }
        .markdown-content ol { list-style-type: decimal; padding-left: 1rem; margin-bottom: 0.5rem; }
        .markdown-content li { margin-bottom: 0.25rem; }
        .markdown-content strong { font-weight: 700; color: #fff; }
        .markdown-content em { font-style: italic; }
        .markdown-content code { background-color: rgba(30, 41, 59, 0.7); padding: 0.125rem 0.25rem; border-radius: 0.25rem; font-family: monospace; font-size: 0.85em; color: #f97316; }
        .markdown-content pre { background-color: rgba(15, 23, 42, 0.95); border: 1px solid rgba(51, 65, 85, 0.5); padding: 0.5rem; border-radius: 0.375rem; overflow-x: auto; margin-top: 0.5rem; margin-bottom: 0.5rem; }
        .markdown-content pre code { background-color: transparent; padding: 0; color: #e2e8f0; }
        .markdown-content table { width: 100%; border-collapse: collapse; margin-top: 0.5rem; margin-bottom: 0.5rem; font-size: 10px; }
        .markdown-content th, .markdown-content td { border: 1px solid rgba(51, 65, 85, 0.5); padding: 0.375rem 0.5rem; text-align: left; }
        .markdown-content th { background-color: rgba(30, 41, 59, 0.5); font-weight: 600; color: #fff; }
      `}</style>

      {/* Floating Trigger Icon */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`p-4 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center relative focus:ring-2 focus:ring-orange-500 focus:outline-none ${
            isOpen 
              ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900" 
              : "bg-gradient-to-tr from-orange-500 via-amber-500 to-orange-600 text-white hover:shadow-orange-500/25"
          }`}
          aria-label="Toggle chat assistant"
        >
          {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
          
          {!isOpen && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isAiConfigured ? "bg-emerald-400" : "bg-amber-400"}`}></span>
              <span className={`relative inline-flex rounded-full h-4 w-4 border-2 border-slate-50 dark:border-slate-900 ${isAiConfigured ? "bg-emerald-500" : "bg-amber-500"}`}></span>
            </span>
          )}
        </button>
      </div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed sm:bottom-24 sm:right-6 bottom-20 right-4 z-50 w-[calc(100vw-2rem)] sm:w-96 h-[500px] sm:h-[550px] max-h-[calc(100vh-7rem)] bg-slate-900/95 dark:bg-slate-950/98 backdrop-blur-xl rounded-[28px] border border-slate-800 shadow-2xl flex flex-col overflow-hidden text-white font-sans"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-800/60 flex items-center justify-between bg-slate-950/50 backdrop-blur-md flex-shrink-0 z-10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-2xl shadow-lg shadow-orange-500/20 text-white flex items-center justify-center">
                  <Bot size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                    Py Nexus AI
                    {isAiConfigured ? (
                      <span className="flex items-center gap-1 text-[10px] font-medium bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <Zap size={10} className="fill-emerald-400" /> Neural
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-medium bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20">
                        <Cpu size={10} /> Local
                      </span>
                    )}
                  </h4>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${isAiConfigured ? "bg-emerald-500 animate-pulse" : "bg-amber-500 animate-pulse"}`} />
                    {isAiConfigured ? "Gemini Connected" : "Local Assistant Active"}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowAnalytics(!showAnalytics)}
                  title="Toggle Analytics Dashboard"
                  aria-label="Toggle Analytics Dashboard"
                  className={`p-2 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-orange-500 focus:outline-none ${
                    showAnalytics
                      ? "text-orange-400 bg-slate-800"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                  }`}
                >
                  <BarChart2 size={14} />
                </button>
                <button
                  onClick={handleClearChat}
                  title="Clear conversation"
                  aria-label="Clear conversation"
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all duration-200"
                >
                  <RefreshCw size={14} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  aria-label="Close chatbot window"
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all duration-200"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* TTS Voice Selector */}
            {voices.length > 0 && !showAnalytics && (
              <div className="px-5 py-2 bg-slate-950/20 border-b border-slate-800/40 flex items-center justify-between text-[10px] text-slate-400 flex-shrink-0">
                <span className="font-bold flex items-center gap-1">
                  <Volume2 size={12} className="text-slate-400" /> Speech Voice
                </span>
                <select
                  value={selectedVoiceName}
                  onChange={(e) => setSelectedVoiceName(e.target.value)}
                  aria-label="Select Speech Voice"
                  className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2 py-0.5 outline-none max-w-[140px] sm:max-w-[190px] truncate cursor-pointer hover:bg-slate-700/80 focus:ring-2 focus:ring-orange-500 focus:outline-none transition-colors"
                >
                  {voices.map(v => (
                    <option key={v.name} value={v.name}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Warning Banner if Offline */}
            {!isAiConfigured && showBanner && (
              <div className="px-4 py-2.5 bg-amber-500/15 border-b border-amber-500/20 text-amber-300 text-[11px] font-medium flex items-start gap-2.5 relative leading-relaxed flex-shrink-0 animate-in slide-in-from-top duration-300 z-10 bg-slate-900">
                <Info size={14} className="mt-0.5 flex-shrink-0 text-amber-400" />
                <div className="pr-4">
                  <strong className="text-amber-200">Neural Engine Offline:</strong> Gemini AI key is not configured. Ask about courses or reports, or set <code className="bg-amber-950/60 px-1 py-0.5 rounded text-[10px] border border-amber-500/20 text-amber-400">GEMINI_API_KEY</code> in <code className="bg-amber-950/60 px-1 py-0.5 rounded text-[10px] border border-amber-500/20 text-amber-400">backend/.env</code>.
                </div>
                <button 
                  onClick={() => setShowBanner(false)}
                  aria-label="Dismiss warning banner"
                  className="absolute right-2 top-2 text-amber-400 hover:text-amber-200 focus:ring-1 focus:ring-amber-400 focus:outline-none transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            )}

            {/* Messages Area */}
            {showAnalytics ? (
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent bg-slate-900/50">
                <div className="flex items-center justify-between">
                  <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">AI Analytics Performance</h5>
                  <button 
                    onClick={() => setShowAnalytics(false)}
                    aria-label="Back to Chat"
                    className="text-[10px] text-orange-400 hover:text-orange-300 font-bold focus:ring-1 focus:ring-orange-400 focus:outline-none rounded"
                  >
                    Back to Chat
                  </button>
                </div>

                {fetchingAnalytics || !analyticsData ? (
                  <div className="flex flex-col items-center justify-center h-48 gap-2">
                    <span className="w-6 h-6 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
                    <span className="text-xs text-slate-400">Loading metrics...</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-2xl flex flex-col justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Total Queries</span>
                        <span className="text-lg font-extrabold text-white mt-1">{analyticsData.totalRequests}</span>
                      </div>
                      <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-2xl flex flex-col justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Success Rate</span>
                        <span className="text-lg font-extrabold text-emerald-400 mt-1">{analyticsData.successRate.toFixed(1)}%</span>
                      </div>
                      <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-2xl flex flex-col justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Avg Latency</span>
                        <span className="text-lg font-extrabold text-amber-400 mt-1">{analyticsData.avgLatency.toFixed(2)}s</span>
                      </div>
                      <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-2xl flex flex-col justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Cache Hits</span>
                        <span className="text-lg font-extrabold text-orange-400 mt-1">{analyticsData.cacheHits}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-2xl flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Failed Requests</span>
                      <span className="text-sm font-bold text-red-400">{analyticsData.failedRequests}</span>
                    </div>

                    <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-2xl">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight block mb-3">Daily Request Volume (7 Days)</span>
                      <div className="flex items-end justify-between h-24 pt-2 px-1 animate-in fade-in duration-300">
                        {Object.entries(analyticsData.dailyUsage).map(([date, count]) => {
                          const maxVal = Math.max(...Object.values(analyticsData.dailyUsage), 1);
                          const pct = (count / maxVal) * 100;
                          const dayLabel = new Date(date).toLocaleDateString([], { weekday: 'short' });
                          return (
                            <div key={date} className="flex flex-col items-center flex-1 gap-1">
                              <div className="w-full px-1.5 flex justify-center">
                                <div 
                                  style={{ height: `${Math.max(pct, 4)}%` }} 
                                  className="w-2 bg-gradient-to-t from-orange-500 to-amber-500 rounded-t-sm transition-all duration-500 hover:opacity-80"
                                  title={`${count} requests`}
                                />
                              </div>
                              <span className="text-[8px] text-slate-500 font-bold uppercase mt-0.5">{dayLabel}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                {messages.map((msg) => {
                  const isBot = msg.sender === "bot";
                  const isOffline = isBot && isOfflineMessage(msg.text);
                  const textContent = isBot ? cleanMessageText(msg.text) : msg.text;
                  
                  const isLatest = messages[messages.length - 1]?.id === msg.id;
                  const showCursor = isStreaming && isBot && isLatest && !msg.text.endsWith("*(Generation cancelled by user)*");

                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 max-w-[85%] ${msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                    >
                      {isBot && (
                        <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700/50 flex items-center justify-center flex-shrink-0 text-orange-400 shadow-inner">
                          <Sparkles size={14} />
                        </div>
                      )}
                      <div className="flex flex-col gap-1">
                        <div
                          className={`px-4 py-3 rounded-2xl text-xs leading-relaxed shadow-lg ${
                            msg.sender === "user"
                              ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium rounded-tr-none shadow-orange-500/10"
                              : isOffline
                              ? "bg-slate-800/80 border border-amber-500/20 text-slate-200 rounded-tl-none"
                              : "bg-slate-800/80 border border-slate-800/80 text-slate-200 rounded-tl-none"
                          }`}
                        >
                          <div className="inline-block max-w-full">
                            {isBot ? renderMessageContent(textContent) : <p className="whitespace-pre-line">{textContent}</p>}
                          </div>
                          {showCursor && (
                            <span className="inline-block w-1.5 h-3.5 bg-orange-500 ml-1.5 animate-pulse rounded-sm" style={{ verticalAlign: 'middle' }} />
                          )}
                          
                          {isOffline && (
                            <div className="mt-3 pt-2.5 border-t border-amber-500/10 flex items-start gap-2 text-[10px] text-amber-400/90 font-medium animate-pulse">
                              <AlertCircle size={12} className="flex-shrink-0 mt-0.5" />
                              <span>System responded via local rule-engine fallback.</span>
                            </div>
                          )}
                        </div>
                        
                        <div className={`flex items-center gap-1.5 px-1 text-[9px] text-slate-500 font-medium ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                          <span>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {msg.responseTime && (
                            <span>• Responded in {parseFloat(msg.responseTime).toFixed(1)}s</span>
                          )}
                          {isBot && msg.id !== "init" && (
                            <>
                              <span className="text-slate-600">•</span>
                              <button
                                onClick={() => handleCopy(msg.id, textContent)}
                                aria-label="Copy response"
                                className="hover:text-slate-300 focus:ring-1 focus:ring-orange-500 focus:outline-none rounded transition-colors flex items-center gap-0.5"
                                title="Copy response"
                              >
                                {copiedId === msg.id ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                              </button>
                              <button
                                onClick={() => handleRegenerate(msg.id)}
                                aria-label="Regenerate response"
                                className="hover:text-slate-300 focus:ring-1 focus:ring-orange-500 focus:outline-none rounded transition-colors flex items-center gap-0.5"
                                title="Regenerate response"
                              >
                                <RefreshCw size={10} />
                              </button>
                              
                              <span className="text-slate-600">•</span>
                              {currentSpeakingMsgId === msg.id ? (
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => handleSpeak(msg.id, textContent)}
                                    aria-label={isSpeechPaused ? "Resume speaking response" : "Pause speaking response"}
                                    className="text-orange-400 hover:text-orange-300 focus:ring-1 focus:ring-orange-500 focus:outline-none rounded transition-colors flex items-center"
                                    title={isSpeechPaused ? "Resume" : "Pause"}
                                  >
                                    {isSpeechPaused ? <Play size={10} /> : <Pause size={10} />}
                                  </button>
                                  <button
                                    onClick={handleStopSpeech}
                                    aria-label="Stop speaking response"
                                    className="text-red-400 hover:text-red-300 focus:ring-1 focus:ring-orange-500 focus:outline-none rounded transition-colors flex items-center"
                                    title="Stop"
                                  >
                                    <Square size={9} />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleSpeak(msg.id, textContent)}
                                  aria-label="Speak response aloud"
                                  className="hover:text-slate-300 focus:ring-1 focus:ring-orange-500 focus:outline-none rounded transition-colors flex items-center"
                                  title="Speak response"
                                >
                                  <Volume2 size={10} />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {loading && (
                  <div className="flex gap-3 max-w-[85%] mr-auto">
                    <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700/50 flex items-center justify-center flex-shrink-0 text-orange-400 animate-pulse">
                      <Bot size={14} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="px-4 py-3 bg-slate-800/80 border border-slate-800/80 rounded-2xl rounded-tl-none shadow-lg flex items-center gap-1.5 h-9">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}

            {/* Suggestions Chips */}
            {!showAnalytics && suggestions.length > 0 && (
              <div className="px-4 py-2.5 border-t border-slate-800/50 bg-slate-950/20 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none flex-shrink-0">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(s.query)}
                    aria-label={`Ask suggestion: ${s.text}`}
                    className="px-3.5 py-2 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 hover:border-orange-500/40 focus:ring-2 focus:ring-orange-500 focus:outline-none text-[10px] font-bold text-slate-300 hover:text-white transition-all duration-300 flex items-center gap-1.5 shadow-sm active:scale-95"
                  >
                    <span>{s.icon}</span>
                    <span>{s.text}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Input Bar */}
            {!showAnalytics && (
              <div className="p-4 border-t border-slate-800/50 bg-slate-950/45 flex-shrink-0 flex items-center gap-2">
                <button
                  onClick={toggleRecording}
                  aria-label={isRecording ? "Stop recording voice query" : "Record voice query"}
                  className={`p-2.5 rounded-xl border transition-all duration-200 flex-shrink-0 focus:ring-2 focus:ring-orange-500 focus:outline-none ${
                    isRecording 
                      ? "bg-red-500/10 border-red-500/30 text-red-500 animate-pulse" 
                      : "bg-slate-800/30 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                  title={isRecording ? "Stop recording" : "Record voice query"}
                >
                  {isRecording ? <MicOff size={14} /> : <Mic size={14} />}
                </button>
                <div className="flex-1 relative flex items-center">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      adjustHeight();
                    }}
                    onKeyDown={handleKeyPress}
                    placeholder="Type your question..."
                    rows={1}
                    className="w-full pl-4 pr-10 py-3 rounded-2xl bg-slate-800/50 border border-slate-800 focus:border-orange-500/40 focus:ring-2 focus:ring-orange-500 outline-none text-xs font-semibold text-white placeholder-slate-500 transition-all duration-300 resize-none max-h-24 overflow-y-auto"
                  />
                  {isStreaming ? (
                    <button
                      onClick={handleCancelStream}
                      aria-label="Stop generation"
                      className="absolute right-2 p-2 rounded-xl bg-red-500 hover:bg-red-600 text-white hover:scale-105 active:scale-95 focus:ring-2 focus:ring-red-500 focus:outline-none transition-all duration-200 shadow-md shadow-red-500/20"
                      title="Stop generation"
                    >
                      <X size={14} />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSend(input)}
                      disabled={loading || !input.trim()}
                      aria-label="Send message"
                      className="absolute right-2 p-2 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white disabled:opacity-30 hover:scale-105 active:scale-95 focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all duration-200 shadow-md shadow-orange-500/20 disabled:pointer-events-none"
                    >
                      <Send size={14} />
                    </button>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingChatbot;
