"use client";

import Image from "next/image";
import { Fragment } from "react";
import type { WhatsappMessage } from "@/types/orders";

/* ------------------------------------------------------------------ */
/* Time helpers                                                        */
/* ------------------------------------------------------------------ */

const BOGOTA_TZ = "America/Bogota";

function formatBogotaTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: BOGOTA_TZ,
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

function formatBogotaDateLabel(iso: string, today: Date): string {
  try {
    const msg = new Date(iso);
    const fmt = new Intl.DateTimeFormat("es-CO", {
      timeZone: BOGOTA_TZ,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const msgKey = fmt.format(msg);
    const todayKey = fmt.format(today);
    if (msgKey === todayKey) return "HOY";
    const yest = new Date(today.getTime() - 86_400_000);
    if (msgKey === fmt.format(yest)) return "AYER";
    return new Intl.DateTimeFormat("es-CO", {
      timeZone: BOGOTA_TZ,
      day: "numeric",
      month: "long",
      year: "numeric",
    })
      .format(msg)
      .toUpperCase();
  } catch {
    return "";
  }
}

/* ------------------------------------------------------------------ */
/* Minimal WhatsApp-style markdown → React nodes                       */
/* Supports *bold*, _italic_, ~strike~, ```code```, and URL auto-links */
/* ------------------------------------------------------------------ */

function renderWhatsAppText(text: string): React.ReactNode {
  const lines = text.split("\n");
  return lines.map((line, i) => (
    <Fragment key={i}>
      {formatInline(line)}
      {i < lines.length - 1 && <br />}
    </Fragment>
  ));
}

function formatInline(text: string): React.ReactNode {
  const tokenRegex =
    /(```[^`]+```)|(\*[^*\n]+\*)|(_[^_\n]+_)|(~[^~\n]+~)|(https?:\/\/[^\s]+)/g;
  const parts: React.ReactNode[] = [];
  let last = 0;
  let key = 0;
  let m: RegExpExecArray | null;
  while ((m = tokenRegex.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const token = m[0];
    if (token.startsWith("```")) {
      parts.push(
        <code
          key={key++}
          className="font-mono text-[0.9em] bg-black/5 rounded px-1"
        >
          {token.slice(3, -3)}
        </code>,
      );
    } else if (token.startsWith("*")) {
      parts.push(
        <strong key={key++} className="font-semibold">
          {token.slice(1, -1)}
        </strong>,
      );
    } else if (token.startsWith("_")) {
      parts.push(
        <em key={key++} className="italic">
          {token.slice(1, -1)}
        </em>,
      );
    } else if (token.startsWith("~")) {
      parts.push(
        <s key={key++} className="line-through">
          {token.slice(1, -1)}
        </s>,
      );
    } else {
      parts.push(
        <a
          key={key++}
          href={token}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#027EB5] underline break-all"
        >
          {token}
        </a>,
      );
    }
    last = m.index + token.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

/* ------------------------------------------------------------------ */
/* Delivery tick                                                       */
/* ------------------------------------------------------------------ */

function DeliveryTick({ w }: { w: WhatsappMessage }) {
  if (w.failed_at) {
    return (
      <span
        className="text-[10px] font-medium text-red-500"
        title="Falló el envío"
      >
        ✕
      </span>
    );
  }
  // Read → double check blue (#53BDEB)
  if (w.read_at) {
    return <DoubleCheck color="#53BDEB" />;
  }
  // Delivered → double check gray
  if (w.delivered_at) {
    return <DoubleCheck color="#8696A0" />;
  }
  // Sent → single check gray
  return <SingleCheck color="#8696A0" />;
}

function SingleCheck({ color }: { color: string }) {
  return (
    <svg
      viewBox="0 0 16 15"
      width="14"
      height="14"
      aria-hidden
      className="shrink-0"
    >
      <path
        fill={color}
        d="M10.91 3.316l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"
      />
    </svg>
  );
}

function DoubleCheck({ color }: { color: string }) {
  return (
    <svg
      viewBox="0 0 16 15"
      width="16"
      height="15"
      aria-hidden
      className="shrink-0"
    >
      <path
        fill={color}
        d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.397-.287a.319.319 0 0 0-.44.05l-.444.563a.365.365 0 0 0 .05.514l1.488 1.254c.143.12.363.105.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* WhatsApp chat doodle background (subtle, tiled)                     */
/* Compact open-source doodle distilled to a small tileable SVG.       */
/* ------------------------------------------------------------------ */

const DOODLE_DATA_URL =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180' viewBox='0 0 180 180'>
      <g fill='none' stroke='#000000' stroke-opacity='0.06' stroke-width='1.2'>
        <path d='M20 30 q5 -10 12 0 t12 0'/>
        <circle cx='60' cy='20' r='4'/>
        <path d='M90 40 l6 6 l-6 6 l-6 -6 z'/>
        <path d='M130 25 q4 -8 10 0 q4 8 10 0'/>
        <path d='M160 55 q-5 5 0 10 t10 0'/>
        <path d='M20 75 l8 0 m-4 -4 l0 8'/>
        <circle cx='55' cy='80' r='3'/>
        <path d='M85 90 q5 -10 10 0 t10 0 t10 0'/>
        <path d='M140 85 q3 6 8 3 q5 -3 8 3'/>
        <path d='M25 120 q5 5 10 0 q5 -5 10 0'/>
        <path d='M70 115 l6 6 m0 -6 l-6 6'/>
        <circle cx='110' cy='125' r='4'/>
        <path d='M140 130 q-4 -6 3 -8 q7 -2 4 6'/>
        <path d='M25 160 q8 -6 14 0 t14 0'/>
        <path d='M95 155 l8 0 l0 8 l-8 0 z'/>
        <circle cx='140' cy='160' r='3'/>
        <path d='M165 150 q-5 8 3 12'/>
      </g>
    </svg>`,
  );

/* ------------------------------------------------------------------ */
/* iOS status bar                                                       */
/* ------------------------------------------------------------------ */

function IosStatusBar({ time }: { time: string }) {
  return (
    <div
      className="relative flex items-center justify-between px-6 pt-2 pb-1 text-black dark:text-white"
      style={{ fontFamily: '-apple-system, "SF Pro Text", "Helvetica Neue", sans-serif' }}
    >
      <span className="text-[13px] font-semibold tabular-nums">{time}</span>
      {/* Dynamic island */}
      <div
        aria-hidden
        className="absolute left-1/2 -translate-x-1/2 top-1.5 h-6 w-24 rounded-full bg-black"
      />
      <div className="flex items-center gap-1 text-[11px]">
        {/* signal */}
        <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor" aria-hidden>
          <rect x="0" y="8" width="3" height="3" rx="0.5" />
          <rect x="4.5" y="6" width="3" height="5" rx="0.5" />
          <rect x="9" y="3" width="3" height="8" rx="0.5" />
          <rect x="13.5" y="0" width="3" height="11" rx="0.5" />
        </svg>
        {/* wifi */}
        <svg width="15" height="11" viewBox="0 0 15 11" fill="currentColor" aria-hidden>
          <path d="M7.5 2.5c2.7 0 5.2 1 7 2.6l-1 1.2c-1.6-1.4-3.7-2.2-6-2.2s-4.4.8-6 2.2l-1-1.2c1.8-1.6 4.3-2.6 7-2.6zm0 3c1.7 0 3.3.6 4.5 1.7l-1 1.2c-1-0.9-2.2-1.4-3.5-1.4s-2.5.5-3.5 1.4l-1-1.2c1.2-1.1 2.8-1.7 4.5-1.7zm0 3.2c.8 0 1.5.3 2 .9l-2 2.4-2-2.4c.5-.6 1.2-.9 2-.9z" />
        </svg>
        {/* battery */}
        <svg width="25" height="11" viewBox="0 0 25 11" fill="none" aria-hidden>
          <rect
            x="0.5"
            y="0.5"
            width="22"
            height="10"
            rx="2.5"
            stroke="currentColor"
            strokeOpacity="0.4"
          />
          <rect x="2" y="2" width="17" height="7" rx="1" fill="currentColor" />
          <rect x="23" y="3.5" width="1.5" height="4" rx="0.5" fill="currentColor" opacity="0.4" />
        </svg>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* WhatsApp conversation header                                         */
/* ------------------------------------------------------------------ */

function WhatsAppHeader({ online }: { online: boolean }) {
  return (
    <div
      className="flex items-center gap-2 px-2 py-1.5 bg-white border-b border-black/10"
      style={{ fontFamily: '-apple-system, "SF Pro Text", "Helvetica Neue", sans-serif' }}
    >
      {/* Back chevron */}
      <svg
        className="text-[#007AFF] shrink-0"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
      >
        <path
          d="M15 18l-6-6 6-6"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {/* Avatar — Samsung Store wordmark on black, single line. ViewBox is
          wider than the rendered square so "Samsung Store" fits in one line;
          preserveAspectRatio keeps the aspect, and the circle clipping mask
          gives the WhatsApp round profile picture shape. */}
      <div
        className="w-9 h-9 rounded-full overflow-hidden shrink-0 bg-black flex items-center justify-center"
        aria-hidden
      >
        <svg
          viewBox="0 0 80 80"
          width="36"
          height="36"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Samsung Store"
        >
          <rect width="80" height="80" fill="#000" />
          <text
            x="40"
            y="44"
            textAnchor="middle"
            fill="#fff"
            fontSize="11"
            fontWeight="600"
            letterSpacing="-0.3"
            fontFamily='-apple-system, "SF Pro Text", "Helvetica Neue", Arial, sans-serif'
          >
            Samsung Store
          </text>
        </svg>
      </div>
      {/* Name + status */}
      <div className="flex-1 min-w-0 leading-tight">
        <div className="text-[15px] font-semibold text-[#111B21] truncate">
          Samsung Store
        </div>
        <div className="text-[11px] text-[#667781]">
          {online ? "en línea" : "visto hace un momento"}
        </div>
      </div>
      {/* Video + phone */}
      <button type="button" className="text-[#007AFF] p-1" aria-label="video">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M15 10.5V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-3.5l5 3.5V7l-5 3.5z"
            fill="currentColor"
          />
        </svg>
      </button>
      <button type="button" className="text-[#007AFF] p-1" aria-label="llamar">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M19.2 14.9c-1.3 0-2.5-.2-3.6-.6-.4-.1-.8 0-1.1.3l-2.2 2.2c-2.8-1.5-5.2-3.8-6.6-6.6l2.2-2.2c.3-.3.4-.7.3-1.1-.4-1.2-.6-2.4-.6-3.6 0-.6-.4-1-1-1H2.9C2.4 2.3 2 2.7 2 3.3 2 12.3 9.7 20 18.7 20c.6 0 1-.4 1-1v-3.2c0-.5-.4-.9-.9-.9z"
            fill="currentColor"
          />
        </svg>
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Incoming message bubble                                              */
/* ------------------------------------------------------------------ */

interface IncomingBubbleProps {
  msg: WhatsappMessage;
  showTail: boolean;
}

function IncomingBubble({ msg, showTail }: IncomingBubbleProps) {
  const time = formatBogotaTime(msg.sent_at);
  return (
    <div className="relative w-fit max-w-[85%] ml-1">
      {/* Tail */}
      {showTail && (
        <svg
          viewBox="0 0 8 13"
          width="8"
          height="13"
          className="absolute -left-[7px] top-0"
          aria-hidden
        >
          <path
            d="M5.188,1.465C5.188,0.655,4.533,0,3.723,0C3.253,0,2.844,0.235,2.58,0.587L0,8.887l5.188,0z"
            fill="#FFFFFF"
          />
          <path
            d="M5.188,1.465C5.188,0.655,4.533,0,3.723,0C3.253,0,2.844,0.235,2.58,0.587L0,8.887l5.188,0z"
            fill="#000"
            fillOpacity="0.08"
          />
          <path
            d="M5.188,1.465C5.188,0.655,4.533,0,3.723,0C3.253,0,2.844,0.235,2.58,0.587L0,8.887l5.188,0z"
            fill="#FFFFFF"
          />
        </svg>
      )}
      <div
        className={`relative bg-white text-[#111B21] rounded-[7.5px] ${
          showTail ? "rounded-tl-[2px]" : ""
        } shadow-[0_1px_0.5px_rgba(11,20,26,0.13)] overflow-hidden`}
      >
        {/* Header media */}
        {msg.header_media_url && (
          <div className="relative bg-black/5 aspect-[4/3] w-full">
            <Image
              src={msg.header_media_url}
              alt="header"
              fill
              sizes="320px"
              className="object-cover"
              unoptimized
            />
          </div>
        )}
        {/* Body */}
        {msg.body_text && (
          <div
            className="px-[9px] pt-[6px] pb-[6px] text-[14.2px] leading-[19px] whitespace-pre-wrap break-words"
            style={{
              fontFamily: '-apple-system, "SF Pro Text", "Helvetica Neue", sans-serif',
            }}
          >
            {renderWhatsAppText(msg.body_text)}
            {/* Inline tail-space: push timestamp to new line when body wraps */}
            <span className="inline-block w-[58px]" aria-hidden />
          </div>
        )}
        {!msg.body_text && msg.header_media_url && (
          <div
            className="px-[9px] pt-[6px] pb-[6px] text-[12px] italic text-[#667781]"
            style={{
              fontFamily: '-apple-system, "SF Pro Text", "Helvetica Neue", sans-serif',
            }}
          >
            (solo imagen)
            <span className="inline-block w-[58px]" aria-hidden />
          </div>
        )}
        {/* Timestamp row — absolute, bottom-right */}
        <div
          className="absolute bottom-[4px] right-[7px] flex items-center gap-[3px] text-[10.5px] text-[#667781] select-none"
          style={{
            fontFamily: '-apple-system, "SF Pro Text", "Helvetica Neue", sans-serif',
          }}
        >
          <span className="tabular-nums">{time}</span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Chat composer (fake input at bottom)                                 */
/* ------------------------------------------------------------------ */

function ChatComposer() {
  return (
    <div className="flex items-center gap-2 px-2 py-2 bg-[#F0F2F5] border-t border-black/5">
      <button type="button" className="text-[#54656F] p-1" aria-label="adjuntar">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 4v16m-8-8h16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>
      <div className="flex-1 bg-white rounded-full px-3 py-1.5 text-[13px] text-[#8696A0] border border-black/5">
        Mensaje
      </div>
      <button type="button" className="text-[#54656F] p-1" aria-label="cámara">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M4 8h3l2-2h6l2 2h3v10H4V8z m8 8a3 3 0 1 0 0-6a3 3 0 0 0 0 6z"
            fill="currentColor"
          />
        </svg>
      </button>
      <button type="button" className="text-[#54656F] p-1" aria-label="voz">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zM18 12a6 6 0 0 1-12 0H4a8 8 0 0 0 7 7.9V22h2v-2.1A8 8 0 0 0 20 12h-2z"
            fill="currentColor"
          />
        </svg>
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main preview                                                          */
/* ------------------------------------------------------------------ */

interface Props {
  messages: WhatsappMessage[];
  /** Optional current wall-clock to derive "HOY"/"AYER" labels. */
  now?: Date;
}

export function WhatsAppPhonePreview({ messages, now }: Props) {
  if (messages.length === 0) return null;

  const sorted = [...messages].sort(
    (a, b) => new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime(),
  );
  const today = now ?? new Date();

  // iOS status bar time = time of LAST message (so it matches when customer saw the most recent one)
  const statusBarTime = formatBogotaTime(sorted[sorted.length - 1].sent_at);
  const anyRead = sorted.some((m) => m.read_at);

  // Group consecutive messages on the same day
  const fmt = new Intl.DateTimeFormat("es-CO", {
    timeZone: BOGOTA_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const groups: Array<{ dateLabel: string; messages: WhatsappMessage[] }> = [];
  for (const m of sorted) {
    const key = fmt.format(new Date(m.sent_at));
    const last = groups[groups.length - 1];
    if (last && fmt.format(new Date(last.messages[0].sent_at)) === key) {
      last.messages.push(m);
    } else {
      groups.push({
        dateLabel: formatBogotaDateLabel(m.sent_at, today),
        messages: [m],
      });
    }
  }

  const recipient = sorted[0]?.recipient_phone ?? null;

  return (
    <div className="space-y-4 py-2">
      {/* Phone frame — centered in the (now narrower) right column */}
      <div className="flex justify-center">
        <div
          className="relative rounded-[44px] bg-black p-[10px] shadow-2xl"
          style={{ width: 360 }}
        >
          {/* Side buttons */}
          <div
            aria-hidden
            className="absolute left-[-3px] top-[110px] w-[3px] h-[30px] bg-black rounded-l-sm"
          />
          <div
            aria-hidden
            className="absolute left-[-3px] top-[160px] w-[3px] h-[55px] bg-black rounded-l-sm"
          />
          <div
            aria-hidden
            className="absolute left-[-3px] top-[225px] w-[3px] h-[55px] bg-black rounded-l-sm"
          />
          <div
            aria-hidden
            className="absolute right-[-3px] top-[180px] w-[3px] h-[80px] bg-black rounded-r-sm"
          />
          {/* Screen */}
          <div
            className="rounded-[34px] overflow-hidden bg-white"
            style={{ height: 720 }}
          >
            <IosStatusBar time={statusBarTime} />
            <WhatsAppHeader online={anyRead} />

            {/* Chat area with doodle bg */}
            <div
              className="relative overflow-y-auto"
              style={{
                height: 720 - 34 - 56 - 48, // roughly statusbar + header + composer
                backgroundColor: "#EFEAE2",
                backgroundImage: `url("${DOODLE_DATA_URL}")`,
                backgroundRepeat: "repeat",
                backgroundSize: "180px 180px",
              }}
            >
              <div className="p-2 space-y-2">
                {groups.map((g, gi) => (
                  <Fragment key={gi}>
                    {/* Day separator pill */}
                    <div className="flex justify-center my-2">
                      <span
                        className="px-2.5 py-0.5 rounded-md bg-[#E1F3FB] text-[#54656F] text-[11px] font-medium shadow-[0_1px_0.5px_rgba(11,20,26,0.13)]"
                        style={{
                          fontFamily:
                            '-apple-system, "SF Pro Text", "Helvetica Neue", sans-serif',
                        }}
                      >
                        {g.dateLabel}
                      </span>
                    </div>
                    {g.messages.map((m, i) => (
                      <div key={m.message_id} className="flex">
                        <IncomingBubble msg={m} showTail={i === 0} />
                      </div>
                    ))}
                  </Fragment>
                ))}
              </div>
            </div>

            <ChatComposer />
          </div>

          {/* Home indicator */}
          <div
            aria-hidden
            className="absolute bottom-[6px] left-1/2 -translate-x-1/2 w-32 h-1 bg-white/80 rounded-full"
          />
        </div>
      </div>

      {/* Info panel — below the phone, sized for the narrow right column */}
      <div className="space-y-3 text-sm">
        {recipient && (
          <p className="text-xs text-muted-foreground">
            Destinatario:{" "}
            <span className="font-mono text-foreground/80">+{recipient}</span>
          </p>
        )}

        <div className="space-y-1.5">
          <div className="font-semibold text-foreground uppercase tracking-wide text-[10px]">
            Entrega por mensaje
          </div>
          <ul className="space-y-1.5">
            {sorted.map((m) => {
              const state = deliveryState(m);
              return (
                <li
                  key={m.message_id}
                  className="flex items-start gap-2 py-1.5 px-2 rounded-md bg-muted/40"
                >
                  <div className="shrink-0 pt-0.5">
                    <DeliveryTick w={m} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-medium text-foreground truncate text-xs">
                        {prettyTemplateName(m.template_name)}
                      </span>
                      <span className="text-[11px] tabular-nums text-muted-foreground shrink-0">
                        {formatBogotaTime(m.sent_at)}
                      </span>
                    </div>
                    <div className="text-[11px] text-muted-foreground flex flex-wrap gap-x-1.5">
                      <span className={state.cls}>{state.label}</span>
                      {m.delivered_at && (
                        <span className="text-muted-foreground/70">
                          · entregado {formatBogotaTime(m.delivered_at)}
                        </span>
                      )}
                      {m.read_at && (
                        <span className="text-[#53BDEB]">
                          · leído {formatBogotaTime(m.read_at)}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

function prettyTemplateName(name: string): string {
  return name
    .split("_")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

function deliveryState(m: WhatsappMessage): { label: string; cls: string } {
  if (m.failed_at) return { label: "Falló", cls: "text-red-600" };
  if (m.read_at) return { label: "Leído", cls: "text-[#53BDEB]" };
  if (m.delivered_at) return { label: "Entregado", cls: "text-foreground/80" };
  return { label: "Enviado", cls: "text-muted-foreground" };
}
