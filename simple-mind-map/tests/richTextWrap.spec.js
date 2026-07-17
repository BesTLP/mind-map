// @vitest-environment jsdom

import { describe, expect, it } from 'vitest'
import { nodeRichTextToTextWithWrap } from '../src/utils/index.js'
import { wrapTextForDisplay } from '../src/core/render/node/textWrap.js'

const measureText = text => ({
  width: text.length * 10
})

describe('rich text wrapping', () => {
  it('keeps English words intact after converting rich text to plain text', () => {
    const text = nodeRichTextToTextWithWrap('<p>codex test</p>')
    const result = wrapTextForDisplay({
      text,
      maxWidth: 50,
      measureText
    })

    expect(result.lines).toEqual(['codex', 'test'])
    expect(result.effectiveMaxWidth).toBe(50)
  })
})
