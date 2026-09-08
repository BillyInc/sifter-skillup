const pages = await (await fetch("http://127.0.0.1:9222/json/list")).json();
const page = pages.find((item) => item.type === "page" && item.url.includes("127.0.0.1:5173"));
const socket = new WebSocket(page.webSocketDebuggerUrl);
let nextId = 0;
const waiters = new Map();
socket.onmessage = (event) => { const message = JSON.parse(event.data); const resolve = waiters.get(message.id); if (resolve) { waiters.delete(message.id); resolve(message); } };
await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
const call = (method, params = {}) => new Promise((resolve) => { const id = ++nextId; waiters.set(id, resolve); socket.send(JSON.stringify({ id, method, params })); });
const evaluate = async (expression) => (await call("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true })).result?.result?.value;
await call("Runtime.enable");
const result = await evaluate(`(async () => {
  const auth = await fetch("http://127.0.0.1:8000/api/auth/guest", { method: "POST" });
  const authJson = await auth.json();
  localStorage.setItem("sifter_auth_token_v2", authJson.data.token);
  const token = localStorage.getItem("sifter_auth_token_v2");
  const start = performance.now();
  try {
    const response = await fetch("http://127.0.0.1:8000/api/users/me", { headers: { Authorization: "Bearer " + token } });
    return { authStatus: auth.status, token: Boolean(token), status: response.status, elapsed: Math.round(performance.now() - start), body: (await response.text()).slice(0, 400), url: location.href, text: document.body.innerText.slice(0, 300) };
  } catch (error) { return { token: Boolean(token), elapsed: Math.round(performance.now() - start), error: String(error), url: location.href, text: document.body.innerText.slice(0, 300) }; }
})()`);
console.log(JSON.stringify(result));
await call("Page.navigate", { url: "http://127.0.0.1:5173/home" });
await new Promise((resolve) => setTimeout(resolve, 6000));
const restored = await evaluate(`(() => ({ url: location.href, text: document.body.innerText.slice(0, 600), sidebar: Boolean(document.querySelector(".platform-sidebar")), search: Boolean(document.querySelector(".global-search")), signout: Boolean(document.querySelector(".platform-sidebar-account .text-button")) }))()`);
console.log(JSON.stringify({ restored }));
await call("Page.navigate", { url: "http://127.0.0.1:5173/explore" });
await new Promise((resolve) => setTimeout(resolve, 9000));
const exploreBeforeSearch = await evaluate(`(() => ({ url: location.href, text: document.body.innerText.slice(0, 900), sidebar: Boolean(document.querySelector(".platform-sidebar")), search: Boolean(document.querySelector(".global-search input")), duplicateExploreSearch: Boolean(document.querySelector('input[placeholder*="Search programmes"]')), admissionCard: document.body.innerText.includes("ADMISSION INTELLIGENCE") }))()`);
const searchInteraction = await evaluate(`(() => { const input = document.querySelector(".global-search input"); if (!input) return { available: false }; const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set; setter.call(input, "nursing"); input.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: "nursing" })); input.focus(); return { available: true, value: input.value }; })()`);
await new Promise((resolve) => setTimeout(resolve, 7000));
const exploreAfterSearch = await evaluate(`(() => ({ dropdown: Boolean(document.querySelector(".global-search-dropdown")), dropdownText: document.querySelector(".global-search-dropdown")?.innerText.slice(0, 1200) ?? "", shellText: document.body.innerText.slice(0, 1200) }))()`);
console.log(JSON.stringify({ exploreBeforeSearch, searchInteraction, exploreAfterSearch }));
socket.close();
