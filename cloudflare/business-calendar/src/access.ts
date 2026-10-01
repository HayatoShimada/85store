import { createRemoteJWKSet, jwtVerify } from "jose";

// Cloudflare Access が付ける JWT（Cf-Access-Jwt-Assertion）を検証し、管理者のメールアドレスを返す。
// Access の設定ミスや、Access を通らない経路からのリクエストに備えた二重チェック。

export interface AccessEnv {
  ACCESS_TEAM_DOMAIN: string;
  ACCESS_AUD: string;
  ADMIN_EMAILS: string;
  // テスト用: 公開鍵の取得先を差し替える（未設定なら Access の certs を使う）
  ACCESS_CERTS_URL?: string;
}

export class AccessError extends Error {
  constructor(message: string, readonly status: 401 | 403) {
    super(message);
  }
}

const jwksCache = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

function getJwks(url: string) {
  let jwks = jwksCache.get(url);
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(url));
    jwksCache.set(url, jwks);
  }
  return jwks;
}

export async function requireAdmin(request: Request, env: AccessEnv): Promise<string> {
  if (!env.ACCESS_TEAM_DOMAIN || !env.ACCESS_AUD) {
    throw new AccessError("Cloudflare Access is not configured", 401);
  }

  const token = request.headers.get("Cf-Access-Jwt-Assertion");
  if (!token) throw new AccessError("Missing Cloudflare Access token", 401);

  const issuer = `https://${env.ACCESS_TEAM_DOMAIN}`;
  const certsUrl = env.ACCESS_CERTS_URL || `${issuer}/cdn-cgi/access/certs`;

  let email: unknown;
  try {
    const { payload } = await jwtVerify(token, getJwks(certsUrl), { issuer, audience: env.ACCESS_AUD });
    email = payload.email;
  } catch {
    throw new AccessError("Invalid Cloudflare Access token", 401);
  }

  const allowed = env.ADMIN_EMAILS.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  if (typeof email !== "string" || !allowed.includes(email.toLowerCase())) {
    throw new AccessError("This account is not allowed", 403);
  }
  return email.toLowerCase();
}
