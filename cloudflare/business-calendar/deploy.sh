#!/usr/bin/env bash
# 85-Store の営業日カレンダーを、business-calendar の決まったバージョンでデプロイする
#   ./deploy.sh                 # Worker をデプロイ
#   ./deploy.sh migrate         # D1 のマイグレーションを適用
#   ./deploy.sh google-setup    # Googleマップ連携のセットアップ（docs/google.md）
set -euo pipefail

# 使う business-calendar のバージョン（更新するときはここを変える）
VERSION="v1.0.0"
REPO="https://github.com/HayatoShimada/business-calendar.git"

cd "$(dirname "$0")"

if [ ! -d upstream/.git ]; then
  git clone --quiet --depth 1 --branch "$VERSION" "$REPO" upstream
elif [ "$(git -C upstream describe --tags --exact-match 2>/dev/null || true)" != "$VERSION" ]; then
  git -C upstream fetch --quiet --depth 1 origin tag "$VERSION"
  git -C upstream checkout --quiet "$VERSION"
fi
(cd upstream && npm ci --no-audit --no-fund --silent)

WRANGLER="upstream/node_modules/.bin/wrangler"
case "${1:-deploy}" in
  deploy) "$WRANGLER" deploy --config wrangler.jsonc ;;
  migrate) "$WRANGLER" d1 migrations apply DB --remote --config wrangler.jsonc ;;
  google-setup) (cd upstream && TIMEZONE=Asia/Tokyo node scripts/google-setup.mjs --config ../wrangler.jsonc "${@:2}") ;;
  *) echo "usage: $0 [deploy|migrate|google-setup]" >&2; exit 1 ;;
esac
