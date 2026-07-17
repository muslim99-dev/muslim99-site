import Image from "next/image";

export default function PhoneFrame({
  src,
  alt,
  width = 240,
  priority = false,
}: {
  src: string;
  alt: string;
  width?: number;
  priority?: boolean;
}) {
  return (
    <div
      className="relative rounded-[2.4rem] p-2"
      style={{
        width,
        background: "linear-gradient(160deg, #23272a 0%, #0c0e0f 100%)",
        boxShadow: "var(--shadow-xl)",
      }}
    >
      <div className="relative overflow-hidden rounded-[1.9rem]" style={{ aspectRatio: "480 / 920" }}>
        <Image src={src} alt={alt} fill sizes={`${width}px`} className="object-cover" priority={priority} />
        <div
          className="absolute left-1/2 top-2 h-4 w-24 -translate-x-1/2 rounded-full"
          style={{ background: "#0c0e0f" }}
        />
      </div>
      <div
        className="absolute left-1/2 -translate-x-1/2 rounded-full"
        style={{ bottom: 6, width: width * 0.32, height: 3.5, background: "rgba(255,255,255,0.35)" }}
      />
    </div>
  );
}
