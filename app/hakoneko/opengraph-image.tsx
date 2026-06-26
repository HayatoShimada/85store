import { ImageResponse } from 'next/og';

// Dynamic Open Graph / social share card for the Hakoneko game page.
// Latin-only text on purpose: the brand already uses the English tagline
// "Haconeco is watching you", and Latin glyphs render reliably in Satori
// without shipping a CJK font.
export const runtime = 'edge';
export const alt = 'Haconeco is watching you — a cute cosmic-horror cat merge puzzle';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: '#08080b',
          position: 'relative',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Ambient neon glows matching the landing page */}
        <div
          style={{
            position: 'absolute',
            top: -160,
            left: -120,
            width: 640,
            height: 640,
            borderRadius: '50%',
            background: '#ff5500',
            opacity: 0.18,
            filter: 'blur(160px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -160,
            right: -120,
            width: 560,
            height: 560,
            borderRadius: '50%',
            background: '#8a2be2',
            opacity: 0.16,
            filter: 'blur(180px)',
          }}
        />

        <div
          style={{
            fontSize: 30,
            letterSpacing: 14,
            color: '#ff8d1f',
            opacity: 0.7,
            textTransform: 'uppercase',
            marginBottom: 8,
          }}
        >
          85-Store
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            lineHeight: 1.05,
          }}
        >
          <div style={{ fontSize: 118, fontWeight: 900, color: '#ff8d1f', letterSpacing: 4 }}>
            HACONECO
          </div>
          <div style={{ fontSize: 56, fontWeight: 700, color: '#ffd9a8', letterSpacing: 10 }}>
            IS WATCHING YOU
          </div>
        </div>

        <div
          style={{
            marginTop: 36,
            fontSize: 34,
            color: '#cfcfcf',
            textAlign: 'center',
            maxWidth: 900,
          }}
        >
          Cute cats. Cosmic horror. A merge puzzle that watches back.
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: 44,
            fontSize: 26,
            color: '#9aa0aa',
            letterSpacing: 3,
          }}
        >
          App Store · iOS · ¥300
        </div>
      </div>
    ),
    { ...size }
  );
}
