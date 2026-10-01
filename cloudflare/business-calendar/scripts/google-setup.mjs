#!/usr/bin/env node
// Googleマップ（ビジネスプロフィール）連携のセットアップ。Business Profile API の利用承認後に一度だけ実行する。
//
//   GOOGLE_CLIENT_ID=... GOOGLE_CLIENT_SECRET=... node scripts/google-setup.mjs [--import]
//
// 1. ブラウザで Google にログインして、ビジネスプロフィールの管理を許可する（OAuth）
// 2. 店舗（ロケーション）を選ぶ
// 3. Client ID / Secret / リフレッシュトークン / ロケーションID を Worker の secret に登録する（画面には表示しない）
// 4. --import を付けると、Googleマップに今ある「今日以降の特別営業時間」を D1 に取り込む（管理画面で設定済みの日は上書きしない）

import http from "node:http";
import { spawn } from "node:child_process";
import { createInterface } from "node:readline/promises";
import { writeFileSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const SCOPE = "https://www.googleapis.com/auth/business.manage";
const DB_NAME = "85store-business-calendar";
const PORT = 53682;
const REDIRECT_URI = `http://127.0.0.1:${PORT}/callback`;

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
if (!clientId || !clientSecret) {
  console.error("GOOGLE_CLIENT_ID と GOOGLE_CLIENT_SECRET を環境変数で指定してください（Google Cloud の「デスクトップ アプリ」の OAuth クライアント）");
  process.exit(1);
}

function run(cmd, args, input) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: [input === undefined ? "inherit" : "pipe", "inherit", "inherit"] });
    if (input !== undefined) child.stdin.end(input);
    child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} ${args.join(" ")} が失敗しました（${code}）`))));
  });
}

async function getJson(url, token) {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const body = await res.json();
  if (!res.ok) throw new Error(`${url}: ${res.status} ${JSON.stringify(body).slice(0, 300)}`);
  return body;
}

// 1. OAuth（ループバックで認可コードを受け取る）
async function authorize() {
  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.search = new URLSearchParams({
    client_id: clientId,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: SCOPE,
    access_type: "offline",
    prompt: "consent",
  }).toString();

  const code = await new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url, REDIRECT_URI);
      if (url.pathname !== "/callback") return res.end();
      const code = url.searchParams.get("code");
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(code ? "許可を受け取りました。このタブは閉じてかまいません。" : "許可されませんでした。");
      server.close();
      code ? resolve(code) : reject(new Error(url.searchParams.get("error") || "認可コードがありません"));
    });
    server.listen(PORT, "127.0.0.1", () => {
      console.log("\n次の URL をブラウザで開き、info@85-store.com でログインして許可してください:\n");
      console.log(authUrl.toString(), "\n");
    });
  });

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: REDIRECT_URI, grant_type: "authorization_code" }),
  });
  const tokens = await res.json();
  if (!res.ok || !tokens.refresh_token) throw new Error(`トークンを取得できませんでした: ${JSON.stringify(tokens).slice(0, 300)}`);
  return tokens;
}

// 2. 店舗を選ぶ
async function chooseLocation(accessToken) {
  const { accounts = [] } = await getJson("https://mybusinessaccountmanagement.googleapis.com/v1/accounts", accessToken);
  const locations = [];
  for (const account of accounts) {
    const { locations: list = [] } = await getJson(
      `https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations?readMask=name,title,storefrontAddress&pageSize=100`,
      accessToken
    );
    locations.push(...list);
  }
  if (locations.length === 0) throw new Error("管理しているビジネスプロフィールが見つかりません");

  locations.forEach((loc, i) => console.log(`  [${i + 1}] ${loc.title}（${loc.name}）`));
  let index = 0;
  if (locations.length > 1) {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    index = Number(await rl.question("連携する店舗の番号: ")) - 1;
    rl.close();
  }
  const location = locations[index];
  if (!location) throw new Error("番号が正しくありません");
  console.log(`店舗: ${location.title}`);
  return location;
}

// 4. Googleマップの今日以降の特別営業時間を D1 に取り込む
async function importSpecialHours(accessToken, locationName) {
  const loc = await getJson(`https://mybusinessbusinessinformation.googleapis.com/v1/${locationName}?readMask=specialHours`, accessToken);
  const today = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
  const pad = (n) => String(n).padStart(2, "0");
  const ymd = (d) => `${d.year}-${pad(d.month)}-${pad(d.day)}`;
  const hm = (t = {}) => `${pad(t.hours ?? 0)}:${pad(t.minutes ?? 0)}`;
  const q = (v) => (v === null ? "NULL" : `'${String(v).replaceAll("'", "''")}'`);

  const rows = (loc.specialHours?.specialHourPeriods ?? [])
    .filter((p) => ymd(p.startDate) >= today)
    .map((p) =>
      p.closed
        ? [ymd(p.startDate), "closed", null, null]
        : [ymd(p.startDate), "hours", hm(p.openTime), hm(p.closeTime)]
    );
  if (rows.length === 0) {
    console.log("取り込む特別営業時間はありません");
    return;
  }
  const values = rows
    .map(([date, kind, opens, closes]) => `(${q(date)}, ${q(kind)}, ${q(opens)}, ${q(closes)}, NULL, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), 'google-import')`)
    .join(",\n  ");
  const file = join(tmpdir(), `gbp-import-${Date.now()}.sql`);
  writeFileSync(file, `INSERT OR IGNORE INTO days (date, kind, opens, closes, note, updated_at, updated_by) VALUES\n  ${values};\n`);
  try {
    await run("npx", ["wrangler", "d1", "execute", DB_NAME, "--remote", "--file", file]);
    console.log(`特別営業時間を ${rows.length} 件取り込みました（管理画面で設定済みの日はそのまま）`);
  } finally {
    unlinkSync(file);
  }
}

const tokens = await authorize();
const location = await chooseLocation(tokens.access_token);
const locationId = location.name.replace(/^locations\//, "");

if (process.argv.includes("--import")) await importSpecialHours(tokens.access_token, location.name);

// 3. Worker の secret に登録（値は表示しない）
for (const [name, value] of [
  ["GOOGLE_CLIENT_ID", clientId],
  ["GOOGLE_CLIENT_SECRET", clientSecret],
  ["GOOGLE_REFRESH_TOKEN", tokens.refresh_token],
  ["GOOGLE_LOCATION_ID", locationId],
]) {
  await run("npx", ["wrangler", "secret", "put", name], value);
}
console.log("\n完了しました。管理画面を開き、「Googleマップ」の欄が「反映済み」になることを確認してください。");
