const test = require('node:test')
const assert = require('node:assert/strict')

const {
  isAllowedExternalUrl,
  secureWindowNavigation
} = require('../src/navigation')

test('isAllowedExternalUrl only accepts HTTP and HTTPS URLs', () => {
  assert.equal(isAllowedExternalUrl('https://example.com'), true)
  assert.equal(isAllowedExternalUrl('http://example.com/path'), true)
  assert.equal(isAllowedExternalUrl('file:///etc/passwd'), false)
  assert.equal(isAllowedExternalUrl('javascript:alert(1)'), false)
  assert.equal(isAllowedExternalUrl('not a url'), false)
})

test('secureWindowNavigation denies in-app navigation and opens safe URLs', () => {
  const listeners = new Map()
  let windowOpenHandler = null
  const openedUrls = []
  const win = {
    webContents: {
      setWindowOpenHandler: handler => {
        windowOpenHandler = handler
      },
      on: (event, listener) => listeners.set(event, listener)
    }
  }
  secureWindowNavigation(win, url => openedUrls.push(url))

  assert.deepEqual(windowOpenHandler({ url: 'https://example.com' }), {
    action: 'deny'
  })
  assert.deepEqual(windowOpenHandler({ url: 'javascript:alert(1)' }), {
    action: 'deny'
  })

  let prevented = false
  listeners.get('will-navigate')(
    {
      preventDefault: () => {
        prevented = true
      }
    },
    'http://example.com/docs'
  )

  assert.equal(prevented, true)
  assert.deepEqual(openedUrls, [
    'https://example.com',
    'http://example.com/docs'
  ])
})
