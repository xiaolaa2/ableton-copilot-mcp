#!/usr/bin/env node

const args = globalThis.process.argv.slice(2)
const isInstallScripts = args.includes('--install-scripts') || args.includes('-is')

if (isInstallScripts) {
  console.log('Installing Ableton JS MIDI Remote Scripts...')
  import('../dist/utils/install-scripts.js').then(({ installAbletonJsScripts }) => {
    try {
      installAbletonJsScripts()
      console.log('Ableton JS MIDI Remote Scripts installed successfully')
      globalThis.process.exit(0)
    } catch (error) {
      console.error('Failed to install Ableton JS MIDI Remote Scripts:', error)
      globalThis.process.exit(1)
    }
  }).catch(err => {
    console.error('Failed to import installation module:', err)
    globalThis.process.exit(1)
  })
} else {
  import('../dist/main.js').catch(err => {
    console.error('launch Ableton MCP failed:', err)
    globalThis.process.exit(1)
  })
}