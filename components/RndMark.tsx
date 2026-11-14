// 85-Store Research & Development のマーク（六角形＝ハコの3面に 85・R・D）。線と文字は文字色、中心の点はロゴの赤で固定
export default function RndMark({ className }: { className?: string }) {
  const letter = { fontWeight: 800, letterSpacing: "-0.04em" } as const;
  return (
    <svg viewBox="-108.92 -125.77 217.85 251.55" className={className} role="img" aria-label="85-Store Research & Development のマーク">
      <g fill="none" stroke="currentColor" strokeWidth={10}>
        <polygon points="0,-120 103.92,-60 103.92,60 0,120 -103.92,60 -103.92,-60" strokeLinejoin="miter" />
        <line x1="0" y1="0" x2="103.92" y2="-60" />
        <line x1="0" y1="0" x2="0" y2="120" />
        <line x1="0" y1="0" x2="-103.92" y2="-60" />
      </g>
      <g fill="currentColor" className="font-display" textAnchor="middle" dominantBaseline="central">
        <g transform="matrix(0.866,-0.5,0.866,0.5,-103.92,-60)"><text x="60" y="60" style={{ ...letter, fontSize: 66 }}>85</text></g>
        <g transform="matrix(0.866,0.5,0,1,-103.92,-60)"><text x="60" y="60" style={{ ...letter, fontSize: 78 }}>R</text></g>
        <g transform="matrix(0.866,-0.5,0,1,0,0)"><text x="60" y="60" style={{ ...letter, fontSize: 78 }}>D</text></g>
      </g>
      <circle r="17" fill="var(--color-bg)" />
      <circle r="11" fill="#C8361E" />
    </svg>
  );
}
