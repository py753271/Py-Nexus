import { useState, useRef, useEffect, useCallback } from "react";
import {
  Send, Bot, Zap, CheckCircle, BrainCircuit, ChevronRight,
  Sparkles, Mic, RotateCcw, Copy, Check, X
} from "lucide-react";
import { Card, Badge } from "../../shared/components/UI";
import api from "../../utils/api";

const SUGGESTIONS = [
  { text: "What are my active courses?", emoji: "📚" },
  { text: "Summarize latest announcements", emoji: "📣" },
  { text: "Who am I?", emoji: "🔍" },
  { text: "What can you do?", emoji: "⚡" },
  { text: "System status", emoji: "⚙️" },
  { text: "How do I submit a report?", emoji: "📋" },
];

const CAPABILITIES = [
  "Scans Knowledge Assets",
  "Analyzes Announcements",
  "Directs to Courses",
  "Operational Assistance",
  "Real-time Logic",
  "Profile Intelligence",
];

import { motion } from "framer-motion";

// ── Render markdown-like text (bold, bullets) ───────────────────────────
const renderMarkdown = (text) => {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    // Bold: **text**
    const parts = line.split(/\*\*(.*?)\*\*/g);
    const renderedParts = parts.map((part, j) =>
      j % 2 === 1 ? <strong key={j} className="font-black">{part}</strong> : part
    );
    const isBullet = line.trimStart().startsWith("•");
    return (
      <span key={i} className={`${isBullet ? "flex gap-2 items-start" : ""} block`}>
        {isBullet && <span className="text-orange-500 mt-0.5 flex-shrink-0">•</span>}
        <span>{isBullet ? renderedParts.slice(1) : renderedParts}</span>
        {i < lines.length - 1 && !isBullet && <br />}
      </span>
    );
  });
};

// ── AI Message Bubble ───────────────────────────────────────────────────
const AIBubble = ({ msg, isLatest, onActionClick }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <motion.div 
      initial={isLatest ? { opacity: 0, y: 15, scale: 0.95 } : false}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
      className="flex items-end gap-3 group"
    >
      <div className="w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center bg-orange-500 text-white shadow-lg shadow-orange-500/20">
        <Sparkles size={18} />
      </div>
      <div className="flex flex-col gap-2 max-w-[82%]">
        <div className="px-6 py-4 rounded-3xl rounded-bl-none bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-sm leading-relaxed shadow-sm relative">
          <div className="text-slate-800 dark:text-slate-100 space-y-0.5">
            {renderMarkdown(msg.text)}
          </div>

          <button
            onClick={handleCopy}
            className="absolute top-3 right-3 p-1.5 rounded-lg lg:opacity-0 lg:group-hover:opacity-60 hover:!opacity-100 transition-all text-slate-400 hover:text-orange-500 bg-white/80 dark:bg-slate-900/80 backdrop-blur"
          >
            {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
          </button>
        </div>

        {msg.actions && (
          <motion.div 
            initial={isLatest ? { opacity: 0, y: 10 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-2"
          >
            {msg.actions.map((action, i) => (
              <button
                key={i}
                onClick={() => onActionClick(action.query)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-orange-500/30 text-orange-600 dark:text-orange-400 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all active:scale-95 shadow-sm"
              >
                {action.label} <ChevronRight size={11} />
              </button>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

// ── User Message Bubble ─────────────────────────────────────────────────
const UserBubble = ({ text }) => (
  <motion.div 
    initial={{ opacity: 0, y: 15, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.3 }}
    className="flex items-end gap-3 flex-row-reverse"
  >
    <div className="w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-black text-sm">
      U
    </div>
    <div className="max-w-[75%] px-6 py-4 rounded-3xl rounded-br-none bg-orange-500 text-white text-sm leading-relaxed font-semibold shadow-lg shadow-orange-500/20">
      {text}
    </div>
  </motion.div>
);

// ── Main Component ──────────────────────────────────────────────────────
const Meetings = () => {
  const [messages, setMessages] = useState([
    {
      id: 0,
      type: "ai",
      text: "Scanning Network… Initialized. 🖐️ I'm the Py Nexus Intelligence Engine. I can retrieve documentation, explain status, and guide you through the platform.\n\nWhat's your inquiry?",
      actions: [
        { label: "My Courses", query: "what are my active courses?" },
        { label: "Latest News", query: "summarize latest announcements" },
        { label: "Help", query: "what can you do?" },
      ],
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [latestAiIdx, setLatestAiIdx] = useState(0);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = useCallback(async (text) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setInput("");
    const userMsg = { id: Date.now(), type: "user", text: trimmed };
    setMessages(m => [...m, userMsg]);
    setLoading(true);

    // Build brief history for context (last 4 turns)
    const history = messages.slice(-4).map(m => ({ role: m.type, text: m.text }));

    try {
      const res = await api.post('/ai/query', { query: trimmed, history });
      if (res.data.success) {
        const aiMsg = {
          id: Date.now() + 1,
          type: "ai",
          text: res.data.text,
          actions: res.data.actions || null,
        };
        setMessages(m => {
          const updated = [...m, aiMsg];
          setLatestAiIdx(updated.length - 1);
          return updated;
        });
      }
    } catch {
      const errMsg = {
        id: Date.now() + 1,
        type: "ai",
        text: "⚠️ Offline Alert: Neural Engine is temporarily unreachable. Please check your connection and try again.",
      };
      setMessages(m => {
        const updated = [...m, errMsg];
        setLatestAiIdx(updated.length - 1);
        return updated;
      });
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [loading, messages]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearChat = () => {
    setMessages([{
      id: 0,
      type: "ai",
      text: "Chat cleared. Neural Engine reset and ready for a new session! What can I help you with?",
      actions: [
        { label: "My Courses", query: "what are my active courses?" },
        { label: "Latest News", query: "summarize latest announcements" },
      ],
    }]);
    setLatestAiIdx(0);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 animate-in fade-in duration-700 pb-4 h-auto lg:h-[calc(100vh-10rem)]">

      {/* ── Chat Container ─────────────────────────────── */}
      <div className="flex-1 h-[500px] lg:h-full flex flex-col rounded-3xl border overflow-hidden bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-xl dark:shadow-2xl">

        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="p-3 rounded-2xl bg-orange-500 shadow-lg shadow-orange-500/30">
                <Bot size={22} className="text-white" strokeWidth={2.5} />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 animate-pulse" />
            </div>
            <div>
              <p className="text-base font-black tracking-tight text-slate-900 dark:text-white">Intelligence Assistant</p>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Neural Engine Online</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="success">Core Engine v2.0</Badge>
            <button
              onClick={clearChat}
              title="Clear Chat"
              className="p-2 rounded-xl text-slate-400 hover:text-orange-500 hover:bg-orange-500/10 transition-all active:scale-90"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {messages.map((msg, i) =>
            msg.type === "ai" ? (
              <AIBubble
                key={msg.id}
                msg={msg}
                isLatest={i === latestAiIdx}
                onActionClick={(query) => sendMessage(query)}
              />
            ) : (
              <UserBubble key={msg.id} text={msg.text} />
            )
          )}

          {/* Loading indicator */}
          {loading && (
            <div className="flex justify-start items-end gap-3">
              <div className="w-10 h-10 rounded-2xl flex-shrink-0 bg-orange-500 flex items-center justify-center text-white">
                <BrainCircuit size={18} className="animate-pulse" />
              </div>
              <div className="px-6 py-4 rounded-3xl rounded-bl-none bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                <div className="flex gap-1.5 items-center">
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full bg-orange-500 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestion chips — only when no messages beyond initial */}
        {messages.length <= 1 && (
          <div className="px-6 pb-4 flex flex-wrap gap-2">
            {SUGGESTIONS.slice(0, 4).map(s => (
              <button
                key={s.text}
                onClick={() => sendMessage(s.text)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-orange-500/50 hover:text-orange-500 hover:bg-orange-500/5 transition-all"
              >
                <span>{s.emoji}</span> {s.text}
              </button>
            ))}
          </div>
        )}

        {/* Input bar */}
        <div className="p-5 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
          <div className="flex gap-3 items-center">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Query the system archives…"
                className="w-full px-6 py-4 pr-12 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 outline-none font-semibold text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-orange-500/50 transition-all"
              />
              {input && (
                <button
                  onClick={() => setInput("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                >
                  <X size={15} />
                </button>
              )}
            </div>
            <button
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              className="p-4 rounded-2xl bg-orange-500 text-white disabled:opacity-40 shadow-xl shadow-orange-500/20 active:scale-95 transition-all hover:bg-orange-600"
            >
              <Send size={20} />
            </button>
          </div>
          <p className="text-center text-[10px] text-slate-400 mt-3 font-black uppercase tracking-widest">
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>

      {/* ── Side Panels ────────────────────────────────── */}
      <div className="w-full lg:w-72 flex flex-col gap-5 flex-shrink-0">

        {/* Capabilities */}
        <Card className="p-6 border-t-4 border-t-orange-500">
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] mb-5 text-orange-500 flex items-center gap-2">
            <Zap size={14} fill="#f97316" /> Core Abilities
          </h3>
          <ul className="space-y-3">
            {CAPABILITIES.map(c => (
              <li key={c} className="flex items-center gap-3 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />
                {c}
              </li>
            ))}
          </ul>
        </Card>

        {/* Quick Queries */}
        <Card className="p-6">
          <h3 className="text-[11px] font-black uppercase tracking-widest mb-5 text-slate-900 dark:text-white">
            Quick Queries
          </h3>
          <div className="space-y-2">
            {SUGGESTIONS.map(s => (
              <button
                key={s.text}
                onClick={() => sendMessage(s.text)}
                className="w-full text-left text-xs p-3.5 rounded-xl font-semibold border border-slate-100 dark:border-slate-700 hover:border-orange-500/50 hover:text-orange-500 hover:bg-orange-500/5 transition-all flex justify-between items-center group text-slate-700 dark:text-slate-300"
              >
                <span className="flex items-center gap-2">
                  <span>{s.emoji}</span>
                  {s.text}
                </span>
                <ChevronRight size={13} className="lg:opacity-0 lg:group-hover:opacity-100 transition-all text-orange-500" />
              </button>
            ))}
          </div>
        </Card>

      </div>
    </div>
  );
};

export default Meetings;