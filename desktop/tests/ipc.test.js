const test = require('node:test')
const assert = require('node:assert/strict')

const {
  CHANNELS,
  createSyncHandlers,
  registerSyncIpcHandlers
} = require('../src/ipc')

test('createSyncHandlers maps all desktop bridge operations to storage', () => {
  let state = {
    mindMapData: null,
    mindMapConfig: null,
    lang: 'zh',
    localConfig: null
  }
  const handlers = createSyncHandlers({
    readState: () => state,
    writeState: partialState => {
      state = {
        ...state,
        ...partialState
      }
      return state
    }
  })

  assert.equal(handlers[CHANNELS.getLanguage](), 'zh')
  assert.equal(handlers[CHANNELS.saveLanguage]('en'), 'en')
  assert.equal(handlers[CHANNELS.getLanguage](), 'en')

  const mindMapData = { root: { data: { text: 'codex' } } }
  assert.deepEqual(
    handlers[CHANNELS.saveMindMapData](mindMapData),
    mindMapData
  )
  assert.deepEqual(handlers[CHANNELS.getMindMapData](), mindMapData)

  const mindMapConfig = { textAutoWrapWidth: 500 }
  assert.deepEqual(
    handlers[CHANNELS.saveMindMapConfig](mindMapConfig),
    mindMapConfig
  )
  assert.deepEqual(handlers[CHANNELS.getMindMapConfig](), mindMapConfig)

  const localConfig = { isDark: true }
  assert.deepEqual(
    handlers[CHANNELS.saveLocalConfig](localConfig),
    localConfig
  )
  assert.deepEqual(handlers[CHANNELS.getLocalConfig](), localConfig)
})

test('registerSyncIpcHandlers returns sync envelopes and hides error details', () => {
  const listeners = new Map()
  const ipcMain = {
    on: (channel, listener) => listeners.set(channel, listener)
  }
  const handlers = {
    [CHANNELS.getLanguage]: () => 'zh',
    [CHANNELS.saveLanguage]: () => {
      throw new Error('sensitive storage path')
    }
  }

  registerSyncIpcHandlers(ipcMain, handlers, {
    error: () => {}
  })

  const successEvent = {}
  listeners.get(CHANNELS.getLanguage)(successEvent)
  assert.deepEqual(successEvent.returnValue, {
    ok: true,
    value: 'zh'
  })

  const failureEvent = {}
  listeners.get(CHANNELS.saveLanguage)(failureEvent, 'en')
  assert.deepEqual(failureEvent.returnValue, {
    ok: false,
    error: 'Desktop storage operation failed.'
  })
})
