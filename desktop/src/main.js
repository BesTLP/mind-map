const path = require('node:path')
const os = require('node:os')
const { app, BrowserWindow, ipcMain, shell } = require('electron')
const { createSyncHandlers, registerSyncIpcHandlers } = require('./ipc')
const { secureWindowNavigation } = require('./navigation')
const { readStore, writeStore } = require('./store')

const isSmokeTest = process.argv.includes('--smoke-test')

if (isSmokeTest) {
  app.setPath(
    'userData',
    path.join(os.tmpdir(), `mind-map-desktop-smoke-${process.pid}`)
  )
}

const createStorePath = () => {
  return path.join(app.getPath('userData'), 'mind-map-store.json')
}

const readState = () => {
  return readStore(createStorePath())
}

const writeState = partialState => {
  return writeStore(createStorePath(), partialState)
}

const registerIpcHandlers = () => {
  const handlers = createSyncHandlers({ readState, writeState })
  registerSyncIpcHandlers(ipcMain, handlers)
}

const runSmokeTest = win => {
  win.webContents.once('did-finish-load', async () => {
    try {
      const result = await win.webContents.executeJavaScript(`
        new Promise(resolve => {
          const deadline = Date.now() + 10000
          const readState = () => {
            const storedData = window.takeOverAppMethods?.getMindMapData()
            return {
              takeOverApp: window.takeOverApp === true,
              hasBridge:
                typeof window.takeOverAppMethods?.getMindMapData === 'function',
              language: window.takeOverAppMethods?.getLanguage(),
              appMounted: document.querySelector('#app')?.children.length > 0,
              nodeCount: document.querySelectorAll('.smm-node').length,
              storedDataComplete: Boolean(
                storedData?.root &&
                  storedData?.layout &&
                  storedData?.theme?.template
              )
            }
          }
          const checkApp = () => {
            const state = readState()
            if (state.nodeCount > 0 || Date.now() >= deadline) {
              resolve(state)
              return
            }
            setTimeout(checkApp, 100)
          }
          checkApp()
        })
      `)
      const passed =
        result.takeOverApp &&
        result.hasBridge &&
        result.language === 'zh' &&
        result.appMounted &&
        result.nodeCount > 0 &&
        result.storedDataComplete

      console.log('Desktop smoke result:', JSON.stringify(result))
      app.exit(passed ? 0 : 1)
    } catch (error) {
      console.error('Desktop smoke test failed.', error)
      app.exit(1)
    }
  })
}

const createMainWindow = () => {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 720,
    show: false,
    backgroundColor: '#ffffff',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  })

  if (isSmokeTest) {
    runSmokeTest(win)
  } else {
    win.once('ready-to-show', () => {
      win.show()
    })
  }

  secureWindowNavigation(win, url => {
    shell.openExternal(url).catch(error => {
      console.error('Failed to open external URL.', error)
    })
  })

  win.loadFile(path.join(__dirname, '..', 'app', 'index.html'))
}

app.whenReady().then(() => {
  app.on('web-contents-created', (_, contents) => {
    contents.session.setPermissionRequestHandler((_, __, callback) => {
      callback(false)
    })
  })
  registerIpcHandlers()
  if (isSmokeTest) {
    writeState({
      mindMapData: {
        root: {
          data: {
            text: 'smoke root'
          },
          children: []
        }
      }
    })
  }
  createMainWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
