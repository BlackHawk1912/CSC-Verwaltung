import React, { useLayoutEffect, useRef, useState } from "react";
import type { Strain } from "../../types/domain";

export type StrainCardProps = {
  strain: Strain;
  selected?: boolean;
  onSelect?: (id: string) => void;
};

const defaultImg =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240"><defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#f0e7d6"/><stop offset="1" stop-color="#b5c2a1"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#2f3b2a" font-size="24" font-family="system-ui, sans-serif">Sorte</text></svg>`
  );

export const StrainCard: React.FC<StrainCardProps> = ({
  strain,
  selected,
  onSelect,
}) => {
  const total = Math.max(1, strain.thc + strain.cbd);
  const thcPct = (strain.thc / total) * 100;
  const cbdPct = (strain.cbd / total) * 100;
  const rootRef = useRef<HTMLButtonElement | null>(null);
  const textRef = useRef<HTMLDivElement | null>(null);
  const [overlayStyle, setOverlayStyle] = useState<React.CSSProperties>({});
  const [fallbackStyle, setFallbackStyle] = useState<React.CSSProperties>({});
  const [supportsBackdrop, setSupportsBackdrop] = useState<boolean>(true);
  const softDarkGreenShadow = [
    "0 3px 6px rgba(16,36,24,1.00)",
    "0 8px 16px rgba(16,36,24,0.98)",
    "0 16px 32px rgba(16,36,24,0.96)",
    "0 24px 48px rgba(16,36,24,0.92)",
    "0 40px 80px rgba(16,36,24,0.90)",
    "0 56px 112px rgba(16,36,24,0.84)",
    "0 72px 144px rgba(16,36,24,0.78)",
  ].join(", ");

  useLayoutEffect(() => {
    const update = () => {
      const root = rootRef.current;
      const text = textRef.current;
      if (!root || !text) return;
      const rRect = root.getBoundingClientRect();
      const tRect = text.getBoundingClientRect();
      const cx =
        (((tRect.left + tRect.right) / 2 - rRect.left) / rRect.width) * 100;
      const cy =
        (((tRect.top + tRect.bottom) / 2 - rRect.top) / rRect.height) * 100;
      const rawR = Math.hypot(tRect.width, tRect.height) / 2 + 8;
      const maxR = Math.min(rRect.width, rRect.height) * 0.05;
      const holeR = Math.min(rawR, maxR);
      const feather = 110;
      const mid = holeR + feather * 0.65;
      const mask = `radial-gradient(circle at ${cx}% ${cy}%, transparent ${holeR}px, rgba(255,255,255,0.35) ${mid}px, rgba(255,255,255,0.98) ${
        holeR + feather
      }px, #fff 100%)`;
      const supports =
        typeof CSS !== "undefined" &&
        "supports" in CSS &&
        (CSS.supports("backdrop-filter", "blur(2px)") ||
          CSS.supports("-webkit-backdrop-filter", "blur(2px)"));
      setSupportsBackdrop(supports);

      if (supports) {
        setOverlayStyle({
          position: "absolute",
          inset: 0,
          zIndex: 1,
          backgroundColor: "rgba(24,44,28,0.58)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          maskImage: mask as unknown as string,
          WebkitMaskImage: mask as unknown as string,
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
          maskSize: "100% 100%",
          WebkitMaskSize: "100% 100%",
          willChange:
            "backdrop-filter, -webkit-backdrop-filter, mask-image, -webkit-mask-image, left, top, width, height",
          pointerEvents: "none",
        });
        setFallbackStyle({});
      } else {
        // Fallback: duplicate background as blurred layer and mask it
        setOverlayStyle({});
        setFallbackStyle({
          position: "absolute",
          inset: 0,
          zIndex: 1,
          backgroundImage: `url(${strain.imageDataUrl || defaultImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(16px)",
          transform: "scale(1.08)",
          backgroundColor: "rgba(24,44,28,0.58)",
          backgroundBlendMode: "multiply",
          maskImage: mask as unknown as string,
          WebkitMaskImage: mask as unknown as string,
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
          maskSize: "100% 100%",
          WebkitMaskSize: "100% 100%",
          pointerEvents: "none",
        });
      }
    };
    update();

    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => update())
        : null;
    if (ro && textRef.current) ro.observe(textRef.current);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("resize", update);
      if (ro && textRef.current) ro.unobserve(textRef.current);
    };
  }, []);

  return (
    <button
      type="button"
      className={`glass-card strain-card text-start position-relative overflow-hidden ${
        selected ? "selected" : ""
      }`}
      style={{ isolation: "isolate" }}
      onClick={() => onSelect?.(strain.id)}
      ref={rootRef}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${strain.imageDataUrl || defaultImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 1,
        }}
      />
      {/* Full-card blur with radial mask: center remains unblurred with soft edges */}
      {supportsBackdrop ? (
        <div aria-hidden style={overlayStyle} />
      ) : (
        <div aria-hidden style={fallbackStyle} />
      )}
      <div className="position-relative" style={{ zIndex: 2 }}>
        <span className="stock-badge d-inline-flex align-items-center gap-1">
          <span
            className="material-symbols-outlined"
            aria-hidden
            style={{ fontSize: 16, lineHeight: 1, color: "var(--moss-600)" }}
          >
            inventory_2
          </span>
          {strain.stockGrams.toFixed(1)} g vorrätig
        </span>
        <div ref={textRef}>
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <div
                className="text-white"
                style={{
                  fontWeight: 700,
                  fontSize: 19,
                  textShadow: softDarkGreenShadow,
                }}
              >
                {strain.name}
              </div>
            </div>
          </div>

          <div className="mt-3">
            <div
              className="ratio-bars"
              style={{
                gridTemplateColumns: `${thcPct}% ${cbdPct}%`,
                gap: 0,
                height: 12,
              }}
            >
              <div
                className="ratio-bar thc"
                style={{ borderRadius: "999px 0 0 999px" }}
              />
              <div
                className="ratio-bar cbd"
                style={{ borderRadius: "0 999px 999px 0" }}
              />
            </div>
            <div
              className="d-flex justify-content-between small text-light mt-1 mb-4"
              style={{ textShadow: softDarkGreenShadow }}
            >
              <span>THC {strain.thc}%</span>
              <span>CBD {strain.cbd}%</span>
            </div>
          </div>

          {strain.info.length > 0 && (
            <ul className="small text-secondary mb-0 mt-2 d-flex flex-wrap gap-2 list-unstyled">
              {strain.info.map((i) => (
                <li key={i} className="badge bg-light text-dark border">
                  {i}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </button>
  );
};
