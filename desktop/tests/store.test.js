const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')

const {
  createDefaultStoreState,
  readStore,
  writeStore
} = require('../src/store')

test('createDefaultStoreState returns the expected desktop defaults', () => {
  assert.deepEqual(createDefaultStoreState(), {
    mindMapData: null,
    mindMapConfig: null,
    lang: 'zh',
    localConfig: null
  })
})

test('readStore falls back to defaults when the store file does not exist', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mind-map-store-'))
  const storePath = path.join(tempDir, 'store.json')

  assert.deepEqual(readStore(storePath), createDefaultStoreState())
})

test('writeStore persists values and keeps unspecified fields at their defaults', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mind-map-store-'))
  const storePath = path.join(tempDir, 'store.json')

  writeStore(storePath, {
    lang: 'en',
    localConfig: {
      isDark: true
    }
  })
  writeStore(storePath, {
    mindMapConfig: {
      textAutoWrapWidth: 500
    }
  })

  assert.deepEqual(readStore(storePath), {
    mindMapData: null,
    mindMapConfig: {
      textAutoWrapWidth: 500
    },
    lang: 'en',
    localConfig: {
      isDark: true
    }
  })
  assert.equal(
    fs.readdirSync(tempDir).some(file => file.endsWith('.tmp')),
    false
  )
})
