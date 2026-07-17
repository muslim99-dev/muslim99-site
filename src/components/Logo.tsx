import Image from "next/image";

export default function Logo({ size = 40, showWordmark = true }: { size?: number; showWordmark?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="relative shrink-0 overflow-hidden rounded-[22%]"
        style={{ width: size, height: size, boxShadow: "var(--shadow-sm)" }}
      >
        <Image src="/logo/logo-192.png" alt="Muslim99 logo" fill sizes={`${size}px`} priority />
      </div>
      {showWordmark && (
        <span className="text-[19px] font-semibold tracking-tight" style={{ color: "var(--text)" }}>
          Muslim<span style={{ color: "var(--primary)" }}>99</span>
        </span>
      )}
    </div>
  );
}
