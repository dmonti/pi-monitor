var t0 = Date.now()

import pkg from './package.json' assert { type: 'json' }
console.log(`Starting ${pkg.name} v${pkg.version} using Bun v${Bun.version} with PID ${process.pid}`)

import homepage from "./public/index.html";

const server = Bun.serve({
  port: process.env.SERVER_PORT || 3000,
  idleTimeout: 60,
  development: {
    hmr: true
  },
  routes: {
    "/": homepage,
    "/api/info": {
      async GET() {
        return Response.json({name: pkg.name, version: pkg.version});
      }
    },
    "/api/system/info": {
      async GET(req) {
        const { SystemInfoCollector } = await import("./src/system/System");
        const info = await SystemInfoCollector.getInfo();
        return Response.json(info);
      }
    },
    "/api/system/stats": {
      async GET() {
        const { SystemInfoCollector } = await import("./src/system/System");
        const stats = await SystemInfoCollector.getStats();
        return Response.json(stats);
      }
    }
  }
})

console.log(`Bun server initialized with port ${server.port} (http)`)
console.log(`Started ${pkg.name} in ${Date.now() - t0}ms`)