"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { MessageCircleQuestion, Send, X, Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

// Floating "ask us anything" chat for visitors, backed by
// src/app/api/assistant/route.ts. The conversation is kept in
// sessionStorage, so it survives page navigation within a visit but
// isn't stored anywhere else. Sits above the WhatsApp button.

type ChatMessage = { role: "user" | "assistant"; content: string };

const STORAGE_KEY = "nobs_assistant_chat";
// Matches the API's own limits (MAX_MESSAGES / MAX_MESSAGE_CHARS) so the
// request never gets rejected for length.
const MAX_HISTORY = 40;
const MAX_CHARS = 2000;

function loadHistory(): ChatMessage[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ChatMessage[]) : [];
  } catch {
    return [];
  }
}

// The most recent MAX_HISTORY messages, starting on a visitor message
// (the API requires the conversation to start with one).
function trimHistory(messages: ChatMessage[]): ChatMessage[] {
  const recent = messages.slice(-MAX_HISTORY);
  return recent[0]?.role === "assistant" ? recent.slice(1) : recent;
}

// Replies can contain links to /booking, /pricing etc. Render URLs as
// links and everything else as plain text (never as HTML).
function Linkified({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/[^\s)]+)/g);
  return (
    <>
      {parts.map((part, i) =>
        /^https?:\/\//.test(part) ? (
          <a
            key={i}
            href={part}
            className="underline underline-offset-2 hover:text-[var(--color-brass)]"
            target={part.includes("nobs-agent.site") ? undefined : "_blank"}
            rel="noopener noreferrer"
          >
            {part.replace(/^https?:\/\/(www\.)?/, "")}
          </a>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

export function SiteAssistant() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending, open]);

  function openChat() {
    // Restore this visit's earlier conversation the first time it opens.
    if (!loaded) {
      setMessages(loadHistory());
      setLoaded(true);
    }
    setOpen(true);
  }

  function updateMessages(next: ChatMessage[]) {
    setMessages(next);
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Storage unavailable (private mode etc.) — the chat still works.
    }
  }

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  async function send(e?: FormEvent) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    const next = [...messages, { role: "user" as const, content: text.slice(0, MAX_CHARS) }];
    updateMessages(next);
    setInput("");
    setError(null);
    setSending(true);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: trimHistory(next) }),
      });
      const data = await res.json();
      if (!res.ok || typeof data.reply !== "string") {
        setError(typeof data.error === "string" ? data.error : t("assistant_error"));
        return;
      }
      updateMessages([...next, { role: "assistant", content: data.reply }]);
    } catch {
      setError(t("assistant_error"));
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={openChat}
          aria-label={t("assistant_open")}
          title={t("assistant_open")}
          className="fixed bottom-24 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-brass)] text-[var(--color-ink)] shadow-lg shadow-black/30 transition hover:scale-105"
        >
          <MessageCircleQuestion size={26} />
        </button>
      )}

      {open && (
        <div
          role="dialog"
          aria-label={t("assistant_title")}
          className="fixed inset-x-3 bottom-3 z-50 flex max-h-[80vh] flex-col overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-ink)] shadow-2xl shadow-black/50 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:h-[560px] sm:w-[380px]"
        >
          <div className="flex items-start justify-between gap-3 border-b border-[var(--color-line)] p-4">
            <div>
              <p className="font-[family-name:var(--font-display)] text-base font-medium text-[var(--color-paper)]">
                {t("assistant_title")}
              </p>
              <p className="mt-0.5 text-xs text-[var(--color-slate)]">{t("assistant_subtitle")}</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t("assistant_close")}
              className="rounded-full p-1.5 text-[var(--color-slate)] transition hover:bg-white/10 hover:text-[var(--color-paper)]"
            >
              <X size={18} />
            </button>
          </div>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
            <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white/5 px-3.5 py-2.5 text-sm text-[var(--color-paper)]">
              {t("assistant_greeting")}
            </div>
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm ${
                  m.role === "user"
                    ? "ml-auto rounded-tr-sm bg-[var(--color-brass)] text-[var(--color-ink)]"
                    : "rounded-tl-sm bg-white/5 text-[var(--color-paper)]"
                }`}
              >
                {m.role === "assistant" ? <Linkified text={m.content} /> : m.content}
              </div>
            ))}
            {sending && (
              <div className="flex items-center gap-2 text-xs text-[var(--color-slate)]">
                <Loader2 size={14} className="animate-spin" />
                {t("assistant_thinking")}
              </div>
            )}
            {error && <p className="text-xs text-red-400">{error}</p>}
          </div>

          <form onSubmit={send} className="border-t border-[var(--color-line)] p-3">
            <div className="flex items-end gap-2">
              <label htmlFor="site-assistant-input" className="sr-only">
                {t("assistant_placeholder")}
              </label>
              <textarea
                id="site-assistant-input"
                ref={inputRef}
                rows={1}
                maxLength={MAX_CHARS}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send();
                  }
                }}
                placeholder={t("assistant_placeholder")}
                className="max-h-32 min-h-[44px] flex-1 resize-none rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-[var(--color-paper)] outline-none transition focus:border-[var(--color-brass)]"
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                aria-label={t("assistant_send")}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-brass)] text-[var(--color-ink)] transition hover:opacity-90 disabled:opacity-40"
              >
                <Send size={16} />
              </button>
            </div>
            <p className="mt-2 text-[10px] text-[var(--color-slate)]">{t("assistant_note")}</p>
          </form>
        </div>
      )}
    </>
  );
}
