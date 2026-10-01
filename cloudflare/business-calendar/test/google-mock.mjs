// テスト用: Google の OAuth トークンと Business Information API の代わり
import http from "node:http";
import fs from "node:fs";
const [, , logPath, mode = "ok"] = process.argv;
http.createServer(async (req, res) => {
  let body = "";
  for await (const chunk of req) body += chunk;
  if (req.url === "/token") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ access_token: "test-access-token", expires_in: 3600 }));
  }
  fs.appendFileSync(logPath, JSON.stringify({ method: req.method, url: req.url, auth: req.headers.authorization, body: JSON.parse(body || "{}") }) + "\n");
  if (fs.existsSync(logPath + ".fail")) {
    res.writeHead(400, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: { message: "Request contains an invalid argument." } }));
  }
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end("{}");
}).listen(9998, "127.0.0.1", () => console.log("google mock ready", mode));
