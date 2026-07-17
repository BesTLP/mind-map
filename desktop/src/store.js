const fs = require('node:fs')
const path = require('node:path')

const createDefaultStoreState = () => {
  return {
    mindMapData: null,
    mindMapConfig: null,
    lang: 'zh',
    localConfig: null
  }
}

const normalizeStoreState = state => {
  return {
    ...createDefaultStoreState(),
    ...(state && typeof state === 'object' ? state : {})
  }
}

const readStore = storePath => {
  if (!fs.existsSync(storePath)) {
    return createDefaultStoreState()
  }

  try {
    return normalizeStoreState(
      JSON.parse(fs.readFileSync(storePath, 'utf8'))
    )
  } catch (error) {
    return createDefaultStoreState()
  }
}

const writeStoreFile = (storePath, state) => {
  const tempPath = `${storePath}.${process.pid}.tmp`
  try {
    fs.writeFileSync(tempPath, JSON.stringify(state, null, 2), 'utf8')
    fs.renameSync(tempPath, storePath)
  } catch (error) {
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath)
    }
    throw error
  }
}

const writeStore = (storePath, partialState) => {
  const nextState = normalizeStoreState({
    ...readStore(storePath),
    ...(partialState && typeof partialState === 'object' ? partialState : {})
  })

  fs.mkdirSync(path.dirname(storePath), {
    recursive: true
  })
  writeStoreFile(storePath, nextState)

  return nextState
}

module.exports = {
  createDefaultStoreState,
  readStore,
  writeStore
}
