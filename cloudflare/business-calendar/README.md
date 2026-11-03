# 営業日カレンダー（85-Store の設定）

Worker 本体は公開リポジトリ **[HayatoShimada/business-calendar](https://github.com/HayatoShimada/business-calendar)** にあります。ここには 85-Store 用の設定とデプロイ手順だけを置いています。

下のドキュメントへのリンクは `deploy.sh` の `VERSION`（v1.3.0）に合わせています。`VERSION` を上げたらリンクも変えてください。

| ホスト | 役割 |
|---|---|
| `calendar-admin.85-store.com` | 管理画面（Cloudflare Access。ログイン方法は 85pi の tsidp のみ・info@85-store.com だけ許可） |
| `calendar.85-store.com` | 公開API `GET /v1/calendar`（サイトがブラウザから読む） |

- D1: `85store-business-calendar`（APAC）
- ログイン: 方式 C（Tailscale 内の端末だけ）。tsidp は 85pi で動いている（[docs/auth.md](https://github.com/HayatoShimada/business-calendar/blob/v1.3.0/docs/auth.md)）
- SNS でのお知らせ: 管理画面の「お知らせを作る」→ 共有シートで X・Instagram に投稿（[docs/share.md](https://github.com/HayatoShimada/business-calendar/blob/v1.3.0/docs/share.md)）
- Googleマップ連携: 有効（2026-10-29 設定。Google Cloud プロジェクト 31729388953 の OAuth クライアント「business_profile」）。管理画面で保存するたびに通常・特別営業時間を反映する
  - **営業時間の編集は管理画面だけで行う。** Googleマップ（ビジネスプロフィール）で直接直しても、次に管理画面で保存したときに上書きされる
  - 反映の結果は管理画面の「Googleマップ」の欄に出る（失敗したときは理由と「もう一度反映する」）

## デプロイ

```bash
cd cloudflare/business-calendar
./deploy.sh            # Worker をデプロイ（deploy.sh の VERSION のバージョンを upstream/ に取得して使う）
./deploy.sh migrate    # 新しいバージョンにマイグレーションがあるとき
```

business-calendar を更新したら、`deploy.sh` の `VERSION` を新しいタグに変えて `./deploy.sh migrate && ./deploy.sh`。

## Googleマップ連携の設定し直し（トークンの失効・シークレットの差し替え）

API の申請と OAuth クライアントは済んでいるので、[docs/google.md](https://github.com/HayatoShimada/business-calendar/blob/v1.3.0/docs/google.md) の 1〜2 はやり直さない。今の OAuth クライアント「business_profile」（デスクトップ アプリ）の ID とシークレットを使う。シークレットを差し替えるときは、Cloud Console のそのクライアントでシークレットを作り直す。

```bash
cd cloudflare/business-calendar
GOOGLE_CLIENT_ID=... GOOGLE_CLIENT_SECRET=... ./deploy.sh google-setup
```

- **`--import` は付けない。** 管理画面が正なので、Googleマップに残っている古い特別営業時間が管理画面に取り込まれてしまう（`--import` は最初の設定のときだけ使った）
- 表示された URL をブラウザで開いて許可すると、`http://127.0.0.1:53682/callback?code=...` に戻る。コマンドを動かしているのとは別の端末のブラウザで許可した場合は「接続できません」になるので、アドレスバーの URL をコピーし、コマンドを動かしている端末で `curl '<その URL>'` を送ると先に進む
- 終わったら管理画面の「Googleマップ」の欄で「今すぐ反映する」を押し、「反映済み」になることを確かめる
