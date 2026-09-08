const pages = await (await fetch("http://127.0.0.1:9222/json/list")).json();
const page = pages.find((item) => item.type === "page" && item.url.includes("127.0.0.1:5173"));
const socket = new WebSocket(page.webSocketDebuggerUrl);
let nextId = 0;
const waiters = new Map();
socket.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.method === "Runtime.exceptionThrown") console.log("EXCEPTION", JSON.stringify(message.params.exceptionDetails));
  if (message.method === "Runtime.consoleAPICalled") console.log("CONSOLE", message.params.type, JSON.stringify(message.params.args?.map((arg) => arg.value ?? arg.description)));
  if (message.method === "Log.entryAdded") console.log("LOG", JSON.stringify(message.params.entry));
  const resolve = waiters.get(message.id);
  if (resolve) { waiters.delete(message.id); resolve(message); }
};
await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
const call = (method, params = {}) => new Promise((resolve) => { const id = ++nextId; waiters.set(id, resolve); socket.send(JSON.stringify({ id, method, params })); });
await call("Runtime.enable");
await call("Log.enable");
await call("Page.enable");
await call("Page.reload", { ignoreCache: true });
await new Promise((resolve) => setTimeout(resolve, 12000));
const state = await call("Runtime.evaluate", { expression: `({ url: location.href, html: document.documentElement.outerHTML.slice(0, 2000), body: document.body?.innerText ?? "", token: Boolean(localStorage.getItem("sifter_auth_token_v2")) })`, returnByValue: true });
console.log("STATE", JSON.stringify(state.result?.result?.value));
socket.close();
