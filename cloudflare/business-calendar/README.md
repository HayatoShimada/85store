# 営業日カレンダー（85-Store の設定）

Worker 本体は公開リポジトリ **[HayatoShimada/business-calendar](https://github.com/HayatoShimada/business-calendar)** にあります。ここには 85-Store 用の設定とデプロイ手順だけを置いています。

| ホスト | 役割 |
|---|---|
| `calendar-admin.85-store.com` | 管理画面（Cloudflare Access。ログイン方法は 85pi の tsidp のみ・info@85-store.com だけ許可） |
| `calendar.85-store.com` | 公開API `GET /v1/calendar`（サイトがブラウザから読む） |

- D1: `85store-business-calendar`（APAC）
- ログイン: 方式 C（Tailscale 内の端末だけ）。tsidp は 85pi で動いている（[docs/auth.md](https://github.com/HayatoShimada/business-calendar/blob/main/docs/auth.md)）
- SNS でのお知らせ: 管理画面の「お知らせを作る」→ 共有シートで X・Instagram に投稿（[docs/share.md](https://github.com/HayatoShimada/business-calendar/blob/main/docs/share.md)）
- Googleマップ連携: 有効（2026-10-29 設定。Google Cloud プロジェクト 31729388953 の OAuth クライアント「business_profile」）。管理画面で保存するたびに通常・特別営業時間を反映する

## デプロイ

```bash
cd cloudflare/business-calendar
./deploy.sh            # Worker をデプロイ（deploy.sh の VERSION のバージョンを upstream/ に取得して使う）
./deploy.sh migrate    # 新しいバージョンにマイグレーションがあるとき
```

business-calendar を更新したら、`deploy.sh` の `VERSION` を新しいタグに変えて `./deploy.sh migrate && ./deploy.sh`。

## Googleマップ連携の設定し直し（トークンの失効・シークレットの差し替え）

[docs/google.md](https://github.com/HayatoShimada/business-calendar/blob/main/docs/google.md) の 1〜2 を済ませてから:

```bash
GOOGLE_CLIENT_ID=... GOOGLE_CLIENT_SECRET=... ./deploy.sh google-setup --import
```
