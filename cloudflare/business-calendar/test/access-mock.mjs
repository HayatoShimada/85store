// テスト用: Cloudflare Access の代わりに JWT を発行する鍵と JWKS を用意する
import { generateKeyPair, exportJWK, SignJWT } from "jose";
import http from "node:http";
import fs from "node:fs";

const { publicKey, privateKey } = await generateKeyPair("RS256");
const jwk = { ...(await exportJWK(publicKey)), kid: "test", alg: "RS256", use: "sig" };
http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ keys: [jwk] }));
}).listen(9999, "127.0.0.1");

const sign = (email, aud = "test-aud") =>
  new SignJWT({ email }).setProtectedHeader({ alg: "RS256", kid: "test" }).setIssuer("https://test.example")
    .setAudience(aud).setIssuedAt().setExpirationTime("10m").sign(privateKey);

fs.writeFileSync(process.argv[2], JSON.stringify({
  admin: await sign("info@85-store.com"),
  other: await sign("someone@example.com"),
  wrongAud: await sign("info@85-store.com", "other-aud"),
}));
console.log("jwks ready");
