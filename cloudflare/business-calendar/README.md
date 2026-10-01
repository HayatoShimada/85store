# 営業日カレンダー（85-Store の設定）

Worker 本体は公開リポジトリ **[HayatoShimada/business-calendar](https://github.com/HayatoShimada/business-calendar)** にあります。ここには 85-Store 用の設定とデプロイ手順だけを置いています。

| ホスト | 役割 |
|---|---|
| `calendar-admin.85-store.com` | 管理画面（Cloudflare Access。ログイン方法は 85pi の tsidp のみ・info@85-store.com だけ許可） |
| `calendar.85-store.com` | 公開API `GET /v1/calendar`（サイトがブラウザから読む） |

- D1: `85store-business-calendar`（APAC）
- ログイン: 方式 C（Tailscale 内の端末だけ）。tsidp は 85pi で動いている（[docs/auth.md](https://github.com/HayatoShimada/business-calendar/blob/main/docs/auth.md)）
- Googleマップ連携: Business Profile API の承認待ち（2026-10-01 申請、ケースID 7-6137000041496）

## デプロイ

```bash
cd cloudflare/business-calendar
./deploy.sh            # Worker をデプロイ（deploy.sh の VERSION のバージョンを upstream/ に取得して使う）
./deploy.sh migrate    # 新しいバージョンにマイグレーションがあるとき
```

business-calendar を更新したら、`deploy.sh` の `VERSION` を新しいタグに変えて `./deploy.sh migrate && ./deploy.sh`。

## Googleマップ連携（API 承認後）

[docs/google.md](https://github.com/HayatoShimada/business-calendar/blob/main/docs/google.md) の 1〜2 を済ませてから:

```bash
GOOGLE_CLIENT_ID=... GOOGLE_CLIENT_SECRET=... ./deploy.sh google-setup --import
```
