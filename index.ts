var t0 = Date.now()

import pkg from './package.json' assert { type: 'json' }
console.log(`Starting ${pkg.name} v${pkg.version} using Bun v${Bun.version} with PID ${process.pid}`)

const server = Bun.serve({
  port: process.env.SERVER_PORT || 3000,
  async fetch(req) {
    return new Response("Bun!");
  },
})

console.log(`Bun server initialized with port ${server.port} (http)`)
console.log(`Started ${pkg.name} in ${Date.now() - t0}ms`)