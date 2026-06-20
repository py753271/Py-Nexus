import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, Sparkles, AlertCircle, RefreshCw } from "lucide-react";
import api from "../../utils/api";
import { useUser } from "../../context/UserContext";

const STUDENT_SUGGESTIONS = [
  { text: "My active courses?", query: "what are my active courses?" },
  { text: "Latest announcements?", query: "summarize latest announcements" },
  { text: "How to submit a report?", query: "how do i submit a report?" },
  { text: "System status?", query: "system status" },
];

const ADMIN_SUGGESTIONS = [
  { text: "Global system stats?", query: "stats" },
  { text: "Pending audit reports?", query: "my reports" },
  { text: "Available courses?", query: "what courses are available?" },
  { text: "Who am I?", query: "who am i?" },
];

const FloatingChatbot = () => {
  const { user } = useUser();
  const isAdmin = user?.role === "ADMIN";
  const suggestions = isAdmin ? ADMIN_SUGGESTIONS : STUDENT_SUGGESTIONS;

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "init",
      sender: "bot",
      text: "Hello! 🖐️ I'm your Py Nexus Assistant. How can I help you clear your doubts today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const query = textToSend.trim();
    if (!query) return;

    setError("");
    setInput("");
    const userMessage = { id: Date.now().toString(), sender: "user", text: query };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const res = await api.post("/ai/query", { query });
      if (res.data.success) {
        const botMessage = {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: res.data.text,
        };
        setMessages((prev) => [...prev, botMessage]);
      }
    } catch (err) {
      setError("Failed to connect to assistant. Make sure backend is running.");
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: "⚠️ System offline. I couldn't reach the AI engine right now. Please try again in a bit.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  return (
    <>
      {/* Floating Trigger Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-xl shadow-orange-500/30 hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center"
        aria-label="Toggle chat helper"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
        {/* Subtle active ping */}
        {!isOpen && (
          <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900"></span>
          </span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] h-[480px] bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300 select-none">
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500 rounded-xl text-white">
                <Bot size={18} />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-950 dark:text-white leading-tight">Py Nexus Assistant</h4>
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest leading-none mt-1">Online & Ready</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-slate-50/50 dark:bg-slate-900/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 max-w-[85%] ${msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              >
                {msg.sender === "bot" && (
                  <div className="w-7 h-7 rounded-lg bg-orange-500 text-white flex items-center justify-center flex-shrink-0">
                    <Sparkles size={13} />
                  </div>
                )}
                <div
                  className={`px-4 py-3 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-orange-500 text-white font-semibold rounded-tr-none"
                      : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-700/50 rounded-tl-none shadow-sm"
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2.5 max-w-[85%] mr-auto">
                <div className="w-7 h-7 rounded-lg bg-orange-500 text-white flex items-center justify-center flex-shrink-0 animate-pulse">
                  <Bot size={13} />
                </div>
                <div className="px-4 py-3 bg-white dark:bg-slate-800 rounded-2xl rounded-tl-none border border-slate-100 dark:border-slate-700/50 shadow-sm flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {messages.length <= 2 && (
            <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none flex-shrink-0 bg-white dark:bg-slate-900">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(s.query)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-400 hover:border-orange-500/50 hover:text-orange-500 transition-all bg-white dark:bg-slate-900 flex-shrink-0"
                >
                  {s.text}
                </button>
              ))}
            </div>
          )}

          {/* Input Bar */}
          <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex-shrink-0 flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your question..."
              className="flex-1 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 outline-none text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:border-orange-500/50 transition-all"
            />
            <button
              onClick={() => handleSend(input)}
              disabled={loading || !input.trim()}
              className="p-3 rounded-xl bg-orange-500 text-white disabled:opacity-40 hover:bg-orange-600 active:scale-95 transition-all shadow-md shadow-orange-500/20"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingChatbot;
