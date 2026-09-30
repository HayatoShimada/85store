import { ImageResponse } from 'next/og';

// サイト共通のOGP画像（SNSはSVGを表示できないためPNGで生成する）
// 和文フォントを同梱しないよう、文字は英字のみにしている
export const alt = '85-Store — Select shop in Nanto, Toyama';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#ffffff', padding: 56 }}>
        <div style={{ display: 'flex', fontSize: 210, fontWeight: 800, letterSpacing: -12, lineHeight: 0.9, color: '#000000' }}>
          85-Store
        </div>
        <div style={{ display: 'flex', flex: 1, marginTop: 40, border: '1px solid #e2e2de' }}>
          <div style={{ display: 'flex', flex: 7, background: '#ff6b35', padding: 36, alignItems: 'flex-end', fontSize: 44, fontWeight: 700, color: '#000000' }}>
            Short-Term &amp; Long-Term
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', flex: 5, background: '#1f5c45', padding: 36, color: '#ffffff', fontSize: 30 }}>
            <div style={{ display: 'flex' }}>Select Shop</div>
            <div style={{ display: 'flex' }}>Nanto, Toyama</div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
