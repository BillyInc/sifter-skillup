const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve("dist-web");
const token = process.env.PROBE_TOKEN;
const deviceId = process.env.PROBE_DEVICE_ID || "browser-proof-local-20260923-b";
if (!token) throw new Error("PROBE_TOKEN is required");

const types = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".json": "application/json",
  ".png": "image/png",
};

http.createServer((req, res) => {
  if ((req.url || "").startsWith("/probe")) {
    res.setHeader("Content-Type", "text/html");
    res.end(
      `<!doctype html><script>localStorage.setItem("sifter_auth_token_v2",${JSON.stringify(token)});localStorage.setItem("sifter_device_id_v2",${JSON.stringify(deviceId)});location.replace("/explore/admission")</script>`,
    );
    return;
  }

  let filePath = path.join(root, decodeURIComponent((req.url || "/").split("?")[0]));
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(root, "index.html");
  }
  res.setHeader("Content-Type", types[path.extname(filePath)] || "application/octet-stream");
  fs.createReadStream(filePath)
    .on("error", () => {
      res.statusCode = 404;
      res.end("not found");
    })
    .pipe(res);
}).listen(4176, "127.0.0.1", () => console.log("probe server on http://127.0.0.1:4176"));
