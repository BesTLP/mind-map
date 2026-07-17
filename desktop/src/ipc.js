const CHANNELS = Object.freeze({
  getMindMapData: 'mind-map:getMindMapData',
  saveMindMapData: 'mind-map:saveMindMapData',
  getMindMapConfig: 'mind-map:getMindMapConfig',
  saveMindMapConfig: 'mind-map:saveMindMapConfig',
  getLanguage: 'mind-map:getLanguage',
  saveLanguage: 'mind-map:saveLanguage',
  getLocalConfig: 'mind-map:getLocalConfig',
  saveLocalConfig: 'mind-map:saveLocalConfig'
})

const createSyncHandlers = ({ readState, writeState }) => {
  return {
    [CHANNELS.getMindMapData]: () => readState().mindMapData,
    [CHANNELS.saveMindMapData]: data => {
      return writeState({ mindMapData: data }).mindMapData
    },
    [CHANNELS.getMindMapConfig]: () => readState().mindMapConfig,
    [CHANNELS.saveMindMapConfig]: config => {
      return writeState({ mindMapConfig: config }).mindMapConfig
    },
    [CHANNELS.getLanguage]: () => readState().lang,
    [CHANNELS.saveLanguage]: lang => writeState({ lang }).lang,
    [CHANNELS.getLocalConfig]: () => readState().localConfig,
    [CHANNELS.saveLocalConfig]: config => {
      return writeState({ localConfig: config }).localConfig
    }
  }
}

const registerSyncIpcHandlers = (ipcMain, handlers, logger = console) => {
  Object.entries(handlers).forEach(([channel, handler]) => {
    ipcMain.on(channel, (event, payload) => {
      try {
        event.returnValue = {
          ok: true,
          value: handler(payload)
        }
      } catch (error) {
        logger.error(`Desktop IPC failed for ${channel}`, error)
        event.returnValue = {
          ok: false,
          error: 'Desktop storage operation failed.'
        }
      }
    })
  })
}

module.exports = {
  CHANNELS,
  createSyncHandlers,
  registerSyncIpcHandlers
}
