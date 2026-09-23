/*
 * Isolated local browser-proof runner.
 *
 * This is deliberately a proof helper, not an application test harness. It
 * opens a fresh Chromium/Edge CDP target, restores only the supplied local
 * guest token/device id, visits the smallest student deep-link traversal and
 * the admin acceptance entry, then records URL/body evidence. It never writes
 * application data or changes Supabase state.
 */
const fs = require("node:fs");
const path = require("node:path");
const WebSocket = require("ws");

const port = Number(process.env.BROWSER_PROOF_CDP_PORT || 9225);
const origin = process.env.BROWSER_PROOF_ORIGIN || "http://127.0.0.1:5173";
const token = process.env.BROWSER_PROOF_TOKEN || "";
const deviceId = process.env.BROWSER_PROOF_DEVICE_ID || "browser-proof-local-20260923-route-a";
const outputPath = process.env.BROWSER_PROOF_OUTPUT || path.resolve(
  "data/career-mapping/_audit/BROWSER_PROOF_LOCAL_2026-09-23.json",
);
const screenshotDir = process.env.BROWSER_PROOF_SCREENSHOT_DIR || path.resolve(
  "data/career-mapping/_audit/browser-proof-local-2026-09-23",
);

if (!token) throw new Error("BROWSER_PROOF_TOKEN is required");

const studentRoutes = [
  {
    name: "student-programme",
    path: "/explore/programme/87c25d7f-86fb-5f4e-85f6-c0fd1fd4222e?jamb_programme_id=5a707142-93d5-5664-a491-ab3442f9ec81&user_type=senior_secondary&journey_mode=programme_to_role",
    expected: ["Sociology", "Programme"],
  },
  {
    name: "student-domain",
    path: "/explore/domain/D078?programme_id=87c25d7f-86fb-5f4e-85f6-c0fd1fd4222e&jamb_programme_id=5a707142-93d5-5664-a491-ab3442f9ec81&user_type=senior_secondary",
    expected: ["Social Sciences", "domain"],
  },
  {
    name: "student-subgroup",
    path: "/explore/domain/D078/subgroup/51e06080-d27d-5b46-a915-6f1beb29affd?programme_id=87c25d7f-86fb-5f4e-85f6-c0fd1fd4222e&jamb_programme_id=5a707142-93d5-5664-a491-ab3442f9ec81&user_type=senior_secondary",
    expected: ["Computational Social Science", "Social Sciences"],
  },
  {
    name: "student-role",
    path: "/explore/role/0eb839d7-26fb-576f-aea6-7662502c6e3e?programme_id=87c25d7f-86fb-5f4e-85f6-c0fd1fd4222e&jamb_programme_id=5a707142-93d5-5664-a491-ab3442f9ec81&user_type=senior_secondary",
    expected: ["Sociologist", "Social Sciences"],
  },
];

const adminRoutes = [
  {
    name: "admin-dashboard",
    path: "/dashboard",
    expected: ["dashboard", "Guide"],
  },
  {
    name: "admin-explore",
    path: "/workspace-explore",
    expected: ["programme", "domain"],
  },
];

let sequence = 0;
let socket;
const pending = new Map();

function cdp(method, params = {}) {
  const id = ++sequence;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
}

function connect(wsUrl) {
  return new Promise((resolve, reject) => {
    socket = new WebSocket(wsUrl);
    socket.on("open", resolve);
    socket.on("error", reject);
    socket.on("message", (raw) => {
      const message = JSON.parse(String(raw));
      if (!message.id) return;
      const waiter = pending.get(message.id);
      if (!waiter) return;
      pending.delete(message.id);
      if (message.error) waiter.reject(new Error(message.error.message));
      else waiter.resolve(message.result || {});
    });
  });
}

async function getTarget() {
  const response = await fetch(`http://127.0.0.1:${port}/json/list`);
  const targets = await response.json();
  const page = targets.find((target) => target.type === "page" && target.webSocketDebuggerUrl);
  if (!page) throw new Error(`No CDP page target found on port ${port}`);
  return page;
}

async function evaluate(expression, returnByValue = true) {
  const result = await cdp("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue,
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text || "Runtime.evaluate failed");
  }
  return result.result?.value;
}

async function waitForSettled(ms = 1200) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function visit(route, index) {
  await cdp("Page.navigate", { url: `${origin}${route.path}` });
  await waitForSettled(1800);
  const evidence = await evaluate(`({
    url: location.href,
    title: document.title,
    body: document.body ? document.body.innerText.slice(0, 12000) : "",
    readyState: document.readyState,
  })`);
  const lowerBody = String(evidence.body || "").toLowerCase();
  const expectedHits = route.expected.filter((needle) => lowerBody.includes(needle.toLowerCase()));
  const screenshot = await cdp("Page.captureScreenshot", { format: "png" });
  fs.mkdirSync(screenshotDir, { recursive: true });
  const screenshotPath = path.join(screenshotDir, `${String(index + 1).padStart(2, "0")}-${route.name}.png`);
  fs.writeFileSync(screenshotPath, Buffer.from(screenshot.data, "base64"));
  return {
    name: route.name,
    requestedPath: route.path,
    finalUrl: evidence.url,
    title: evidence.title,
    readyState: evidence.readyState,
    expected: route.expected,
    expectedHits,
    pass: expectedHits.length === route.expected.length && evidence.readyState === "complete",
    bodyPreview: String(evidence.body || "").replace(/\s+/g, " ").slice(0, 700),
    screenshotPath,
  };
}

async function main() {
  const target = await getTarget();
  await connect(target.webSocketDebuggerUrl);
  await cdp("Page.enable");
  await cdp("Runtime.enable");
  await cdp("Page.navigate", { url: `${origin}/` });
  await waitForSettled(1000);
  await evaluate(`localStorage.setItem("sifter_auth_token_v2", ${JSON.stringify(token)}); localStorage.setItem("sifter_device_id_v2", ${JSON.stringify(deviceId)}); true`);
  await cdp("Page.navigate", { url: `${origin}/explore/admission?mode=programme_and_university&discovery_entry=programme_and_university` });
  await waitForSettled(3000);

  const shell = await evaluate(`({url: location.href, title: document.title, body: document.body ? document.body.innerText.slice(0, 12000) : "", readyState: document.readyState})`);
  const student = [];
  for (let i = 0; i < studentRoutes.length; i += 1) student.push(await visit(studentRoutes[i], i));
  const admin = [];
  for (let i = 0; i < adminRoutes.length; i += 1) admin.push(await visit(adminRoutes[i], student.length + i));

  const report = {
    generatedAt: new Date().toISOString(),
    origin,
    cdpPort: port,
    shellRender: {
      finalUrl: shell.url,
      title: shell.title,
      readyState: shell.readyState,
      bodyPreview: String(shell.body || "").replace(/\s+/g, " ").slice(0, 1000),
      pass: shell.readyState === "complete" && String(shell.body || "").trim().length > 0,
    },
    studentTraversal: {
      routeCount: student.length,
      passCount: student.filter((row) => row.pass).length,
      pass: student.length === student.filter((row) => row.pass).length,
      routes: student,
    },
    adminAcceptance: {
      routeCount: admin.length,
      passCount: admin.filter((row) => row.pass).length,
      pass: admin.length === admin.filter((row) => row.pass).length,
      routes: admin,
      note: "A guest token is intentionally used for local proof; admin acceptance requires an authorized admin/institution account and cannot be claimed from a guest redirect.",
    },
    genuineRouteProof: student.every((row) => row.pass),
    genuineAdminProof: admin.every((row) => row.pass),
  };
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify({
    outputPath,
    shellRender: report.shellRender.pass,
    studentTraversal: `${report.studentTraversal.passCount}/${report.studentTraversal.routeCount}`,
    adminAcceptance: `${report.adminAcceptance.passCount}/${report.adminAcceptance.routeCount}`,
    genuineRouteProof: report.genuineRouteProof,
    genuineAdminProof: report.genuineAdminProof,
  }));
}

main().catch((error) => {
  console.error(error.stack || error.message || String(error));
  process.exitCode = 1;
}).finally(() => {
  if (socket) socket.close();
});
