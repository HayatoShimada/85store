#!/usr/bin/env bash
# CMS を 85pi に配置して起動する（手元の PC で arm64 向けにビルドし、イメージを送る）
#   ./deploy.sh            ビルドして送り、docker compose up -d
#   ./deploy.sh logs       ログを見る
#   ./deploy.sh push-db    ローカルの data/payload.db を 85pi に送る（初回の移行だけ。CMS を止めて上書きする）
set -euo pipefail
cd "$(dirname "$0")"
HOST="${CMS_HOST:-hacopi@85pi.taila713c8.ts.net}"
DIR="${CMS_DIR:-85store-cms}"

case "${1:-deploy}" in
  deploy)
    # 1. 手元の PC で arm64 向けにビルドする（85pi でビルドすると、ほかのサービスと合わせてメモリが足りなくなる）
    #    初回だけ: docker run --privileged --rm tonistiigi/binfmt --install arm64
    docker buildx build --platform linux/arm64 -t 85store-cms-payload:latest --load .
    # 2. 設定ファイルを送る（ソースは送らない）
    rsync -az docker-compose.yml litestream.yml tailscale "$HOST:$DIR/"
    # 3. イメージを送って入れ替える
    docker save 85store-cms-payload:latest | gzip | ssh "$HOST" 'gunzip | docker load'
    ssh "$HOST" "cd $DIR && test -f .env || { echo '.env がありません（.env.example を参照）'; exit 1; }; docker compose up -d --no-build && docker compose ps"
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
