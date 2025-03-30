#!/usr/bin/env node
import('../dist/main.js').catch(err => {
  console.error('launch Ableton MCP failed:', err)
  globalThis.process.exit(1)
})