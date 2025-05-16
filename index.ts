var t0 = Date.now()

import pkg from './package.json' assert { type: 'json' }
console.log(`Starting ${pkg.name} v${pkg.version} using Bun v${Bun.version} with PID ${process.pid}`)

import homepage from "./public/index.html";

const server = Bun.serve({
  port: process.env.SERVER_PORT || 3000,
  routes: {
    "/": homepage,
    "/api/info": {
      async GET() {
        return Response.json({name: pkg.name, version: pkg.version});
      }
    },
    "/api/system": {
      async GET() {
        const { SystemInfoCollector } = await import("./src/monitors/System");
        return Response.json(SystemInfoCollector.getSystemInfo());
      }
    }
  }
})

console.log(`Bun server initialized with port ${server.port} (http)`)
console.log(`Started ${pkg.name} in ${Date.now() - t0}ms`)