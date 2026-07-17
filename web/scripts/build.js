const path = require('node:path')
const { spawnSync } = require('node:child_process')

const projectRoot = path.resolve(__dirname, '..')
const vueCliPath = path.join(
  projectRoot,
  'node_modules',
  '@vue',
  'cli-service',
  'bin',
  'vue-cli-service.js'
)

const legacyProviderFlag = '--openssl-legacy-provider'
const nodeOptions = [process.env.NODE_OPTIONS, legacyProviderFlag]
  .filter(Boolean)
  .join(' ')

const buildResult = spawnSync(process.execPath, [vueCliPath, 'build'], {
  cwd: projectRoot,
  env: {
    ...process.env,
    NODE_OPTIONS: nodeOptions
  },
  stdio: 'inherit'
})

if (buildResult.status !== 0) {
  process.exit(buildResult.status || 1)
}

const copyResult = spawnSync(process.execPath, [path.join(projectRoot, '..', 'copy.js')], {
  cwd: projectRoot,
  stdio: 'inherit'
})

process.exit(copyResult.status || 0)
