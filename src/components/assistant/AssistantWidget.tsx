"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, X, Send, Mic, MicOff, Volume2, VolumeX, Loader2 } from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// The SpeechRecognition Web API is not in lib.dom.d.ts (still non-standard,
// Chrome/Edge ship it behind the webkit prefix) — minimal local typing for
// just the surface this widget uses.
interface SpeechRecognitionResultLike {
  results: { [index: number]: { [index: number]: { transcript: string } }; length: number };
}
interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionResultLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

const GREETING: ChatMessage = {
  role: "assistant",
  content:
    "Assalamu Alaikum! I'm the Quran Assistant. Ask me about a verse, a surah's meaning, a story from the Quran, or its guidance on a topic — I'll answer from the Quran in detail.",
};

export default function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceOutOn, setVoiceOutOn] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const Ctor = (window as unknown as { SpeechRecognition?: SpeechRecognitionCtor; webkitSpeechRecognition?: SpeechRecognitionCtor })
      .SpeechRecognition ?? (window as unknown as { webkitSpeechRecognition?: SpeechRecognitionCtor }).webkitSpeechRecognition;
    if (Ctor) setSpeechSupported(true);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isStreaming]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150);
  }, [open]);

  function speak(text: string) {
    if (!voiceOutOn || typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  }

  function toggleListening() {
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const Ctor = (window as unknown as { SpeechRecognition?: SpeechRecognitionCtor; webkitSpeechRecognition?: SpeechRecognitionCtor })
      .SpeechRecognition ?? (window as unknown as { webkitSpeechRecognition?: SpeechRecognitionCtor }).webkitSpeechRecognition;
    if (!Ctor) return;

    const recognition = new Ctor();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1]?.[0]?.transcript;
      if (transcript) setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  }

  async function sendMessage(text: string) {
    const question = text.trim();
    if (!question || isStreaming) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: question }];
    setMessages([...nextMessages, { role: "assistant", content: "" }]);
    setInput("");
    setIsStreaming(true);

    let full = "";
    try {
      const res = await fetch("/api/quran-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => null);
        full = data?.error ?? "Sorry, something went wrong. Please try again.";
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: full };
          return copy;
        });
      } else {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          full += decoder.decode(value, { stream: true });
          setMessages((prev) => {
            const copy = [...prev];
            copy[copy.length - 1] = { role: "assistant", content: full };
            return copy;
          });
        }
      }
    } catch {
      full = "Sorry, I couldn't reach the assistant. Please check your connection and try again.";
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = { role: "assistant", content: full };
        return copy;
      });
    } finally {
      setIsStreaming(false);
      if (full) speak(full);
    }
  }

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close Quran Assistant" : "Open Quran Assistant"}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.6, type: "spring", stiffness: 300, damping: 20 }}
        className="fixed bottom-5 right-5 z-[60] flex h-14 w-14 items-center justify-center rounded-full sm:bottom-6 sm:right-6"
        style={{ background: "var(--grad-btn)", boxShadow: "var(--bevel), var(--shadow-lg)" }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X size={22} color="var(--primary-ink)" />
            </motion.span>
          ) : (
            <motion.span key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <Sparkles size={22} color="var(--primary-ink)" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-x-4 bottom-24 z-[60] flex max-h-[min(640px,calc(100vh-140px))] flex-col overflow-hidden rounded-[var(--r-hero)] border sm:inset-x-auto sm:right-6 sm:w-[380px]"
            style={{ background: "var(--card)", borderColor: "var(--border)", boxShadow: "var(--shadow-xl)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 px-5 py-4" style={{ background: "var(--grad-hero)" }}>
              <div className="flex items-center gap-2.5">
                <Sparkles size={18} color="white" />
                <div>
                  <p className="text-[14.5px] font-semibold text-white">Quran Assistant</p>
                  <p className="text-[11.5px]" style={{ color: "rgba(255,255,255,0.8)" }}>
                    Answers grounded in the Quran
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setVoiceOutOn((v) => !v)}
                aria-label={voiceOutOn ? "Turn off spoken answers" : "Turn on spoken answers"}
                aria-pressed={voiceOutOn}
                className="flex h-8 w-8 items-center justify-center rounded-full"
                style={{ background: "rgba(255,255,255,0.16)" }}
              >
                {voiceOutOn ? <Volume2 size={15} color="white" /> : <VolumeX size={15} color="white" />}
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className="max-w-[86%] whitespace-pre-wrap rounded-[var(--r-card)] px-3.5 py-2.5 text-[13.5px] leading-relaxed"
                    style={
                      m.role === "user"
                        ? { background: "var(--grad-btn)", color: "var(--primary-ink)" }
                        : { background: "var(--card-2)", color: "var(--text)", border: "1px solid var(--hair)" }
                    }
                  >
                    {m.content || (isStreaming && i === messages.length - 1 ? <Loader2 size={14} className="animate-spin" /> : "")}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="border-t p-3" style={{ borderColor: "var(--hair)" }}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage(input);
                }}
                className="flex items-center gap-2"
              >
                {speechSupported && (
                  <button
                    type="button"
                    onClick={toggleListening}
                    aria-label={listening ? "Stop voice input" : "Ask by voice"}
                    aria-pressed={listening}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors"
                    style={{
                      background: listening ? "var(--primary)" : "var(--soft)",
                      color: listening ? "var(--primary-ink)" : "var(--primary)",
                    }}
                  >
                    {listening ? <Mic size={15} className="animate-pulse" /> : <MicOff size={15} />}
                  </button>
                )}
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about the Quran…"
                  className="min-w-0 flex-1 rounded-full border px-4 py-2 text-[13.5px] outline-none transition-colors focus:border-[var(--primary)]"
                  style={{ background: "var(--card-2)", borderColor: "var(--border)", color: "var(--text)" }}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isStreaming}
                  aria-label="Send question"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full disabled:opacity-40"
                  style={{ background: "var(--grad-btn)", color: "var(--primary-ink)" }}
                >
                  <Send size={15} />
                </button>
              </form>
              <p className="mt-2 text-center text-[10.5px]" style={{ color: "var(--faint)" }}>
                Only answers questions about the Holy Quran.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
