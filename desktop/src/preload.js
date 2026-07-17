const { contextBridge, ipcRenderer } = require('electron')

const sendSync = (channel, payload) => {
  const response = ipcRenderer.sendSync(channel, payload)
  if (!response || response.ok !== true) {
    throw new Error(
      response && response.error
        ? response.error
        : 'Desktop storage operation failed.'
    )
  }
  return response.value
}

contextBridge.exposeInMainWorld('takeOverApp', true)
contextBridge.exposeInMainWorld('takeOverAppMethods', {
  getMindMapData: () => sendSync('mind-map:getMindMapData'),
  saveMindMapData: data => sendSync('mind-map:saveMindMapData', data),
  getMindMapConfig: () => sendSync('mind-map:getMindMapConfig'),
  saveMindMapConfig: config => sendSync('mind-map:saveMindMapConfig', config),
  getLanguage: () => sendSync('mind-map:getLanguage'),
  saveLanguage: lang => sendSync('mind-map:saveLanguage', lang),
  getLocalConfig: () => sendSync('mind-map:getLocalConfig'),
  saveLocalConfig: config => sendSync('mind-map:saveLocalConfig', config)
})
