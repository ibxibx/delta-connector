// @lovable.dev/vite-tanstack-config already includes plugins (tanstackStart, viteReact,
// tailwindcss, tsConfigPaths, nitro, env injection, path alias) - do NOT add them manually.
// We force nitro on with the node-server preset so the build emits a standalone Node server
// that listens on $PORT - used for Render / any Node host (see DEPLOY.md).
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  nitro: { preset: "node-server" },
  tanstackStart: {
    // Redirect bundled server entry to src/server.ts (our SSR error wrapper).
    server: { entry: "server" },
  },
});
