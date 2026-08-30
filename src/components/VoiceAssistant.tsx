import { useState, useRef, useEffect, useCallback } from "react";
import { useOnboarding } from "@/lib/onboarding-context";
import { SYSTEM_PROMPT, buildContext, getQuickPrompts } from "@/services/aiContext";
import type { AIMessage } from "@/services/aiService";
import { getAIResponse } from "@/services/aiService";
import {
  isSpeechRecognitionSupported,
  startListening,
  stopListening,
  speakHindi,
  stopSpeaking,
  type VoiceState,
} from "@/services/voiceService";
import {
  Mic, MicOff, X, Send, Volume2, VolumeX, Copy,
  Bot, User, AlertCircle, RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceAssistantProps {
  currentPage?: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: number;
  isVoice?: boolean;
}

export function VoiceAssistant({ currentPage }: VoiceAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [voiceSupported] = useState(isSpeechRecognitionSupported());
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);

  const { location, business, capital, feasibility } = useOnboarding();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const quickPrompts = getQuickPrompts(currentPage);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Build context for AI
  const getContext = useCallback(() => {
    return buildContext({
      location: location ?? null,
      business: business ?? null,
      capital,
      feasibility: feasibility ?? null,
      currentPage,
    });
  }, [location, business, capital, feasibility, currentPage]);

  // Send message to AI
  const sendMessage = useCallback(async (text: string, isVoice = false) => {
    if (!text.trim()) return;
    setError(null);

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      text: text.trim(),
      timestamp: Date.now(),
      isVoice,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setVoiceState("thinking");

    const systemMsg: AIMessage = { role: "system", content: SYSTEM_PROMPT + getContext() };
    const history: AIMessage[] = messages.slice(-8).map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.text,
    }));

    const response = await getAIResponse([
      systemMsg,
      ...history,
      { role: "user", content: text.trim() },
    ]);

    const assistantMsg: ChatMessage = {
      id: `a-${Date.now()}`,
      role: "assistant",
      text: response.text,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, assistantMsg]);
    setVoiceState("idle");
    setShowWelcome(false);

    // Speak response if TTS enabled
    if (ttsEnabled && voiceState !== "error") {
      setVoiceState("speaking");
      speakHindi(
        response.text.replace(/[।\n]/g, ". "),
        () => setVoiceState("idle"),
        () => setVoiceState("idle"),
      );
    }
  }, [messages, getContext, ttsEnabled, voiceState]);

  // Start voice listening
  const handleVoiceStart = useCallback(() => {
    setError(null);
    stopSpeaking();
    setVoiceState("listening");
    startListening(
      (text, isFinal) => {
        if (isFinal) {
          setVoiceState("thinking");
          sendMessage(text, true);
        }
      },
      (err) => {
        setError(err);
        setVoiceState("error");
      },
      () => {
        if (voiceState === "listening") setVoiceState("idle");
      },
    );
  }, [sendMessage, voiceState]);

  const handleVoiceStop = useCallback(() => {
    stopListening();
    setVoiceState("idle");
  }, []);

  const handleStopSpeaking = useCallback(() => {
    stopSpeaking();
    setVoiceState("idle");
  }, []);

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
  }, []);

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-3.5 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5 transition-all duration-200"
          aria-label="Open AI Voice Assistant"
        >
          <Bot className="h-5 w-5" />
          <span className="text-sm font-semibold hidden sm:inline">AI Advisor</span>
          <span className="text-xs font-medium bg-primary-foreground/20 px-2 py-0.5 rounded-full">हिंदी</span>
        </button>
      )}

      {/* Conversation Panel */}
      {isOpen && (
        <>
          {/* Backdrop on mobile */}
          <div
            className="fixed inset-0 bg-black/30 z-40 sm:hidden"
            onClick={() => setIsOpen(false)}
          />

          <div
            ref={panelRef}
            className={cn(
              "fixed z-50 bg-white border border-border shadow-2xl flex flex-col animate-slide-up",
              // Mobile: full screen
              "inset-0 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[420px] sm:h-[600px] sm:rounded-2xl",
            )}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-white rounded-t-2xl sm:rounded-t-2xl">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-foreground font-serif-display">RuralBiz AI Advisor</h3>
                <p className="text-[11px] text-muted-foreground">आपका Business Advisor • हिंदी</p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setTtsEnabled(!ttsEnabled)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                  title={ttsEnabled ? "Mute voice" : "Enable voice"}
                >
                  {ttsEnabled ? <Volume2 className="h-4 w-4 text-muted-foreground" /> : <VolumeX className="h-4 w-4 text-muted-foreground" />}
                </button>
                <button
                  onClick={() => { stopSpeaking(); stopListening(); setIsOpen(false); setVoiceState("idle"); }}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {/* Welcome */}
              {showWelcome && messages.length === 0 && (
                <div className="text-center py-6 animate-fade-in">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 mx-auto mb-3 flex items-center justify-center">
                    <Bot className="h-7 w-7 text-primary" />
                  </div>
                  <p className="text-sm font-bold text-foreground mb-1">नमस्ते! 🙏</p>
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
                    मैं RuralBiz AI हूँ। मैं आपके business analysis को समझ चुका हूँ। आप मुझसे अपने business, market, competition या finance से जुड़ा कोई भी सवाल पूछ सकते हैं।
                  </p>
                  {feasibility && (
                    <div className="mt-3 inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[11px] font-medium text-emerald-700">
                        Analysis loaded: {feasibility.overallScore}/100
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Chat Messages */}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn("flex gap-2 animate-fade-in", msg.role === "user" ? "justify-end" : "justify-start")}
                >
                  {msg.role === "assistant" && (
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0 mt-0.5">
                      <Bot className="h-3.5 w-3.5 text-primary" />
                    </div>
                  )}
                  <div className={cn(
                    "max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted text-foreground rounded-bl-md",
                  )}>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    {msg.role === "assistant" && (
                      <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-border/30">
                        <button onClick={() => speakHindi(msg.text.replace(/[।\n]/g, ". "), () => setVoiceState("idle"), () => setVoiceState("idle"))} className="p-1 rounded hover:bg-background/50 transition-colors" title="सुनें">
                          <Volume2 className="h-3 w-3" />
                        </button>
                        <button onClick={() => handleCopy(msg.text)} className="p-1 rounded hover:bg-background/50 transition-colors" title="Copy">
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted flex-shrink-0 mt-0.5">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}

              {/* Thinking indicator */}
              {voiceState === "thinking" && (
                <div className="flex gap-2 animate-fade-in">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                    <Bot className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="h-2 w-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="h-2 w-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 animate-fade-in">
                  <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-red-700">{error}</p>
                    <button onClick={() => { setError(null); handleVoiceStart(); }} className="text-xs font-semibold text-red-600 mt-1 hover:underline">
                      दोबारा बोलें →
                    </button>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            {messages.length < 3 && (
              <div className="px-4 py-2 border-t border-border/50">
                <div className="flex flex-wrap gap-1.5">
                  {quickPrompts.map((p) => (
                    <button
                      key={p.hindi}
                      onClick={() => sendMessage(p.hindi)}
                      className="text-[11px] font-medium px-2.5 py-1.5 rounded-full border border-border hover:border-primary/40 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all"
                    >
                      {p.hindi}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Voice State Indicator */}
            {voiceState === "listening" && (
              <div className="px-4 py-2 bg-primary/5 border-t border-primary/10">
                <div className="flex items-center justify-center gap-2">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1 bg-primary rounded-full animate-pulse"
                        style={{
                          height: `${8 + Math.random() * 12}px`,
                          animationDelay: `${i * 100}ms`,
                          animationDuration: "0.5s",
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-medium text-primary">सुन रहा हूँ...</span>
                </div>
              </div>
            )}

            {voiceState === "speaking" && (
              <div className="px-4 py-2 bg-emerald-50 border-t border-emerald-100">
                <div className="flex items-center justify-center gap-2">
                  <Volume2 className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
                  <span className="text-xs font-medium text-emerald-700">जवाब दे रहा हूँ...</span>
                  <button onClick={handleStopSpeaking} className="text-[10px] font-semibold text-emerald-600 underline ml-1">
                    रोकें
                  </button>
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="px-3 py-3 border-t border-border bg-white rounded-b-2xl">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage(inputText);
                    }
                  }}
                  placeholder="अपना सवाल लिखें..."
                  className="flex-1 rounded-xl border border-border bg-muted/50 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
                  disabled={voiceState === "thinking"}
                />

                {/* Send text */}
                {inputText.trim() && (
                  <button
                    onClick={() => sendMessage(inputText)}
                    disabled={voiceState === "thinking"}
                    className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                )}

                {/* Microphone button */}
                {!inputText.trim() && (
                  <button
                    onClick={voiceState === "listening" ? handleVoiceStop : handleVoiceStart}
                    disabled={!voiceSupported || voiceState === "thinking"}
                    className={cn(
                      "h-10 w-10 rounded-xl flex items-center justify-center transition-all",
                      voiceState === "listening"
                        ? "bg-red-500 text-white animate-pulse"
                        : "bg-primary text-primary-foreground hover:bg-primary/90",
                      (!voiceSupported || voiceState === "thinking") && "opacity-50 cursor-not-allowed",
                    )}
                    title={voiceSupported ? "बोलें" : "Voice not supported"}
                  >
                    {voiceState === "listening" ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </button>
                )}

                {/* Retry on error */}
                {voiceState === "error" && !inputText.trim() && (
                  <button
                    onClick={handleVoiceStart}
                    className="h-10 w-10 rounded-xl bg-muted text-muted-foreground flex items-center justify-center hover:bg-muted/80 transition-colors"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                )}
              </div>

              {!voiceSupported && (
                <p className="text-[10px] text-muted-foreground text-center mt-1.5">
                  Voice not available — type your question
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
