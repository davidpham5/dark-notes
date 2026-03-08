import React, { useRef, useEffect, useCallback } from "react";

export default function ProseEditor({ value, onChange, placeholder = "Start writing…" }) {
  const ref = useRef(null);

  const resize = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  }, []);

  useEffect(() => {
    resize();
  }, [value, resize]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onInput={resize}
      placeholder={placeholder}
      className="w-full bg-transparent text-iv-text resize-none outline-none placeholder-iv-tertiary"
      style={{
        minHeight: "calc(100vh - 16rem)",
        fontSize: "1.125rem",
        lineHeight: "1.85",
        letterSpacing: "0.01em",
      }}
    />
  );
}
