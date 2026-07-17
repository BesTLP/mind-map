import { describe, expect, it } from 'vitest'
import {
  tokenizeWrapLine,
  wrapTextForDisplay
} from '../src/core/render/node/textWrap.js'

const measureText = text => ({
  width: text.length * 10
})

describe('wrapTextForDisplay', () => {
  it('keeps continuous English text as one token and wraps on spaces', () => {
    const result = wrapTextForDisplay({
      text: 'codex test demo',
      maxWidth: 50,
      measureText
    })

    expect(result.lines).toEqual(['codex', 'test', 'demo'])
    expect(result.isMultiLine).toBe(true)
  })

  it('keeps a single long English word intact and expands effective width', () => {
    const result = wrapTextForDisplay({
      text: 'codex',
      maxWidth: 20,
      measureText
    })

    expect(result.lines).toEqual(['codex'])
    expect(result.effectiveMaxWidth).toBe(50)
  })

  it('still wraps Chinese text by character width', () => {
    const result = wrapTextForDisplay({
      text: '你好世界',
      maxWidth: 20,
      measureText
    })

    expect(result.lines).toEqual(['你好', '世界'])
  })

  it('preserves explicit newlines while wrapping each line independently', () => {
    const result = wrapTextForDisplay({
      text: 'codex test\ndemo',
      maxWidth: 50,
      measureText
    })

    expect(result.lines).toEqual(['codex', 'test', 'demo'])
    expect(result.sourceLineCount).toBe(2)
    expect(result.isMultiLine).toBe(true)
  })

  it('handles mixed Chinese and English without splitting the English token', () => {
    const result = wrapTextForDisplay({
      text: '中codex文',
      maxWidth: 30,
      measureText
    })

    expect(result.lines).toEqual(['中', 'codex', '文'])
    expect(result.effectiveMaxWidth).toBe(50)
  })

  it('keeps non-ASCII words intact while CJK characters remain breakable', () => {
    expect(tokenizeWrapLine('中café résumé文')).toEqual([
      '中',
      'café',
      ' ',
      'résumé',
      '文'
    ])
  })
})
