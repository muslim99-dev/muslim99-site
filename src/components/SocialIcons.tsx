// Lightweight brand glyphs for share buttons — lucide-react dropped brand
// icons (Facebook/Twitter/Instagram/WhatsApp) from its icon set, so these
// are simple inline SVGs sized to match lucide's API (a `size` prop).

export function WhatsAppIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.47 14.38c-.29-.15-1.72-.85-1.99-.95-.27-.1-.46-.15-.66.15-.19.29-.75.94-.92 1.14-.17.19-.34.22-.63.07-.29-.15-1.22-.45-2.33-1.44-.86-.77-1.44-1.71-1.61-2-.17-.29-.02-.45.13-.6.13-.13.29-.34.44-.51.15-.17.19-.29.29-.48.1-.19.05-.36-.02-.51-.07-.15-.66-1.59-.9-2.18-.24-.57-.48-.5-.66-.51-.17-.01-.36-.01-.56-.01-.19 0-.51.07-.78.36-.27.29-1.02 1-1.02 2.43 0 1.44 1.04 2.83 1.19 3.02.15.19 2.05 3.13 4.96 4.39.69.3 1.23.48 1.65.61.69.22 1.32.19 1.82.11.55-.08 1.72-.7 1.96-1.38.24-.68.24-1.26.17-1.38-.07-.12-.26-.19-.55-.34z" />
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.79.47 3.47 1.29 4.93L2 22l5.31-1.39a9.9 9.9 0 0 0 4.73 1.2h.01c5.46 0 9.9-4.45 9.9-9.9C21.96 6.45 17.5 2 12.04 2zm0 18.02h-.01a8.1 8.1 0 0 1-4.13-1.13l-.3-.18-3.06.81.82-2.99-.19-.31a8.07 8.07 0 0 1-1.24-4.31c0-4.47 3.64-8.11 8.12-8.11 2.17 0 4.2.85 5.74 2.39a8.07 8.07 0 0 1 2.38 5.73c0 4.47-3.64 8.1-8.13 8.1z" />
    </svg>
  );
}

export function FacebookIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M13.5 21v-7.5h2.5l.4-3H13.5V8.4c0-.87.24-1.46 1.49-1.46h1.6V4.3c-.28-.04-1.22-.12-2.32-.12-2.3 0-3.87 1.4-3.87 3.98v2.22H7.9v3h2.5V21h3.1z" />
    </svg>
  );
}

export function XIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.24 3H21l-6.34 7.24L22 21h-6.19l-4.84-6.32L5.4 21H2.62l6.78-7.75L2 3h6.34l4.38 5.79L18.24 3zm-1.08 16.17h1.53L7.9 4.74H6.26l10.9 14.43z" />
    </svg>
  );
}

export function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}
