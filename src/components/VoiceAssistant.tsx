import { useState, useRef, useEffect, useCallback } from "react";
import { useOnboarding } from "@/lib/onboarding-context";
import { SYSTEM_PROMPT, buildContext, getQuickPrompts } from "@/services/aiContext";
import type { AIMessage } from "@/services/aiService";
import { getAIResponse } from "@/services/aiService";
import {
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
  requestMicPermission,
  startListening,
  stopListening,
  speakHindi,
  stopSpeaking,
  startAudioAnalyzer,
  stopAudioAnalyzer,
} from "@/services/voiceService";
import {
  Mic, MicOff, X, Send, Volume2, VolumeX, Copy,
  Bot, User, AlertCircle, RotateCcw, Play,
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

type AppState = "idle" | "listening" | "confirming" | "thinking" | "speaking" | "error" | "permission_required";

export function VoiceAssistant({ currentPage }: VoiceAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [appState, setAppState] = useState<AppState>("idle");
  const [interimText, setInterimText] = useState("");
  const [finalTranscript, setFinalTranscript] = useState("");
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [micVolume, setMicVolume] = useState(0);
  const [lastResponseText, setLastResponseText] = useState("");
  const [showWelcome, setShowWelcome] = useState(true);

  const { location, business, capital, feasibility } = useOnboarding();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesRef = useRef<ChatMessage[]>([]);
  messagesRef.current = messages;

  const quickPrompts = getQuickPrompts(currentPage);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, appState]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
      stopSpeaking();
      stopAudioAnalyzer();
    };
  }, []);

  const getContext = useCallback(() => {
    return buildContext({
      location: location ?? null,
      business: business ?? null,
      capital,
      feasibility: feasibility ?? null,
      currentPage,
    });
  }, [location, business, capital, feasibility, currentPage]);

  // ─── Send message to AI ───
  const sendMessage = useCallback(async (text: string, isVoice = false) => {
    if (!text.trim() || appState === "thinking") return;
    setError(null);
    setInterimText("");
    setFinalTranscript("");

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      text: text.trim(),
      timestamp: Date.now(),
      isVoice,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setAppState("thinking");

    const systemMsg: AIMessage = { role: "system", content: SYSTEM_PROMPT + getContext() };
    const history: AIMessage[] = messagesRef.current.slice(-10).map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.text,
    }));

    try {
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
      setLastResponseText(response.text);
      setShowWelcome(false);

      // Speak response
      if (ttsEnabled) {
        setAppState("speaking");
        speakHindi(
          response.text.replace(/[।\n]+/g, ". "),
          () => setAppState("idle"),
          (err) => {
            setError(err);
            setAppState("error");
          },
        );
      } else {
        setAppState("idle");
      }
    } catch {
      setError("जवाब तैयार नहीं हो पाया। कृपया दोबारा कोशिश करें।");
      setAppState("error");
    }
  }, [appState, getContext, ttsEnabled]);

  // ─── Voice input ───
  const handleVoiceStart = useCallback(async () => {
    setError(null);
    setInterimText("");
    setFinalTranscript("");
    stopSpeaking();

    // Check mic permission first
    const perm = await requestMicPermission();
    if (!perm.granted) {
      setError(perm.error || "Microphone permission required.");
      setAppState("permission_required");
      return;
    }

    setAppState("listening");

    // Start real audio visualizer
    startAudioAnalyzer((vol) => setMicVolume(vol));

    startListening(
      (text, isFinal) => {
        if (isFinal) {
          setFinalTranscript(text);
          setInterimText("");
          stopAudioAnalyzer();
          setMicVolume(0);
          // Show confirmation step
          setAppState("confirming");
        } else {
          setInterimText(text);
        }
      },
      (err) => {
        stopAudioAnalyzer();
        setMicVolume(0);
        setError(err);
        setAppState("error");
      },
      () => {
        // onEnd — recognition stopped naturally
        stopAudioAnalyzer();
        setMicVolume(0);
        // If we have a final transcript, we're in confirming state
        // If not, user just stopped without speaking
        setAppState((prev) => {
          if (prev === "listening") return "idle";
          return prev;
        });
      },
      () => {
        // onStarted — mic is live
      },
    );
  }, []);

  const handleVoiceStop = useCallback(() => {
    stopListening();
    stopAudioAnalyzer();
    setMicVolume(0);
    // onEnd callback will handle state transition
  }, []);

  const handleConfirmTranscript = useCallback(() => {
    if (finalTranscript) {
      sendMessage(finalTranscript, true);
    }
  }, [finalTranscript, sendMessage]);

  const handleRetryVoice = useCallback(() => {
    setError(null);
    setFinalTranscript("");
    setInterimText("");
    handleVoiceStart();
  }, [handleVoiceStart]);

  const handleStopSpeaking = useCallback(() => {
    stopSpeaking();
    setAppState("idle");
  }, []);

  const handleReplay = useCallback(() => {
    if (lastResponseText) {
      stopSpeaking();
      setAppState("speaking");
      speakHindi(
        lastResponseText.replace(/[।\n]+/g, ". "),
        () => setAppState("idle"),
        (err) => { setError(err); setAppState("error"); },
      );
    }
  }, [lastResponseText]);

  const handleClose = useCallback(() => {
    stopListening();
    stopSpeaking();
    stopAudioAnalyzer();
    setMicVolume(0);
    setIsOpen(false);
    setAppState("idle");
    setInterimText("");
    setFinalTranscript("");
    setError(null);
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
          <div className="fixed inset-0 bg-black/30 z-40 sm:hidden" onClick={handleClose} />
          <div className="fixed z-50 bg-white border border-border shadow-2xl flex flex-col animate-slide-up inset-0 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[420px] sm:h-[600px] sm:rounded-2xl">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-white sm:rounded-t-2xl">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-foreground font-serif-display">RuralBiz AI Advisor</h3>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <p className="text-[11px] text-muted-foreground">
                    {appState === "listening" ? "सुन रहा हूँ..." :
                     appState === "thinking" ? "समझ रहा हूँ..." :
                     appState === "speaking" ? "जवाब दे रहा हूँ..." :
                     "Online • हिंदी"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setTtsEnabled(!ttsEnabled)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                  title={ttsEnabled ? "Mute voice" : "Enable voice"}
                >
                  {ttsEnabled ? <Volume2 className="h-4 w-4 text-muted-foreground" /> : <VolumeX className="h-4 w-4 text-muted-foreground" />}
                </button>
                <button onClick={handleClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {/* Welcome */}
              {showWelcome && messages.length === 0 && (
                <div className="text-center py-6 animate-fade-in">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 mx-auto mb-3 flex items-center justify-center">
                    <Bot className="h-7 w-7 text-primary" />
                  </div>
                  <p className="text-sm font-bold text-foreground mb-1">नमस्ते! 🙏</p>
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
                    मैं RuralBiz AI हूँ। मैं आपके business analysis को समझ चुका हूँ। बोलकर या लिखकर कोई भी सवाल पूछ सकते हैं।
                  </p>
                  {feasibility && (
                    <div className="mt-3 inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[11px] font-medium text-emerald-700">
                        Analysis loaded: {feasibility.overallScore}/100
                      </span>
                    </div>
                  )}
                  {/* Big mic button */}
                  <button
                    onClick={handleVoiceStart}
                    disabled={appState === "thinking"}
                    className="mt-5 mx-auto flex flex-col items-center gap-2"
                  >
                    <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20 hover:shadow-xl transition-all hover:scale-105">
                      <Mic className="h-7 w-7" />
                    </div>
                    <span className="text-xs font-medium text-primary">बोलकर पूछें</span>
                  </button>
                  <p className="text-[10px] text-muted-foreground mt-2">या अपना सवाल नीचे लिखें</p>
                </div>
              )}

              {/* Messages */}
              {messages.map((msg) => (
                <div key={msg.id} className={cn("flex gap-2 animate-fade-in", msg.role === "user" ? "justify-end" : "justify-start")}>
                  {msg.role === "assistant" && (
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0 mt-0.5">
                      <Bot className="h-3.5 w-3.5 text-primary" />
                    </div>
                  )}
                  <div className={cn(
                    "max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                    msg.role === "user" ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted text-foreground rounded-bl-md",
                  )}>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    {msg.role === "assistant" && (
                      <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-border/30">
                        <button onClick={handleReplay} className="p-1 rounded hover:bg-background/50 transition-colors" title="फिर सुनें">
                          <Volume2 className="h-3 w-3" />
                        </button>
                        <button onClick={() => navigator.clipboard.writeText(msg.text)} className="p-1 rounded hover:bg-background/50 transition-colors" title="Copy">
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

              {/* Live transcription while listening */}
              {appState === "listening" && interimText && (
                <div className="flex gap-2 animate-fade-in justify-end">
                  <div className="max-w-[80%] rounded-2xl rounded-br-md px-3.5 py-2.5 text-sm bg-primary/20 text-foreground border border-primary/20 border-dashed">
                    <p className="whitespace-pre-wrap italic">{interimText}</p>
                  </div>
                </div>
              )}

              {/* Confirmation step */}
              {appState === "confirming" && finalTranscript && (
                <div className="animate-fade-in">
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                    <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-1">क्या आपने कहा:</p>
                    <p className="text-sm font-medium text-foreground mb-2.5">"{finalTranscript}"</p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleConfirmTranscript}
                        className="flex-1 rounded-lg bg-primary text-primary-foreground px-3 py-2 text-xs font-semibold hover:bg-primary/90 transition-colors"
                      >
                        हाँ, पूछें ✓
                      </button>
                      <button
                        onClick={handleRetryVoice}
                        className="flex-1 rounded-lg bg-white border border-border px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors"
                      >
                        फिर बोलें
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Thinking */}
              {appState === "thinking" && (
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
                    <div className="flex gap-2 mt-2">
                      <button onClick={handleRetryVoice} className="text-[11px] font-semibold text-red-600 hover:underline">
                        दोबारा बोलें →
                      </button>
                      <button onClick={() => setError(null)} className="text-[11px] font-semibold text-muted-foreground hover:underline">
                        लिखकर पूछें
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts — always visible */}
            {messages.length < 4 && appState === "idle" && (
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

            {/* Listening indicator with real waveform */}
            {appState === "listening" && (
              <div className="px-4 py-2.5 bg-primary/5 border-t border-primary/10">
                <div className="flex items-center justify-center gap-3">
                  {/* Real audio waveform bars */}
                  <div className="flex items-end gap-[3px] h-6">
                    {[...Array(7)].map((_, i) => {
                      const height = 4 + micVolume * 20 * (0.5 + 0.5 * Math.sin(Date.now() / 200 + i));
                      return (
                        <div
                          key={i}
                          className="w-[3px] bg-primary rounded-full transition-all duration-100"
                          style={{ height: `${Math.max(4, height)}px` }}
                        />
                      );
                    })}
                  </div>
                  <span className="text-xs font-medium text-primary">सुन रहा हूँ...</span>
                </div>
              </div>
            )}

            {/* Speaking indicator */}
            {appState === "speaking" && (
              <div className="px-4 py-2.5 bg-emerald-50 border-t border-emerald-100">
                <div className="flex items-center justify-center gap-3">
                  <Volume2 className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
                  <span className="text-xs font-medium text-emerald-700">जवाब दे रहा हूँ...</span>
                  <button onClick={handleStopSpeaking} className="text-[10px] font-semibold text-emerald-600 underline">
                    रोकें
                  </button>
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="px-3 py-3 border-t border-border bg-white sm:rounded-b-2xl">
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
                  disabled={appState === "thinking" || appState === "confirming"}
                />

                {inputText.trim() ? (
                  <button
                    onClick={() => sendMessage(inputText)}
                    disabled={appState === "thinking" || appState === "confirming"}
                    className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                ) : appState === "speaking" ? (
                  <button
                    onClick={handleStopSpeaking}
                    className="h-10 w-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 transition-colors"
                    aria-label="Stop AI response"
                  >
                    <VolumeX className="h-4 w-4" />
                  </button>
                ) : appState === "listening" ? (
                  <button
                    onClick={handleVoiceStop}
                    className="h-10 w-10 rounded-xl bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors animate-pulse"
                    aria-label="Stop listening"
                  >
                    <MicOff className="h-4 w-4" />
                  </button>
                ) : appState === "confirming" ? (
                  <button
                    onClick={handleConfirmTranscript}
                    className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
                    aria-label="Send confirmed message"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleVoiceStart}
                    disabled={appState === "thinking"}
                    className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50"
                    aria-label="Start voice input"
                  >
                    <Mic className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Replay last response */}
              {lastResponseText && appState === "idle" && messages.length > 0 && (
                <button
                  onClick={handleReplay}
                  className="w-full mt-2 flex items-center justify-center gap-1.5 text-[10px] font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  <Play className="h-3 w-3" />
                  फिर सुनें
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
