export default function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[13px] font-semibold tracking-wide"
      style={{ background: "var(--soft)", color: "var(--soft-text)" }}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 0l2.5 7.2L21.7 9l-6.6 3.4L17 20l-5-4.5L7 20l1.9-7.6L2.3 9l7.2-1.8L12 0z" />
      </svg>
      {children}
    </div>
  );
}
