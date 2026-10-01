#!/usr/bin/env bash
# CMS を 85pi に配置して起動する（85pi の上でビルドする）
#   ./deploy.sh            ソースを送って docker compose up -d --build
#   ./deploy.sh logs       ログを見る
#   ./deploy.sh push-db    ローカルの data/payload.db を 85pi に送る（初回の移行だけ。CMS を止めて上書きする）
set -euo pipefail
cd "$(dirname "$0")"
HOST="${CMS_HOST:-hacopi@85pi}"
DIR="${CMS_DIR:-85store-cms}"

case "${1:-deploy}" in
  deploy)
    rsync -az --delete \
      --exclude node_modules --exclude .next --exclude data --exclude media --exclude .local-bucket \
      --exclude .env --exclude '*.tsbuildinfo' \
      ./ "$HOST:$DIR/"
    ssh "$HOST" "cd $DIR && test -f .env || { echo '.env がありません（.env.example を参照）'; exit 1; }; docker compose up -d --build && docker compose ps"
    ;;
  logs)
    ssh "$HOST" "cd $DIR && docker compose logs --tail 100 -f payload"
    ;;
  push-db)
    read -r -p "85pi の CMS を止めて DB を上書きします。よろしいですか？ [y/N] " answer
    [ "$answer" = y ] || exit 1
    scp data/payload.db "$HOST:$DIR/payload.db.upload"
    ssh "$HOST" "cd $DIR && docker compose stop payload litestream && \
      docker compose run --rm --no-deps -v \$PWD/payload.db.upload:/upload.db:ro --entrypoint sh payload -c 'cp /upload.db /data/payload.db && rm -f /data/payload.db-wal /data/payload.db-shm' && \
      rm payload.db.upload && docker compose up -d"
    ;;
  *)
    echo "usage: $0 [deploy|logs|push-db]" >&2
    exit 1
    ;;
esac
