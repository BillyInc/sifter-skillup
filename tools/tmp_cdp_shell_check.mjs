const pages = await (await fetch("http://127.0.0.1:9222/json/list")).json();
const page = pages.find((item) => item.type === "page" && item.url.includes("127.0.0.1:5173"));
if (!page) throw new Error("No Vite page found");
const socket = new WebSocket(page.webSocketDebuggerUrl);
let nextId = 0;
const waiters = new Map();
socket.onmessage = (event) => {
  const message = JSON.parse(event.data);
  const resolve = waiters.get(message.id);
  if (resolve) {
    waiters.delete(message.id);
    resolve(message);
  }
};
await new Promise((resolve, reject) => {
  socket.onopen = resolve;
  socket.onerror = reject;
});
const call = (method, params = {}) => new Promise((resolve) => {
  const id = ++nextId;
  waiters.set(id, resolve);
  socket.send(JSON.stringify({ id, method, params }));
});
const evaluate = async (expression) => {
  const response = await call("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  return response.result?.result?.value;
};
await call("Page.enable");
await new Promise((resolve) => setTimeout(resolve, 1800));
const home = await evaluate(`(() => {
  const pick = (selector) => document.querySelector(selector);
  const rect = (selector) => { const value = pick(selector)?.getBoundingClientRect(); return value ? { top: value.top, bottom: value.bottom, left: value.left, width: value.width } : null; };
  window.scrollTo(0, document.body.scrollHeight);
  return { url: location.href, text: document.body.innerText.slice(0, 500), sidebar: Boolean(pick(".platform-sidebar")), toolbar: Boolean(pick(".platform-toolbar")), signout: Boolean(pick(".platform-sidebar-account .text-button")), search: Boolean(pick(".global-search")), sidebarRect: rect(".platform-sidebar"), toolbarRect: rect(".platform-toolbar"), scrollY };
})()`);
await call("Page.navigate", { url: "http://127.0.0.1:5173/explore" });
await new Promise((resolve) => setTimeout(resolve, 8000));
const explore = await evaluate(`(() => {
  const pick = (selector) => document.querySelector(selector);
  return { url: location.href, text: document.body.innerText.slice(0, 700), sidebar: Boolean(pick(".platform-sidebar")), localExploreSearch: Boolean(document.querySelector('input[placeholder*="Search programmes"]')), globalSearch: Boolean(pick(".global-search input")), admissionCard: document.body.innerText.includes("ADMISSION INTELLIGENCE") };
})()`);
console.log(JSON.stringify({ home, explore }));
socket.close();
