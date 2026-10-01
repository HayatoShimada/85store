# 85-Store CMS（Payload）。85pi（Raspberry Pi 5・arm64）の上でビルドする
FROM node:22-bookworm-slim AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1
RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 --gid nodejs nextjs \
  && mkdir -p /data && chown nextjs:nodejs /data
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
# tailscale のサイドカーとネットワークを共有し、127.0.0.1 でだけ待ち受ける（外からは tailscale serve 経由でしか届かない）
ENV PORT=3000 HOSTNAME=127.0.0.1
CMD ["node", "server.js"]
