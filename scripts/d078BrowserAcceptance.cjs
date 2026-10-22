/*
 * Rendered D078 browser acceptance using the installed Edge binary and the
 * workspace's existing `ws` dependency. Browser state is isolated in a fresh
 * temporary profile. API responses are intercepted and derived from the
 * checked-in D078 graph plus the reviewed Sociology curriculum source contract;
 * no user account or backend/database state is created or modified.
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawn } = require("node:child_process");
const WebSocket = require("ws");

const root = path.resolve(__dirname, "..");
const graph = require(path.join(root, "src/data/d078MethodAwareUiData.json"));
const curriculum = require(path.join(root, "data/career-mapping/_audit/sociology_curriculum_contract_2026-09-17.json"));
const origin = process.env.D078_ACCEPTANCE_ORIGIN || "http://127.0.0.1:5174";
const apiOrigin = "http://127.0.0.1:8000";
const outputDir = path.resolve(root, process.env.D078_ACCEPTANCE_OUTPUT || "artifacts/d078-browser-acceptance");
const programmeId = "87c25d7f-86fb-5f4e-85f6-c0fd1fd4222e";
const jambProgrammeId = "5a707142-93d5-5664-a491-ab3442f9ec81";
const edgePath = process.env.D078_ACCEPTANCE_EDGE
  || "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

if (!fs.existsSync(edgePath)) throw new Error(`Edge executable not found: ${edgePath}`);
if (!fs.existsSync(path.join(root, "node_modules/ws"))) throw new Error("The existing `ws` dependency is unavailable.");

const graphNodes = graph.nodes_by_id;
const areaNodes = Object.values(graphNodes).filter((node) => node.kind === "area_of_specialization");
const roleNodes = Object.values(graphNodes).filter((node) => node.kind === "role");
const slug = (value) => String(value).trim().toLocaleLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const roleKeyById = new Map(roleNodes.map((node) => [node.id, `D078|${slug(node.label)}`]));
const roleByKey = new Map(roleNodes.map((node) => [roleKeyById.get(node.id), node]));
const areaIdByNodeId = new Map(areaNodes.map((node) => [node.id, node.area_id]));

function courseTitleMap() {
  return new Map(curriculum.programme.courses.map((course) => [course.code.toLocaleLowerCase(), course.title]));
}

function makeCurriculumThemes() {
  const titles = courseTitleMap();
  return Object.values(graphNodes).filter((node) => node.kind === "programme_theme").map((theme) => ({
    themeKey: theme.id.split(":").at(-1),
    title: theme.label,
    summary: theme.description || "",
    narration: theme.narration || theme.description || "",
    connectionExplanation: "This theme is part of the reviewed Sociology programme context.",
    directTransferEvidenceStatus: graph.programme_transition.evidence_matched_theme_ids.includes(theme.id)
      ? "matched" : "no_exact_match_in_current_transfer_record",
    matchedCourseCodes: [],
    matchedOutcomeIds: [],
    courseAnchors: [],
    matchedCourseAnchors: [],
    programmeOutcomes: [],
    transferableEvidence: [],
    source: {
      title: curriculum.sourceAuthority.originalPdf,
      publisher: "National Universities Commission",
      jurisdiction: "Nigeria",
    },
    _courseTitleMap: titles,
  })).map(({ _courseTitleMap, ...theme }) => theme);
}

const programmeThemes = makeCurriculumThemes();
const programmeOutcomes = (curriculum.curriculumOutcomes?.rows || []).filter((row) => row.studentDisplay !== false && row.dataState === "source_backed");
const matchedOutcomeIds = new Set(graph.programme_transition.matched_transfer_outcome_ids || []);
const themesByKey = new Map(programmeThemes.map((theme) => [theme.themeKey, theme]));
const themeIdByOutcome = new Map();
// Outcome/theme grouping is retained in the source contract's explicit
// downstream map when available. Graph route edges provide only the matched
// IDs, so unmatched course outcomes remain in course context without being
// assigned to an invented theme here.
for (const outcome of programmeOutcomes) {
  const graphId = `programme-outcome:sociology:${outcome.outcomeId}`;
  if (!matchedOutcomeIds.has(graphId)) continue;
  const matchingTheme = [...themesByKey.values()].find((theme) => {
    const anchors = theme.courseAnchors || [];
    return anchors.some((anchor) => String(anchor.courseCode).toLowerCase() === String(outcome.courseCode).toLowerCase());
  });
  if (matchingTheme) themeIdByOutcome.set(graphId, matchingTheme.themeKey);
}

const sociologyThemeKeys = new Set(programmeThemes.map((theme) => theme.themeKey));
const directTransferThemes = graph.programme_transition.evidence_matched_theme_ids
  .map((id) => id.split(":").at(-1)).filter((key) => sociologyThemeKeys.has(key));

function connectionFor(domainName = "Social Sciences") {
  return {
    programmeId,
    programmeName: "Sociology",
    relationship: "direct",
    explanation: "Your Sociology studies connect to this field through reviewed course and outcome evidence.",
    curriculumContextHeading: "What you study in Sociology",
    domainAddsHeading: "What this field adds",
    domainAddsExplanation: "The foundations and selected approaches on this path explain what to learn next.",
    transferableLearningNarrative: graph.programme_transition.transferable_learning_summary || graph.programme_transition.transfer_summary,
    curriculumAvailable: true,
    curriculumCourseCount: curriculum.programme.courseCount,
    courseAnchorQuality: "reviewed",
    courseAnchors: [],
    curriculumOutcomes: [],
    programmeCurriculumThemes: programmeThemes.map((theme) => ({
      ...theme,
      directTransferEvidenceStatus: directTransferThemes.includes(theme.themeKey)
        ? "matched" : "no_exact_match_in_current_transfer_record",
      matchedOutcomeIds: programmeOutcomes
        .filter((outcome) => themeIdByOutcome.get(`programme-outcome:sociology:${outcome.outcomeId}`) === theme.themeKey)
        .map((outcome) => `programme-outcome:sociology:${outcome.outcomeId}`),
      programmeOutcomes: programmeOutcomes
        .filter((outcome) => themeIdByOutcome.get(`programme-outcome:sociology:${outcome.outcomeId}`) === theme.themeKey)
        .map((outcome) => ({
          outcomeId: `programme-outcome:sociology:${outcome.outcomeId}`,
          courseCode: outcome.courseCode,
          courseTitle: outcome.sourceLocator?.courseTitle || null,
          studentText: outcome.studentText,
          sourceLocator: outcome.sourceLocator,
        })),
    })),
    transferableEvidence: [],
    mappingSource: "Local browser acceptance fixture from checked-in reviewed contract",
    sourceReviewRequired: false,
    reviewRequired: false,
    _domainName: domainName,
  };
}

function resourceType(node) {
  if (String(node.item_type || "").toLowerCase().includes("tool") || node.kind.includes("tool")) return "tool_learning";
  if (node.item_type === "certification") return "certification_exam";
  if (node.item_type === "competency") return "competency_reference";
  return "skill_learning";
}

function resourceRows(owner, nodeIds) {
  const rows = [];
  for (const id of new Set(nodeIds)) {
    const node = graphNodes[id];
    if (!node) continue;
    for (const entry of [...(node.learning_links || []), ...(node.resources || [])]) {
      if (!entry.url) continue;
      rows.push({
        id: `acceptance:${id}:${rows.length + 1}`,
        domainId: "D078",
        ownershipScope: owner,
        reviewStatus: "approved_guidance_v1",
        resourceType: resourceType(node),
        targetName: node.label,
        provider: entry.publisher || entry.label || "Official provider or public-sector source",
        region: "global",
        accessType: "free",
        url: entry.url,
        sourceUrl: entry.url,
        sourceConfidence: "source_backed",
        dataState: "source_backed",
        description: entry.description || "",
      });
    }
  }
  return rows;
}

function routeRowsForArea(areaId) {
  const methodRows = graph.method_area_role_routes.filter((row) => row.area_id === areaId);
  const comboRows = graph.combination_area_role_routes.filter((row) => row.area_id === areaId);
  const roleIds = [...new Set([...methodRows, ...comboRows].map((row) => row.role_id))];
  return roleIds.map((roleId) => {
    const role = graphNodes[roleId];
    return role ? {
      key: roleKeyById.get(roleId),
      name: role.label,
      areaIds: [areaId],
      areaRouteStatus: "reviewed_supported",
    } : null;
  }).filter(Boolean);
}

function makeDomain() {
  const areaRows = areaNodes.map((area) => ({
    // The runtime detail route resolves `subgroups[].id` against the canonical
    // D078 area_id (not the graph's `area:` node id).
    id: area.area_id,
    name: area.label,
    isCurrentAreaOfSpecialization: true,
    areaRoutes: [{ areaId: area.area_id, status: "reviewed_supported" }],
    areaRoleOptions: routeRowsForArea(area.area_id),
    clusterSkills: [],
    tools: { common: [], distinctive: [] },
    certifications: [],
    resources: resourceRows("subgroup", Object.values(graph.method_area_routes)
      .filter((route) => route.area_id === area.area_id)
      .flatMap((route) => [...route.area_item_ids, ...route.available_item_ids, ...route.tool_ids, ...route.domain_tool_ids])),
  }));
  const roles = roleNodes.map((role) => ({
    key: roleKeyById.get(role.id),
    name: role.label,
    areaIds: [...new Set([
      ...graph.method_area_role_routes.filter((row) => row.role_id === role.id).map((row) => row.area_id),
      ...graph.combination_area_role_routes.filter((row) => row.role_id === role.id).map((row) => row.area_id),
    ])],
  }));
  const routeItems = graph.method_area_routes.flatMap((route) => [
    ...route.domain_downstream_item_ids,
    ...route.domain_tool_ids,
    ...route.tool_ids,
  ]);
  const domainResourceRows = resourceRows("domain", routeItems);
  const connection = connectionFor();
  return {
    id: "D078",
    name: "Social Sciences",
    cluster: "Social Sciences",
    clusters: ["Social Sciences"],
    description: graph.programme_transition.domain_overview,
    studentOrientation: {
      whatItStudies: graph.programme_transition.domain_overview,
      whatPeopleDo: "People in this field study social questions using evidence and methods that fit the question.",
      questions: [],
      whereProgrammeFits: "Sociology is the programme context for this local acceptance route.",
    },
    institutionType: ["university"],
    eliteDomain: false,
    foundationSkills: [],
    tools: { common: [], distinctive: [] },
    gatewayCertifications: [],
    roleHintCertifications: [],
    roleCount: roles.length,
    subgroups: areaRows,
    roles,
    resources: domainResourceRows,
    contextItems: [],
    programmeMatchType: "direct",
    programmeConnection: connection,
  };
}

const domain = makeDomain();
const saved = {
  // Canonical programme/domain plus named university context for the rendered
  // student fixture. This remains isolated test data; no account is created.
  path: {
    programme: { id: programmeId, name: "Sociology" },
    university: { id: "26ce26b0-5eac-5286-b8b5-179e56a6b320", name: "University of Lagos" },
    domains: [{ id: "D078", name: "Social Sciences" }],
  },
};
let savedWriteBody;
const programme = {
  id: programmeId,
  name: "Sociology",
  studentName: "Sociology",
  studentNames: ["Sociology"],
  institutionType: "university",
  discipline: "Social Sciences",
  qualification: "B.Sc",
  durationYears: curriculum.programme.durationYears,
  overview: "A source-backed Sociology programme preview for local browser acceptance.",
  curriculumContract: { status: "available", outcomes: [], abilities: [], programmeThemes: [] },
  resources: [],
  domains: [{
    domainId: "D078",
    domainName: "Social Sciences",
    domainDescription: graph.programme_transition.domain_overview,
    matchType: "direct",
    explanation: "Sociology has a reviewed course connection to Social Sciences.",
    courseAnchors: [],
    transferableEvidence: [],
  }],
};

function responseFor(request) {
  const url = new URL(request.url);
  const method = request.method.toUpperCase();
  const ok = (data) => ({ status: 200, json: { success: true, data } });
  const okState = (data) => ok({ status: "real", data });
  if (method === "OPTIONS") return { status: 204, body: "" };
  if (url.pathname === "/api/users/me" && method === "GET") return ok({
    id: "local-acceptance-student",
    name: "Amina Okafor",
    full_name: "Amina Okafor",
    username: "amina.okafor",
    email: "amina.okafor@example.test",
    auth_provider: "test_mock",
    account_type: "student",
    onboarding_completed: true,
  });
  if (url.pathname === "/api/student/starting-point" && method === "GET") return okState(null);
  if (url.pathname === "/api/career/saved" && method === "GET") return okState([]);
  if (url.pathname === `/api/career/programmes/${programmeId}` && method === "GET") return okState(programme);
  if (url.pathname === "/api/career/programmes" && method === "GET") return okState([]);
  if (url.pathname.includes("jamb-programmes") && method === "GET") return okState([]);
  if (url.pathname === "/api/career/domains/D078" && method === "GET") return okState(domain);
  if (url.pathname.startsWith("/api/career/roles/") && method === "GET") {
    const key = decodeURIComponent(url.pathname.split("/").at(-1));
    const role = roleByKey.get(key);
    if (!role) return { status: 404, json: { success: false, detail: "Role not in the local acceptance fixture." } };
    return okState({
      key,
      name: role.label,
      appearsIn: [{ domainId: "D078", domainName: "Social Sciences" }],
      essentialSkills: [],
      optionalSkills: [],
      tools: [],
      certifications: [],
      resources: [],
    });
  }
  if (url.pathname === "/api/student/guidance-path" && method === "GET") return okState(saved.path ? { path: saved.path } : null);
  if (url.pathname === "/api/student/guidance-path" && method === "PUT") {
    let parsed = {};
    try { parsed = JSON.parse(request.postData || "{}"); } catch {}
    savedWriteBody = parsed;
    saved.path = parsed.path || {};
    fs.writeFileSync(path.join(outputDir, "saved-guidance-path-fixture.json"), `${JSON.stringify(saved.path, null, 2)}\n`);
    return okState({ path: saved.path, source: "explore" });
  }
  return { status: 404, json: { success: false, detail: "Unmocked local acceptance API endpoint", path: url.pathname } };
}

let sequence = 0;
let socket;
const pending = new Map();
let browser;
let browserStderr = "";
let browserExit = null;
let apiHits = [];
let apiFulfillments = [];
let browserDiagnostics = [];
const checklist = [];
const screenshotsCaptured = [];
const cdp = (method, params = {}, timeoutMs = 10000) => new Promise((resolve, reject) => {
  const id = ++sequence;
  const timeout = setTimeout(() => {
    pending.delete(id);
    reject(new Error(`Timed out waiting for CDP response to ${method}.`));
  }, timeoutMs);
  pending.set(id, {
    resolve: (result) => { clearTimeout(timeout); resolve(result); },
    reject: (error) => { clearTimeout(timeout); reject(error); },
  });
  socket.send(JSON.stringify({ id, method, params }));
});
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function fetchJsonWithTimeout(url, timeoutMs = 800) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await (await fetch(url, { signal: controller.signal })).json();
  } finally {
    clearTimeout(timeout);
  }
}
const b64 = (value) => Buffer.from(value).toString("base64");

function connect(wsUrl) {
  return new Promise((resolve, reject) => {
    socket = new WebSocket(wsUrl);
    socket.on("open", resolve);
    socket.on("error", reject);
    socket.on("close", (code, reason) => {
      const error = new Error(`CDP WebSocket closed (${code}): ${String(reason || "")}`);
      for (const waiter of pending.values()) waiter.reject(error);
      pending.clear();
    });
    socket.on("message", async (raw) => {
      const message = JSON.parse(String(raw));
      if (message.id) {
        const waiter = pending.get(message.id);
        if (!waiter) return;
        pending.delete(message.id);
        if (message.error) waiter.reject(new Error(message.error.message));
        else waiter.resolve(message.result || {});
        return;
      }
      if (message.method === "Fetch.requestPaused") {
        const { requestId, request } = message.params;
        const url = new URL(request.url);
        if (url.origin !== apiOrigin) {
          await cdp("Fetch.continueRequest", { requestId });
          return;
        }
        apiHits.push({ method: request.method, path: url.pathname });
        const response = responseFor(request);
        const headers = [
          { name: "Content-Type", value: "application/json; charset=utf-8" },
          { name: "Access-Control-Allow-Origin", value: origin },
          { name: "Access-Control-Allow-Credentials", value: "true" },
          { name: "Access-Control-Allow-Methods", value: "GET, POST, PUT, DELETE, OPTIONS" },
          { name: "Access-Control-Allow-Headers", value: "Authorization, Content-Type, X-Device-Id" },
          { name: "Cache-Control", value: "no-store" },
        ];
        try {
          await cdp("Fetch.fulfillRequest", {
            requestId,
            responseCode: response.status,
            responseHeaders: headers,
            body: b64(response.body ?? JSON.stringify(response.json)),
          });
          apiFulfillments.push({ method: request.method, path: url.pathname, status: response.status, ok: true });
        } catch (error) {
          apiFulfillments.push({ method: request.method, path: url.pathname, status: response.status, ok: false, error: String(error) });
        }
      } else if (message.method === "Runtime.exceptionThrown") {
        const details = message.params.exceptionDetails;
        browserDiagnostics.push({
          type: "runtime_exception",
          details: details?.exception?.description || details?.text || "Unknown runtime exception",
          url: details?.url || null,
          lineNumber: details?.lineNumber ?? null,
          columnNumber: details?.columnNumber ?? null,
        });
      } else if (message.method === "Log.entryAdded") {
        const entry = message.params.entry;
        if (entry.level === "error" || entry.level === "warning") browserDiagnostics.push({ type: `console_${entry.level}`, text: entry.text });
      } else if (message.method === "Network.loadingFailed") {
        browserDiagnostics.push({ type: "network_loading_failed", errorText: message.params.errorText, blockedReason: message.params.blockedReason || null });
      }
    });
  });
}

async function evaluate(expression) {
  // The rendered D078 route contains a large graph-backed tree; on Windows
  // Edge, evaluating body text during a transition can exceed the generic
  // 10-second CDP default even though the page continues rendering.
  const result = await cdp("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true }, 30000);
  if (result.exceptionDetails) {
    const details = result.exceptionDetails;
    const description = details.exception?.description || details.exception?.value || details.text || "Browser evaluation failed";
    throw new Error(`${description}${details.lineNumber != null ? ` (line ${details.lineNumber + 1})` : ""}`);
  }
  return result.result?.value;
}

async function waitFor(predicate, label, timeoutMs = 10000) {
  const start = Date.now();
  let last;
  while (Date.now() - start < timeoutMs) {
    last = await evaluate(`(${predicate})()`);
    if (last) return last;
    await wait(100);
  }
  throw new Error(`Timed out waiting for ${label}; last value=${JSON.stringify(last)}`);
}

async function waitForNode(predicate, label, timeoutMs = 10000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const value = predicate();
    if (value) return value;
    await wait(100);
  }
  throw new Error(`Timed out waiting for ${label}; mock state=${JSON.stringify(savedWriteBody || saved)}`);
}

async function bodyText() { return evaluate("document.body?.innerText || ''"); }
async function assertContains(text, label = text) {
  const body = await bodyText();
  if (!body.includes(text)) throw new Error(`${label} missing from rendered body`);
  return body;
}
async function assertNotContains(text, label = text) {
  const body = await bodyText();
  if (body.includes(text)) throw new Error(`${label} unexpectedly visible in rendered body`);
  return body;
}
async function assertButtonAvailable(accessibleLabel) {
  const label = JSON.stringify(accessibleLabel);
  const found = await evaluate(`(() => [...document.querySelectorAll('button,[role="button"]')].some((node) => node.getAttribute('aria-label') === ${label}))()`);
  if (!found) throw new Error(`Accessible action not found: ${accessibleLabel}`);
}
async function assertButtonUnavailable(accessibleLabel) {
  const label = JSON.stringify(accessibleLabel);
  const found = await evaluate(`(() => [...document.querySelectorAll('button,[role="button"]')].some((node) => node.getAttribute('aria-label') === ${label}))()`);
  if (found) throw new Error(`Unsupported accessible action is visible: ${accessibleLabel}`);
}
async function waitForButton(accessibleLabel, timeoutMs = 18000) {
  const label = JSON.stringify(accessibleLabel);
  return waitFor(`() => [...document.querySelectorAll('button,[role="button"]')].some((node) => node.getAttribute('aria-label') === ${label})`, `button ${accessibleLabel}`, timeoutMs);
}
async function closeSearchOverlayIfOpen() {
  const exists = await evaluate(`(() => [...document.querySelectorAll('button,[role="button"]')].some((node) => node.getAttribute('aria-label') === "Close search" || node.innerText.trim() === "Close search"))()`);
  if (exists) await clickButton("Close search");
}

async function clickButton(accessibleLabel) {
  const label = JSON.stringify(accessibleLabel);
  const found = await evaluate(`(() => {
    const wanted = ${label};
    const buttons = [...document.querySelectorAll('button,[role="button"]')];
    const button = buttons.find((node) => node.getAttribute('aria-label') === wanted)
      || buttons.find((node) => (node.getAttribute('aria-label') || '').includes(wanted))
      || buttons.find((node) => node.innerText.trim() === wanted);
    if (!button) return null;
    button.click();
    return {text: button.innerText.trim(), aria: button.getAttribute('aria-label')};
  })()`);
  if (!found) throw new Error(`Rendered button not found: ${accessibleLabel}`);
  await wait(100);
  return found;
}

async function clickText(text) {
  return clickButton(text);
}

async function waitForRenderedText(text, timeoutMs = 18000) {
  const quoted = JSON.stringify(text);
  return waitFor(`() => (document.body?.innerText || '').includes(${quoted})`, `rendered text ${text}`, timeoutMs);
}

async function screenshot(name) {
  const result = await cdp("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, fromSurface: true }, 30000);
  const filename = `${name}.png`;
  fs.writeFileSync(path.join(outputDir, filename), Buffer.from(result.data, "base64"));
  if (!screenshotsCaptured.includes(filename)) screenshotsCaptured.push(filename);
}

async function navigate(url) {
  await cdp("Page.navigate", { url });
  await waitFor("() => !!document.body && document.readyState !== 'loading'", "document interactive", 15000);
  await waitFor("() => !document.body?.innerText?.includes('Opening sign in') && !document.body?.innerText?.includes('Loading domain details')", "route settled", 15000).catch(() => undefined);
  await wait(350);
}

async function areaLabels() {
  return evaluate(`(() => {
    const names = [${areaNodes.map((area) => JSON.stringify(area.label)).join(",")}];
    return names.filter((name) => (document.body?.innerText || '').includes(name));
  })()`);
}

async function assertAreaSet(expected, unexpected = []) {
  const labels = await areaLabels();
  const wantedPresent = expected.every((label) => labels.includes(label));
  const unwantedAbsent = unexpected.every((label) => !labels.includes(label));
  if (!wantedPresent || !unwantedAbsent || labels.length !== expected.length) {
    throw new Error(`Area set mismatch. Expected exact [${expected.join(" | ")}], saw [${labels.join(" | ")}], unexpected allowed-list [${unexpected.join(" | ")}]`);
  }
}

async function clickMethod(label, selected = false) {
  const accessibility = `${selected ? "Deselect" : "Select"} ${label}`;
  await clickButton(accessibility);
}

async function buttonDimensions(accessibleLabel) {
  return evaluate(`(() => {
    const wanted = ${JSON.stringify(accessibleLabel)};
    const nodes = [...document.querySelectorAll('button,[role="button"]')];
    const node = nodes.find((entry) => entry.getAttribute('aria-label') === wanted)
      || nodes.find((entry) => entry.innerText.trim() === wanted);
    if (!node) return null;
    const box = node.getBoundingClientRect();
    return {width: box.width, height: box.height, tag: node.tagName, tabIndex: node.tabIndex, aria: node.getAttribute('aria-label')};
  })()`);
}

async function checkKeyboardFocus(accessibleLabel) {
  const label = JSON.stringify(accessibleLabel);
  const index = await evaluate(`(() => {
    const nodes=[...document.querySelectorAll('button,[role="button"]')];
    return nodes.findIndex((node)=>node.getAttribute('aria-label')===${label});
  })()`);
  if (index < 0) throw new Error(`Keyboard target absent: ${accessibleLabel}`);
  await evaluate("document.activeElement && document.activeElement.blur(); document.body.focus(); true");
  const maxTabs = Math.min(40, Math.max(12, index + 4));
  for (let i = 0; i < maxTabs; i += 1) {
    await cdp("Input.dispatchKeyEvent", { type: "keyDown", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
    await cdp("Input.dispatchKeyEvent", { type: "keyUp", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
    const active = await evaluate(`(() => ({label:document.activeElement?.getAttribute('aria-label'), text:document.activeElement?.innerText?.trim(), tag:document.activeElement?.tagName, visible:!!(document.activeElement?.getBoundingClientRect().width)}))()`);
    if (active.label === accessibleLabel) return active;
  }
  // At minimum, verify that the target is in the native tab order and can
  // receive keyboard focus directly; log this as direct-focus evidence.
  const direct = await evaluate(`(() => { const n=[...document.querySelectorAll('button,[role="button"]')].find((node)=>node.getAttribute('aria-label')===${label}); if(!n||n.tabIndex<0)return null;n.focus();return {label:n.getAttribute('aria-label'),tag:n.tagName,tabIndex:n.tabIndex,focused:document.activeElement===n,outline:getComputedStyle(n).outlineStyle}; })()`);
  if (!direct?.focused) throw new Error(`Keyboard focus did not reach ${accessibleLabel}`);
  return { ...direct, evidenceMode: "direct-focus" };
}
async function safeKeyboardFocus(accessibleLabel) {
  try { return { ...(await checkKeyboardFocus(accessibleLabel)), passed: true }; }
  catch (error) { return { passed: false, error: error instanceof Error ? error.message : String(error) }; }
}

async function overflowMetrics() {
  return evaluate(`(() => ({
    viewport:{width:innerWidth,height:innerHeight},
    document:{scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth,scrollHeight:document.documentElement.scrollHeight},
    body:{scrollWidth:document.body.scrollWidth,clientWidth:document.body.clientWidth},
    horizontalOverflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,
    tray:[...document.querySelectorAll('[aria-label*="Open learning plan tray"], [aria-label*="Collapse learning plan tray"]')].map(n=>{const r=n.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height}})
  }))()`);
}

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });
  const attachedPort = Number(process.env.D078_ACCEPTANCE_CDP_PORT || 0);
  // Headed mode is an opt-in fallback for environments where the headless
  // renderer cannot initialize. It still uses an isolated profile and the
  // same CDP assertions/fixture interception; no sandbox-bypass flags are used.
  const headed = process.argv.includes("--headed");
  // Some Windows Edge installations fail before page load while opening the
  // experimental Dawn/Graphite GPU cache. This opt-in disables only that
  // renderer backend for diagnosis; it does not weaken browser security.
  const disableSkiaGraphite = process.argv.includes("--disable-skia-graphite");
  const port = attachedPort || 9200 + Math.floor(Math.random() * 500);
  if (!attachedPort) {
    const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "d078-edge-acceptance-"));
    browser = spawn(edgePath, [
      ...(headed ? [] : ["--headless=new", "--disable-gpu"]),
      "--no-first-run", "--disable-extensions",
      ...(disableSkiaGraphite ? ["--disable-features=SkiaGraphite"] : []),
      `--user-data-dir=${userDataDir}`, `--remote-debugging-port=${port}`,
      "--remote-allow-origins=*", "--window-size=1440,1000", "about:blank",
    ], { stdio: ["ignore", "ignore", "pipe"], windowsHide: !headed });
    browser.stderr.on("data", (chunk) => { browserStderr = `${browserStderr}${chunk}`.slice(-4000); });
    browser.on("exit", (code, signal) => { browserExit = { code, signal }; });
    browser.on("error", (error) => { browserStderr = `${browserStderr}\nspawn error: ${error.message}`.slice(-4000); });
  }
  let version;
  const cdpStartupDeadline = Date.now() + 15000;
  for (let tries = 0; tries < 80 && Date.now() < cdpStartupDeadline; tries += 1) {
    try {
      version = await fetchJsonWithTimeout(`http://127.0.0.1:${port}/json/version`);
      break;
    } catch {
      if (browserExit) break;
      await wait(150);
    }
  }
  if (!version) throw new Error(`Isolated Edge did not start its debugging endpoint. Exit=${JSON.stringify(browserExit)} stderr=${browserStderr || "<no stderr>"}`);
  const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const page = targets.find((target) => target.type === "page" && target.webSocketDebuggerUrl);
  if (!page) throw new Error("Isolated Edge has no page target.");
  await connect(page.webSocketDebuggerUrl);
  await cdp("Page.enable");
  // Each run starts with a fresh temporary browser profile, so the initial
  // about:blank page is already clean. Navigating the attached target again
  // can close its DevTools socket on some Chromium builds.
  await cdp("Runtime.enable");
  await cdp("Network.enable");
  await cdp("Log.enable");
  await cdp("Page.addScriptToEvaluateOnNewDocument", { source: 'localStorage.setItem("sifter_auth_token_v2", "d078-local-browser-acceptance-token");' });
  await cdp("Fetch.enable", { patterns: [{ urlPattern: `${apiOrigin}/*`, requestStage: "Request" }] });
  await cdp("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await navigate(`${origin}/explore/programme/${programmeId}?user_type=student&journey_mode=undergraduate_career`);

  checklist.length = 0;
  const record = (id, name, proof, detail) => checklist.push({ id, name, result: proof ? "PASS" : "FAIL", evidence: detail });

  await waitForRenderedText("See how Sociology continues in this field", 30000).catch(async () => {
    // A fresh Vite/HMR startup can briefly leave the programme route in its
    // loading shell after the API fixture has already answered. Reopen that
    // same rendered route once before treating the journey as blocked.
    await navigate(`${origin}/explore/programme/${programmeId}?user_type=student&journey_mode=undergraduate_career`);
    await waitForRenderedText("See how Sociology continues in this field", 30000);
  });
  await clickText("See how Sociology continues in this field");
  await waitForRenderedText("Why your Sociology studies connect", 30000).catch(async () => {
    // The local career-detail cache can briefly produce a shell on its first
    // route transition while the intercepted fixture request is resolving.
    // Retry the exact current URL once; do not substitute another route.
    const currentUrl = await evaluate("location.href");
    await navigate(currentUrl);
    await waitForRenderedText("Why your Sociology studies connect", 30000);
  });
  await clickText("See all 14 programme themes");
  await waitForRenderedText("Technology and information");
  const themeLabels = programmeThemes.map((theme) => theme.title);
  const fieldBody = await bodyText();
  const foundThemes = themeLabels.filter((label) => fieldBody.includes(label));
  if (foundThemes.length !== 14) throw new Error(`Expected all 14 source themes, saw ${foundThemes.length}.`);
  await screenshot("desktop-01-field-themes");
  record(1, "Sociology themes and programme-to-field transition", true, {
    transition: "Programme-to-field link navigated to the rendered Social Sciences journey.",
    themesVisible: foundThemes,
  });

  await assertContains("How you will investigate");
  await assertAreaSet([]);
  record(2, "No areas before method/design selection", true, { areas: [] });

  await clickMethod("Interviews");
  await waitForRenderedText("Sociology and Social Anthropology");
  const interviewAreas = ["Politics, Governance and Public Policy", "Social Behaviour and Interaction", "Social Research and Evaluation", "Sociology and Social Anthropology"];
  await assertAreaSet(interviewAreas, ["Economics and Applied Economic Analysis", "Computational and Digital Social Science", "Human Geography and Population Studies"]);
  await screenshot("desktop-02-interviews");
  record(3, "Interviews exact areas", true, { areas: interviewAreas });

  await clickMethod("Interviews", true);
  await waitFor(() => document.body && !document.body.innerText.includes("Sociology and Social Anthropology"), "Interviews deselection clears area cards");
  await assertAreaSet([]);
  await screenshot("desktop-02-interviews-deselected");
  record(4, "Deselect Interviews removes its areas", true, { areas: [] });

  await clickMethod("Spatial analysis and mapping with suitable social data");
  const spatialAreas = ["Computational and Digital Social Science", "Human Geography and Population Studies"];
  await waitForRenderedText(spatialAreas[0]);
  await assertAreaSet(spatialAreas);
  await screenshot("desktop-03-spatial");
  record(5, "Spatial exact areas", true, { areas: spatialAreas });

  await clickMethod("Interviews");
  const union = ["Computational and Digital Social Science", "Human Geography and Population Studies", ...interviewAreas];
  await waitFor(`() => {
    const body = document.body?.innerText || "";
    return ${JSON.stringify(union)}.every((area) => body.includes(area));
  }`, "Interviews + Spatial projected area union");
  const interviewSpatialUnion = await areaLabels();
  if (union.some((area) => !interviewSpatialUnion.includes(area)) || interviewSpatialUnion.length !== union.length || interviewSpatialUnion.includes("Economics and Applied Economic Analysis")) {
    throw new Error(`Interviews + Spatial union mismatch: ${JSON.stringify(interviewSpatialUnion)}`);
  }
  await screenshot("desktop-04-interviews-spatial-union");
  record(6, "Interviews + Spatial union without unsupported areas", true, { areas: interviewSpatialUnion, economicsAbsent: true });

  let clearControlAvailable = true;
  try { await clickText("Clear selected methods"); }
  catch { clearControlAvailable = false; }
  if (!clearControlAvailable) {
    const activeMethods = await evaluate(`(() => {try{return JSON.parse(new URLSearchParams(location.search).get("d078_selection")||"{}").methodIds||[]}catch{return []}})()`);
    for (const id of activeMethods) {
      const method = graphNodes[id];
      if (method?.label) await clickMethod(method.label, true);
    }
  }
  await waitFor(`() => {
    try {
      const selection = JSON.parse(new URLSearchParams(location.search).get("d078_selection") || "{}");
      const body = document.body?.innerText || "";
      return (selection.methodIds || []).length === 0
        && (selection.combinationIds || []).length === 0
        && !body.includes("Computational and Digital Social Science");
    } catch { return false; }
  }`, "clear selection returns to no-selection state");
  await assertAreaSet([]);
  await screenshot("desktop-04-clear-to-no-selection");
  record(7, "Clear returns to State A", clearControlAvailable, {
    areas: [],
    pickerPromptVisible: true,
    clearButtonActivated: clearControlAvailable,
    fallback: clearControlAvailable ? null : "The rendered Clear selected methods control was not locatable; active methods were individually deselected to continue the remaining acceptance run.",
  });

  const combination = Object.values(graph.combination_designs).find((item) => item.id === "combo:interview-and-observation");
  if (!combination) throw new Error("Canonical graph lacks combo:interview-and-observation.");
  const comboLabel = graphNodes[combination.id]?.label || "Compare what people say with situated observation";
  const comboButton = `Select ${comboLabel}`;
  await clickButton(comboButton);
  const comboAreas = ["Human Geography and Population Studies", "Politics, Governance and Public Policy", "Social Behaviour and Interaction", "Social Research and Evaluation", "Sociology and Social Anthropology"];
  await waitForRenderedText(comboAreas.at(-1));
  await assertAreaSet(comboAreas, ["Computational and Digital Social Science", "Economics and Applied Economic Analysis"]);
  const componentMethodIds = combination.required_method_ids || [];
  const methodNodes = graph.method_node_ids.map((id) => graphNodes[id]);
  const componentLabels = [...new Set([...componentMethodIds, ...(combination.selectable_component_method_ids || [])])]
    .map((id) => graphNodes[id]?.label).filter(Boolean);
  const comboSelectionState = await evaluate(`(() => ({selectedButtons:[...document.querySelectorAll('button[aria-pressed="true"],button[aria-checked="true"]')].map(n=>n.getAttribute('aria-label')||n.innerText.trim()),memberMethodLabels:${JSON.stringify(componentLabels)}}))()`);
  const memberTogglesOff = componentLabels.every((label) => {
    const matching = comboSelectionState.selectedButtons.filter((value) => value.includes(label));
    return matching.length === 0;
  });
  if (!memberTogglesOff) throw new Error(`Combination silently selected member method(s): ${JSON.stringify(comboSelectionState)}`);
  await screenshot("desktop-05-interview-observation-combination");
  record(8, "Named combination uses its declared areas without selecting component method toggles", true, { combination: comboLabel, areas: comboAreas, memberMethodIds: componentMethodIds, methodTogglesOff: memberTogglesOff });

  await clickText("Clear selected methods");
  await waitFor(`() => {
    try {
      const selection = JSON.parse(new URLSearchParams(location.search).get("d078_selection") || "{}");
      const body = document.body?.innerText || "";
      return (selection.methodIds || []).length === 0
        && (selection.combinationIds || []).length === 0
        && !body.includes(${JSON.stringify(comboAreas[0])});
    } catch { return false; }
  }`, "clear combination returns to unselected field state");
  await clickMethod("Interviews");
  await waitForRenderedText("Sociology and Social Anthropology");
  await clickButton("Select area Sociology and Social Anthropology");
  await waitForRenderedText("Roles in this area for your selected methods");
  await assertContains("Sociologist");
  await assertButtonAvailable("Select role Sociologist");
  await assertButtonUnavailable("Select role Statistician");
  await screenshot("desktop-06-sociology-area");

  const roleOpenFocus = await safeKeyboardFocus("Select role Sociologist");
  await closeSearchOverlayIfOpen();
  await clickButton("Select role Sociologist");
  await waitForRenderedText("Sociologist");
  await assertContains("Sociology and Social Anthropology");
  await screenshot("desktop-07-sociologist-role");
  record(9, "Open a supported role from its selected area", true, {
    role: "Sociologist",
    area: "Sociology and Social Anthropology",
    visibleAreaRole: "Sociologist",
    unsupportedRoleAbsent: "Statistician",
  });

  await clickButton("Remove Interviews from your selected approaches");
  const undoButton = await waitFor(`() => {
    const node = [...document.querySelectorAll('button,[role="button"]')].find((candidate) => candidate.innerText.trim() === "Undo");
    return node ? { text: node.innerText.trim(), ariaLabel: node.getAttribute("aria-label"), role: node.getAttribute("role"), tag: node.tagName } : false;
  }`, "visible Undo control", 5000).catch(() => null);
  const undoAppeared = Boolean(undoButton);
  const clearedSelection = await evaluate(`(() => {
    try {
      const selection = JSON.parse(new URLSearchParams(location.search).get("d078_selection") || "{}");
      return (selection.methodIds || []).length === 0 && (selection.combinationIds || []).length === 0;
    } catch { return false; }
  })()`);
  if (!clearedSelection) throw new Error("Removing the last method did not clear the route selection.");
  await assertAreaSet([]);
  const pickerReturned = clearedSelection;
  await screenshot("desktop-08-undo-notice");
  record(10, "Removing the last supporting method returns to picker with Undo", undoAppeared && pickerReturned, {
    undoVisible: undoAppeared,
    undoButton,
    pickerReturned,
    clearedSelection,
    observedUrl: await evaluate("location.href"),
    limitation: undoAppeared ? null : "No visible button with the label Undo was found in the rendered DOM.",
  });

  let undoRestoredRoleRoute = false;
  if (undoAppeared) {
    await clickButton("Undo");
    await waitFor(() => location.pathname.includes("/explore/role/"), "Undo returns to the role route", 18000);
    await waitForRenderedText("Available with the method you selected.");
    undoRestoredRoleRoute = await evaluate("location.pathname.includes('/explore/role/') && new URLSearchParams(location.search).has('d078_role_id')");
    if (!undoRestoredRoleRoute) throw new Error("Undo restored the role label but not the role route.");
    await assertContains("Sociology and Social Anthropology");
    await screenshot("desktop-09-undo-restores-role");
    record(11, "Undo restores the same role route", true, { role: "Sociologist", area: "Sociology and Social Anthropology", routeRestored: undoRestoredRoleRoute });
  } else {
    record(11, "Undo restores the same role route", false, {
      role: "Sociologist",
      area: "Sociology and Social Anthropology",
      blocker: "The rendered web field did not mount the query-provided Undo notice after returning from the role. This prevents exercising the Undo action in this browser run.",
    });
    const sociologist = roleNodes.find((node) => slug(node.label) === "sociologist");
    const roleSelection = {
      methodIds: ["domain-item:d078-interviews"],
      combinationIds: [],
      componentMethodIds: {},
      areaId: "D078:sociology-social-anthropology",
      roleId: sociologist?.id,
      addedItemIds: [],
    };
    const params = new URLSearchParams({
      programme_id: programmeId,
      domain_id: "D078",
      area_id: roleSelection.areaId,
      user_type: "student",
      journey_mode: "undergraduate_career",
      d078_role_id: roleSelection.roleId,
      d078_selection: JSON.stringify(roleSelection),
    });
    const roleUrl = `${origin}/explore/role/${encodeURIComponent(roleKeyById.get(sociologist.id))}?${params}`;
    await navigate(roleUrl);
    try {
      await waitForRenderedText("Available with the method you selected.", 30000);
    } catch {
      // The router occasionally settles on its loading shell after a full
      // route replacement in the isolated app. Re-enter that same rendered
      // canonical role route once before treating it as an acceptance failure.
      await navigate(roleUrl);
      await waitForRenderedText("Available with the method you selected.", 30000);
    }
    await waitForRenderedText("Sociology and Social Anthropology");
    await screenshot("desktop-09-role-route-after-undo-gap");
  }

  const desktopSaveLabel = "Save";
  const desktopSaveDimensions = await buttonDimensions(desktopSaveLabel);
  if (!desktopSaveDimensions || desktopSaveDimensions.height < 44 || desktopSaveDimensions.width < 44) {
    throw new Error(`Save action violates 44px target: ${JSON.stringify(desktopSaveDimensions)}`);
  }
  await clickText("Save");
  const savedPath = await waitForNode(
    () => saved.path?.learningPlanSnapshot?.d078SelectionsByRoute ? saved.path : null,
    "D078 selection snapshot in isolated guidance-path PUT",
  );
  const savedSnapshot = savedPath.learningPlanSnapshot;
  if (!savedSnapshot || !savedSnapshot.d078SelectionsByRoute) throw new Error("Save did not persist a D078 route snapshot in the isolated mock.");
  const savedSelection = Object.values(savedSnapshot.d078SelectionsByRoute).find((selection) => selection?.roleId);
  if (!savedSelection?.methodIds?.includes("domain-item:d078-interviews")
      || savedSelection.areaId !== "D078:sociology-social-anthropology"
      || savedSelection.roleId !== "role:D078:3:sociologist") {
    throw new Error(`Saved route did not retain methods/area/role independently: ${JSON.stringify(savedSnapshot.d078SelectionsByRoute)}`);
  }
  const storedD078Path = `/explore/domain/D078?programme_id=${programmeId}&user_type=student&journey_mode=undergraduate_career`;
  await navigate(`${origin}/myworld`);
  await waitForRenderedText("Focused learning plan saved", 45000);
  await assertContains("Route 1 · Sociology and Social Anthropology · Sociologist", "My World D078 route summary");
  await assertContains("Interviews", "My World saved methods");
  await assertContains("Open this version as an editable copy", "My World reopen action");
  await screenshot("desktop-10-my-world-saved-route");
  await clickButton("Edit saved learning plan");
  // Reopening may restore a saved field, area, or role stop. Do not wait for a
  // field-only heading when the saved selection already contains a role.
  await waitForRenderedText("Available with the method you selected.");
  await waitForRenderedText("Sociology and Social Anthropology");
  await waitForRenderedText("Sociologist");
  await waitForRenderedText("Interviews");
  const editableCopy = await bodyText();
  const reopenedUrl = new URL(await evaluate("location.href"));
  const reopenedSelection = JSON.parse(reopenedUrl.searchParams.get("d078_selection") || "{}");
  const d078ReopenedInJourney = editableCopy.includes("Why your Sociology studies connect")
    || editableCopy.includes("How you will investigate");
  const savedStopPointRestored = d078ReopenedInJourney
    && reopenedSelection.methodIds?.includes("domain-item:d078-interviews")
    && reopenedSelection.areaId === savedSelection.areaId
    && reopenedSelection.roleId === savedSelection.roleId;
  await screenshot("desktop-11-editable-copy-opened-from-my-world");
  record(12, "Save, leave and reopen restores the same route", savedStopPointRestored, {
    snapshotId: savedSnapshot.snapshotId,
    routeSummaryVisibleInMyWorld: true,
    editableCopyOpened: true,
    d078JourneyRestoredByMyWorldAction: d078ReopenedInJourney,
    restoredStopPoint: reopenedSelection.roleId ? "role" : reopenedSelection.areaId ? "area" : "field",
    restoredMethodIds: reopenedSelection.methodIds || [],
    restoredAreaId: reopenedSelection.areaId || null,
    restoredRoleId: reopenedSelection.roleId || null,
    university: "University of Lagos",
    student: "Amina Okafor (amina.okafor; synthetic isolated fixture)",
    blocker: savedStopPointRestored
      ? null
      : "My World edit action did not restore the saved D078 method/area/role stop point.",
  });
  const roleRouteParams = new URLSearchParams({
    programme_id: programmeId,
    domain_id: "D078",
    area_id: savedSelection.areaId,
    user_type: "student",
    journey_mode: "undergraduate_career",
    d078_role_id: savedSelection.roleId,
    d078_selection: JSON.stringify(savedSelection),
  });
  const roleRouteKey = roleKeyById.get(savedSelection.roleId);
  if (!roleRouteKey) throw new Error(`Saved role id does not resolve to a canonical route: ${savedSelection.roleId}`);
  await navigate(`${origin}/explore/role/${encodeURIComponent(roleRouteKey)}?${roleRouteParams}`);
  await waitForRenderedText("Available with the method you selected.");
  await waitForRenderedText("Sociologist");
  await assertContains("Sociology and Social Anthropology", "restored D078 area");
  const restoredRouteSelection = await evaluate(`(() => JSON.parse(new URLSearchParams(location.search).get("d078_selection") || "{}"))()`);
  if (JSON.stringify(restoredRouteSelection.methodIds) !== JSON.stringify(savedSelection.methodIds)
      || JSON.stringify(restoredRouteSelection.combinationIds) !== JSON.stringify(savedSelection.combinationIds)
      || JSON.stringify(restoredRouteSelection.componentMethodIds) !== JSON.stringify(savedSelection.componentMethodIds)
      || restoredRouteSelection.areaId !== savedSelection.areaId
      || restoredRouteSelection.roleId !== savedSelection.roleId
      || JSON.stringify(restoredRouteSelection.addedItemIds) !== JSON.stringify(savedSelection.addedItemIds)) {
    throw new Error(`Reopened route selection diverged from the saved snapshot: ${JSON.stringify(restoredRouteSelection)}`);
  }
  await screenshot("desktop-12-saved-role-route-query-restored");

  // Reset only the isolated mock after the archive round-trip. This lets the
  // following control-size checks start from the canonical empty picker.
  saved.path = {
    programme: { id: programmeId, name: "Sociology" },
    university: { id: "26ce26b0-5eac-5286-b8b5-179e56a6b320", name: "University of Lagos" },
    domains: [{ id: "D078", name: "Social Sciences" }],
  };
  const emptyPickerParams = new URLSearchParams({
    programme_id: programmeId,
    user_type: "student",
    journey_mode: "undergraduate_career",
  });
  await navigate(`${origin}/explore/domain/D078?${emptyPickerParams}`);
  await waitForRenderedText("Why your Sociology studies connect", 30000);
  await waitForRenderedText("Choose one or more ways to investigate.");
  const selectSize = await buttonDimensions("Select Interviews");
  const selectFocus = await safeKeyboardFocus("Select Interviews");
  await closeSearchOverlayIfOpen();
  if (!selectSize || selectSize.height < 44 || selectSize.width < 44) throw new Error(`Select target under 44px: ${JSON.stringify(selectSize)}`);
  await clickMethod("Interviews");
  await waitForRenderedText("Sociology and Social Anthropology");
  const nvivoCard = "See more about NVivo for organizing and coding substantial qualitative material";
  await clickButton(nvivoCard);
  await waitForRenderedText("Learning resources");
  const nvivoTitle = "NVivo for organizing and coding substantial qualitative material";
  const firstNvivoResource = domain.resources.find((resource) => resource.targetName === nvivoTitle);
  if (!firstNvivoResource) throw new Error("The canonical NVivo tool has no source-backed learning-resource fixture.");
  const resourceProvider = firstNvivoResource.provider || firstNvivoResource.targetName;
  const resourceLabel = `Tool guide. ${nvivoTitle}. ${resourceProvider}. Free to access. Open.`;
  const resourceOpenSize = await buttonDimensions(resourceLabel);
  const resourceFocus = resourceOpenSize ? await safeKeyboardFocus(resourceLabel) : null;
  await closeSearchOverlayIfOpen();
  const resourceRow = await evaluate(`(() => {
    const titleText=${JSON.stringify(nvivoTitle)};
    const button=[...document.querySelectorAll('button,[role="button"]')].find(n=>n.getAttribute('aria-label')===${JSON.stringify(resourceLabel)});
    if(!button)return null;
    let row=button.parentElement;
    while(row&&row!==document.body){
      const r=row.getBoundingClientRect();
      const text=row.innerText||"";
      if(getComputedStyle(row).display==="flex"&&r.height>=40&&r.height<=160&&text.includes("Tool guide")&&text.includes(titleText))break;
      row=row.parentElement;
    }
    if(!row||row===document.body)return null;
    const r=row.getBoundingClientRect();
    const descendants=[...row.querySelectorAll('*')];
    const chip=descendants.find(n=>n.textContent.trim()==="Tool guide");
    const title=descendants.find(n=>n.textContent.trim()===titleText);
    const chipRect=chip?.getBoundingClientRect();
    const titleRect=title?.getBoundingClientRect();
    return {text:row.innerText,width:r.width,height:r.height,display:getComputedStyle(row).display,chipY:chipRect?.y,titleY:titleRect?.y,titleX:titleRect?.x,chipRight:chipRect?.right,openButtonWidth:button.getBoundingClientRect().width,openButtonHeight:button.getBoundingClientRect().height,viewportWidth:innerWidth};
  })()`);
  const resourceDomDiagnostics = await evaluate(`(() => {
    const button=[...document.querySelectorAll('button,[role="button"]')].find(n=>(n.getAttribute('aria-label')||'')===${JSON.stringify(resourceLabel)});
    const card=button?.closest('[data-testid="d078-item-card"]')||button?.parentElement?.parentElement?.parentElement;
    return {titleVisible:[...document.querySelectorAll('*')].some(n=>n.textContent.trim()==="NVivo for organizing and coding substantial qualitative material"),seeMoreButton:button?.getAttribute('aria-label')||null,cardText:card?.innerText?.slice(0,1800)||null,learningResourcesVisible:(document.body?.innerText||'').includes('Learning resources'),openButtons:[...document.querySelectorAll('button,[role="button"]')].filter(n=>(n.getAttribute('aria-label')||'').endsWith('. Open.')).map(n=>n.getAttribute('aria-label'))};
  })()`);
  const resourceRowPassed = Boolean(resourceRow && resourceRow.height <= 100 && resourceRow.display === "flex"
    && resourceRow.text.includes("Tool guide") && Math.abs(resourceRow.chipY - resourceRow.titleY) <= 12
    && resourceRow.titleX >= resourceRow.chipRight);
  await screenshot("desktop-11-resource-row");

  const openAreaSize = await buttonDimensions("Select area Sociology and Social Anthropology");
  const openAreaFocus = await safeKeyboardFocus("Select area Sociology and Social Anthropology");
  await closeSearchOverlayIfOpen();
  await clickButton("Select area Sociology and Social Anthropology");
  await waitForRenderedText("Roles in this area for your selected methods");
  const backSize = await buttonDimensions("Back to Social Sciences domain");
  const backFocus = await safeKeyboardFocus("Back to Social Sciences domain");
  await closeSearchOverlayIfOpen();
  await assertButtonAvailable("Select role Sociologist");
  const saveSize = desktopSaveDimensions;
  const routeResourceNode = graphNodes["domain-item:d078-nvivo-tool"];
  if (!routeResourceNode?.resources?.some((entry) => entry.url)) throw new Error("Expected canonical graph fixture resource is missing.");
  const allTargetMetrics = { select: selectSize, openArea: openAreaSize, back: backSize, save: saveSize, resourceOpen: resourceOpenSize };
  const sizeTargetsPassed = Object.values(allTargetMetrics).every((metric) => metric && metric.height >= 44 && metric.width >= 44);
  const keyboardTargetsPassed = [selectFocus, openAreaFocus, backFocus, resourceFocus, roleOpenFocus].every((focus) => focus?.passed === true);
  const controlsPassed = sizeTargetsPassed && keyboardTargetsPassed;
  record(13, "Select/Open/Back/Save/resource Open target sizes and keyboard focus", controlsPassed, {
    minimumTargetSize: "44 x 44 CSS px",
    metrics: allTargetMetrics,
    focus: { select: selectFocus, openArea: openAreaFocus, back: backFocus, resourceOpen: resourceFocus, roleOpen: roleOpenFocus },
  });

  const nvivoFixtureResources = domain.resources.filter((resource) => resource.targetName === "NVivo for organizing and coding substantial qualitative material");
  record(14, "Learning resource uses one compact row with type chip beside title", resourceRowPassed, {
    fixtureResourceCount: nvivoFixtureResources.length,
    fixtureResourceUrls: nvivoFixtureResources.map((resource) => resource.url),
    renderedRow: resourceRow,
    renderedDiagnostics: resourceDomDiagnostics,
    error: resourceRowPassed ? null : "The canonical NVivo resource row was not found in the rendered DOM.",
  });

  const internalLanguage = ["D078", "route node", "shared foundation", "evidence-file note"];
  const studentBody = await bodyText();
  const presentInternal = internalLanguage.filter((phrase) => studentBody.toLowerCase().includes(phrase.toLowerCase()));
  if (presentInternal.length) throw new Error(`Internal review language is visible: ${presentInternal.join(", ")}`);
  record(15, "Student-facing text follows section 14 exclusions", true, { forbiddenPhrasesAbsent: internalLanguage, sourceTextsChecked: "full rendered role-page document text" });

  await cdp("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true, screenWidth: 390, screenHeight: 844 });
  await navigate(`${origin}${storedD078Path}`);
  await waitForRenderedText("Why your Sociology studies connect", 30000);
  await waitFor(() => document.body && document.body.innerText.includes("How you will investigate"), "mobile picker");
  const mobileInitialMetrics = await overflowMetrics();
  if (mobileInitialMetrics.horizontalOverflow) throw new Error(`Horizontal overflow on mobile field state: ${JSON.stringify(mobileInitialMetrics)}`);
  await screenshot("mobile-01-field");
  await clickMethod("Interviews");
  await waitForButton("Deselect Interviews", 10000);
  await waitForRenderedText("Sociology and Social Anthropology");
  const mobileSelectedMetrics = await overflowMetrics();
  if (mobileSelectedMetrics.horizontalOverflow) throw new Error(`Horizontal overflow on mobile selected route: ${JSON.stringify(mobileSelectedMetrics)}`);
  const visibleMobileTray = `(() => [...document.querySelectorAll('button,[role="button"]')].find((node) => {
    const label = node.getAttribute('aria-label') || "";
    const rect = node.getBoundingClientRect();
    const style = getComputedStyle(node);
    return label.includes("Open learning plan tray") && rect.width > 0 && rect.height > 0
      && style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity) > 0;
  }))()`;
  const mobileTrayButtonState = await waitFor(`() => {
    const node = ${visibleMobileTray};
    if (!node) return false;
    const rect = node.getBoundingClientRect();
    return { label: node.getAttribute("aria-label"), x: rect.x, y: rect.y, width: rect.width, height: rect.height };
  }`, "visible mobile learning tray trigger", 10000);
  const mobileTrayOpen = mobileTrayButtonState.label;
  if (!mobileTrayOpen) throw new Error("Mobile learning tray trigger is absent.");
  const mobileSelectionState = await evaluate(`(() => ({
    selectedMethodButtons:[...document.querySelectorAll('button,[role="button"]')].filter(n=>(n.getAttribute('aria-label')||'')==="Deselect Interviews").map(n=>n.getAttribute('aria-label')),
    selectedApproachText:(document.body?.innerText||'').includes('Interviews'),
    trayTrigger:${visibleMobileTray}?.getAttribute('aria-label')||null,
    allTrayTriggers:[...document.querySelectorAll('button,[role="button"]')].filter(n=>(n.getAttribute('aria-label')||'').includes('Open learning plan tray')).map(n=>{const r=n.getBoundingClientRect();const s=getComputedStyle(n);return {label:n.getAttribute('aria-label'),x:r.x,y:r.y,width:r.width,height:r.height,visible:r.width>0&&r.height>0&&s.display!=="none"&&s.visibility!=="hidden"&&Number(s.opacity)>0}}),
  }))()`);
  await clickButton(mobileTrayOpen);
  const mobileTrayExpanded = await waitFor(() => document.body
    && document.body.innerText.includes("Your selected approaches")
    && document.body.innerText.includes("Interviews"), "mobile tray shows the selected approach", 15000).catch(() => false);
  const mobileTrayMetrics = await overflowMetrics();
  if (mobileTrayMetrics.horizontalOverflow) throw new Error(`Horizontal overflow in mobile tray: ${JSON.stringify(mobileTrayMetrics)}`);
  // The tray uses the agreed slide-up transition. Text appears as soon as the
  // modal mounts, before the animation reaches its final viewport position.
  // Wait for the sheet to settle before judging placement.
  await waitFor(`() => {
    const heading=[...document.querySelectorAll('*')].find(n=>n.textContent.trim()==="Your selected approaches");
    if(!heading)return false;
    let panel=heading.parentElement;
    while(panel&&panel!==document.body){
      const r=panel.getBoundingClientRect();
      if(r.width>=300&&r.width<=innerWidth&&r.height>=240&&r.height<=innerHeight)
        return r.x>=0&&r.y>=0&&r.right<=innerWidth&&r.bottom<=innerHeight;
      panel=panel.parentElement;
    }
    return false;
  }`, "mobile learning-plan sheet finishes entering the viewport", 4000).catch(() => false);
  const mobileTrayPanel = await evaluate(`(() => {
    const heading=[...document.querySelectorAll('*')].find(n=>n.textContent.trim()==="Your selected approaches");
    if(!heading)return null;
    let panel=heading.parentElement;
    while(panel&&panel!==document.body){
      const r=panel.getBoundingClientRect();
      if(r.width>=300&&r.width<=innerWidth&&r.height>=240&&r.height<=innerHeight)break;
      panel=panel.parentElement;
    }
    if(!panel||panel===document.body)return null;
    const r=panel.getBoundingClientRect();
    return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom,withinViewport:r.x>=0&&r.y>=0&&r.right<=innerWidth&&r.bottom<=innerHeight};
  })()`);
  await screenshot("mobile-02-learning-tray");
  const mobileTrayPlacementPassed = mobileSelectionState.trayTrigger?.includes("1 selected item") === true
    && mobileTrayExpanded && mobileTrayPanel?.withinViewport === true;
  record("mobile", "Mobile tray placement and responsive overflow", mobileTrayPlacementPassed, { initial: mobileInitialMetrics, selectedRoute: mobileSelectedMetrics, selectedMethodState: mobileSelectionState, visibleTriggerState: mobileTrayButtonState, trayExpanded: mobileTrayMetrics, trayPanel: mobileTrayPanel, modalOpened: mobileTrayExpanded, trigger: mobileTrayOpen, selectedApproachVisible: mobileTrayExpanded, screenshots: ["mobile-01-field.png", "mobile-02-learning-tray.png"] });

  await cdp("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  await cdp("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await navigate(`${origin}${storedD078Path}`);
  await waitForRenderedText("Why your Sociology studies connect", 30000);
  await waitForButton("Select Interviews", 30000);
  await clickMethod("Interviews");
  await waitForButton("Deselect Interviews", 30000);
  await clickMethod("Interviews", true);
  await waitFor(() => document.body && !document.body.innerText.includes("Sociology and Social Anthropology"), "remove restored method for reduced-motion check");
  await clickMethod("Interviews");
  const reducedMotionAnimation = await evaluate(`(() => [...document.querySelectorAll('*')].filter(n=>n.getAnimations).flatMap(n=>n.getAnimations()).map(a=>({playState:a.playState,duration:a.effect?.getTiming?.().duration})).slice(0,10))()`);
  if (reducedMotionAnimation.some((entry) => Number(entry.duration) > 0)) throw new Error(`Reduced-motion media query left animations active: ${JSON.stringify(reducedMotionAnimation)}`);
  await screenshot("desktop-11-reduced-motion");
  record("motion", "Reduced-motion preference disables route transition animation", true, { activeAnimations: reducedMotionAnimation, media: "prefers-reduced-motion: reduce" });

  const failedMockCalls = apiHits.filter((hit) => hit.path !== "/api/users/me"
    && !hit.path.includes("/api/career/programmes")
    && !hit.path.includes("/api/career/jamb-programmes")
    && hit.path !== "/api/career/domains/D078"
    && !hit.path.startsWith("/api/career/roles/")
    && hit.path !== "/api/student/guidance-path");
  const report = {
    generatedAt: new Date().toISOString(),
    browser: version.Browser,
    origin,
    fixtureMode: "isolated browser API interception; canonical current D078 graph and reviewed Sociology curriculum contract",
    liveApiVerified: false,
    liveApiBlocker: "This harness intercepts API responses with isolated fixture data and does not verify live API or database payloads; live-backend verification remains separate.",
    isolatedProfile: true,
    accountCreated: false,
    testContext: {
      student: "Amina Okafor",
      username: "amina.okafor",
      university: "University of Lagos",
      syntheticIsolatedFixture: true,
    },
    graphFixtureCounts: { areas: areaNodes.length, roles: roleNodes.length, methods: graph.method_node_ids.length, combinations: graph.combination_designs.length, themes: programmeThemes.length },
    checklist,
    screenshots: screenshotsCaptured,
    apiRequestsIntercepted: apiHits,
    unmockedApiCalls: failedMockCalls,
  };
  const evidenceScreenshots = {
    1: ["desktop-01-field-themes.png"],
    2: ["desktop-01-field-themes.png"],
    3: ["desktop-02-interviews.png"],
    4: ["desktop-02-interviews-deselected.png"],
    5: ["desktop-03-spatial.png"],
    6: ["desktop-04-interviews-spatial-union.png"],
    7: ["desktop-04-clear-to-no-selection.png"],
    8: ["desktop-05-interview-observation-combination.png"],
    9: ["desktop-06-sociology-area.png", "desktop-07-sociologist-role.png"],
    10: ["desktop-08-undo-notice.png"],
    11: ["desktop-09-role-route-after-undo-gap.png"],
    12: ["desktop-10-my-world-saved-route.png", "desktop-11-editable-copy-opened-from-my-world.png", "desktop-12-saved-role-route-query-restored.png"],
    13: ["desktop-02-interviews.png", "desktop-06-sociology-area.png", "desktop-07-sociologist-role.png", "desktop-11-resource-row.png"],
    14: ["desktop-11-resource-row.png"],
    15: ["desktop-07-sociologist-role.png"],
    mobile: ["mobile-01-field.png", "mobile-02-learning-tray.png"],
    motion: ["desktop-11-reduced-motion.png"],
  };
  for (const item of checklist) item.evidence.screenshots = evidenceScreenshots[item.id] ?? [];
  if (checklist.filter((item) => item.result === "PASS" && typeof item.id === "number").length !== 15) {
    report.checklistSummary = "incomplete";
  }
  fs.writeFileSync(path.join(outputDir, "acceptance-report.json"), `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify({
    reportPath: path.join(outputDir, "acceptance-report.json"),
    browser: report.browser,
    checklist: checklist.filter((item) => item.result === "PASS").length,
    screenshots: report.screenshots.length,
    liveApiVerified: report.liveApiVerified,
  }, null, 2));
}

main().catch(async (error) => {
  let browserState;
  try { browserState = await evaluate("JSON.stringify({url:location.href,title:document.title,readyState:document.readyState,body:document.body?.innerText?.slice(0,1800)})"); } catch {}
  try { await screenshot("failure-state"); } catch {}
  const failedSnapshot = savedWriteBody?.path?.learningPlanSnapshot;
  const failureData = {
    generatedAt: new Date().toISOString(),
    error: error.stack || error.message || String(error),
    browserState: browserState || null,
    savedPathKeys: Object.keys(savedWriteBody?.path || {}),
    browserExit,
    browserStderr,
    savedSnapshot: failedSnapshot ? {
      snapshotId: failedSnapshot.snapshotId,
      dataVersion: failedSnapshot.dataVersion,
      reportProgramme: failedSnapshot.reportPathContext?.programme,
      routeKeys: Object.keys(failedSnapshot.d078SelectionsByRoute || {}),
      routeStackIds: failedSnapshot.d078RouteStackIds,
      activeStackId: failedSnapshot.d078ActiveStackId,
      selections: failedSnapshot.d078SelectionsByRoute,
    } : null,
    apiRequestsIntercepted: apiHits,
  };
  try { fs.writeFileSync(path.join(outputDir, "acceptance-failure.json"), `${JSON.stringify(failureData, null, 2)}\n`); }
  catch (writeError) { console.error(`Could not write failure artifact: ${writeError.message}`); }
  console.error(error.stack || error.message || String(error));
  if (browserState) console.error(`Browser state: ${browserState}`);
  if (apiHits.length) console.error(`Intercepted API calls: ${JSON.stringify(apiHits)}`);
  if (apiFulfillments.length) console.error(`Mock responses: ${JSON.stringify(apiFulfillments)}`);
  if (browserDiagnostics.length) console.error(`Browser diagnostics: ${JSON.stringify(browserDiagnostics)}`);
  if (savedWriteBody) console.error(`Saved fixture payload keys: ${JSON.stringify(Object.keys(savedWriteBody.path || {}))}`);
  process.exitCode = 1;
}).finally(async () => {
  if (process.env.D078_ACCEPTANCE_CLOSE_BROWSER === "1" && socket?.readyState === WebSocket.OPEN) {
    try { await cdp("Browser.close"); } catch {}
  }
  try { if (socket?.readyState === WebSocket.OPEN) socket.close(); } catch {}
  try { browser?.kill(); } catch {}
});
