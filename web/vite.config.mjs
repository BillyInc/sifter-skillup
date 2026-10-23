import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const webRoot = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(webRoot, "..");
const reactRoot = path.resolve(projectRoot, "node_modules/react");
const reactDomRoot = path.resolve(projectRoot, "node_modules/react-dom");

const freshLocalModules = {
  name: "fresh-local-modules",
  apply: "serve",
  configureServer(server) {
    // Windows browsers can fail to read their cached source-module body after
    // Vite answers a conditional request with 304. Always send the module body
    // from this local development server instead of asking the browser cache to
    // restore it. This plugin is dev-server-only and has no production effect.
    server.middlewares.use((req, res, next) => {
      delete req.headers["if-none-match"];
      delete req.headers["if-modified-since"];
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      next();
    });
  },
};

export default defineConfig(({ mode }) => ({
  root: webRoot,
  plugins: [react(), freshLocalModules],
  publicDir: path.resolve(webRoot, "public"),
  define: {
    __DEV__: mode !== "production",
    // React Native's JS animation fallback references the Node-style global
    // object. Browsers expose the same object as globalThis.
    global: "globalThis",
    // Expo supplies process.env at runtime; browsers do not. Vite exposes the
    // same EXPO_PUBLIC_* values through import.meta.env for the web build.
    "process.env": "import.meta.env",
  },
  envPrefix: ["VITE_", "EXPO_PUBLIC_"],
  resolve: {
    // The web shell imports React through both the Vite entry and the
    // Expo-compatible screen graph. Keep those graphs on the exact same
    // React instances; otherwise a lazily loaded screen can see a different
    // dispatcher and fail with "Invalid hook call" at runtime.
    dedupe: ["react", "react-dom"],
    alias: [
      // The shared learning-plan dock must portal out of scrolling route shells
      // on web. Native keeps the same import path and resolves the platform-neutral
      // fallback through Metro's platform extension rules.
      { find: /^@\/components\/careerIntelligence\/PersistentLearningPlanDockPortal$/, replacement: path.resolve(webRoot, "../src/components/careerIntelligence/PersistentLearningPlanDockPortal.web.tsx") },
      // Resolve every React import to the workspace copy. The Expo-compatible
      // screen graph is lazy-loaded, so package-name deduplication alone can
      // still leave a second React dispatcher in the browser graph.
      { find: /^react$/, replacement: path.join(reactRoot, "index.js") },
      { find: /^react\/jsx-runtime$/, replacement: path.join(reactRoot, "jsx-runtime.js") },
      { find: /^react\/jsx-dev-runtime$/, replacement: path.join(reactRoot, "jsx-dev-runtime.js") },
      { find: /^react-dom$/, replacement: path.join(reactDomRoot, "index.js") },
      { find: /^react-dom\/client$/, replacement: path.join(reactDomRoot, "client.js") },
      { find: "@react-navigation/native", replacement: path.resolve(webRoot, "./src/reactNavigation.tsx") },
      { find: /^@\/hooks\/useAuth$/, replacement: path.resolve(webRoot, "./src/webAuth.tsx") },
      { find: "@", replacement: path.resolve(webRoot, "../src") },
      { find: path.resolve(webRoot, "../src/hooks/useAuth"), replacement: path.resolve(webRoot, "./src/webAuth.tsx") },
      { find: "expo-router", replacement: path.resolve(webRoot, "./src/expo-router.tsx") },
      { find: "@expo/vector-icons", replacement: path.resolve(webRoot, "./src/vectorIcons.tsx") },
      { find: "expo-clipboard", replacement: path.resolve(webRoot, "./src/expoClipboard.ts") },
      { find: "expo-image-picker", replacement: path.resolve(webRoot, "./src/expoImagePicker.ts") },
      { find: "expo-linear-gradient", replacement: path.resolve(webRoot, "./src/linearGradient.tsx") },
      { find: "expo-apple-authentication", replacement: path.resolve(webRoot, "./src/expoWebStubs.tsx") },
      { find: "expo-haptics", replacement: path.resolve(webRoot, "./src/expoWebStubs.tsx") },
      { find: "expo-secure-store", replacement: path.resolve(webRoot, "./src/expoWebStubs.tsx") },
      { find: "expo-crypto", replacement: path.resolve(webRoot, "./src/expoWebStubs.tsx") },
      { find: "expo-constants", replacement: path.resolve(webRoot, "./src/expoWebStubs.tsx") },
      { find: "expo-file-system/legacy", replacement: path.resolve(webRoot, "./src/expoWebStubs.tsx") },
      { find: "expo-file-system", replacement: path.resolve(webRoot, "./src/expoWebStubs.tsx") },
      { find: "expo-linking", replacement: path.resolve(webRoot, "./src/expoWebStubs.tsx") },
      { find: "expo-notifications", replacement: path.resolve(webRoot, "./src/expoWebStubs.tsx") },
      { find: "expo-application", replacement: path.resolve(webRoot, "./src/expoWebStubs.tsx") },
      { find: "expo-local-authentication", replacement: path.resolve(webRoot, "./src/expoWebStubs.tsx") },
      { find: "expo-font", replacement: path.resolve(webRoot, "./src/expoWebStubs.tsx") },
      { find: "@react-native-community/netinfo", replacement: path.resolve(webRoot, "./src/netInfo.ts") },
      { find: "@privy-io/react-auth/extended-chains", replacement: path.resolve(webRoot, "./src/privyStub.tsx") },
      { find: "@privy-io/expo/extended-chains", replacement: path.resolve(webRoot, "./src/privyStub.tsx") },
      { find: "@privy-io/react-auth", replacement: path.resolve(webRoot, "./src/privyStub.tsx") },
      { find: "@privy-io/expo", replacement: path.resolve(webRoot, "./src/privyStub.tsx") },
      { find: "react-native-safe-area-context", replacement: path.resolve(webRoot, "./src/safeArea.tsx") },
      { find: "react-native-gesture-handler", replacement: path.resolve(webRoot, "./src/gestureHandler.tsx") },
      { find: "react-native-reanimated", replacement: path.resolve(webRoot, "./src/reanimated.tsx") },
      { find: "react-native-svg", replacement: path.resolve(webRoot, "./src/svg.tsx") },
      { find: "@react-native/assets-registry/registry", replacement: path.resolve(webRoot, "./src/assetRegistry.ts") },
      { find: "@react-native/assets-registry", replacement: path.resolve(webRoot, "./src/assetRegistry.ts") },
      { find: "react-native", replacement: path.resolve(webRoot, "./src/reactNative.ts") },
    ],
  },
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true,
  },
  build: {
    outDir: path.resolve(webRoot, "../dist-web"),
    emptyOutDir: true,
  },
}));
