const isAllowedExternalUrl = url => {
  try {
    const { protocol } = new URL(url)
    return protocol === 'https:' || protocol === 'http:'
  } catch (error) {
    return false
  }
}

const secureWindowNavigation = (win, openExternal) => {
  const openAllowedUrl = url => {
    if (isAllowedExternalUrl(url)) {
      openExternal(url)
    }
  }

  win.webContents.setWindowOpenHandler(({ url }) => {
    openAllowedUrl(url)
    return { action: 'deny' }
  })
  win.webContents.on('will-navigate', (event, url) => {
    event.preventDefault()
    openAllowedUrl(url)
  })
}

module.exports = {
  isAllowedExternalUrl,
  secureWindowNavigation
}
