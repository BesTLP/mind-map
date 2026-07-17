const BREAK_LINE_REGEX = /\n/gim
const WHITESPACE_REGEX = /^\s+$/

const getMeasuredWidth = measured => {
  if (typeof measured === 'number') {
    return measured
  }
  if (measured && typeof measured.width === 'number') {
    return measured.width
  }
  return 0
}

const isCjkChar = char => {
  const codePoint = char.codePointAt(0)
  return (
    (codePoint >= 0x3400 && codePoint <= 0x4dbf) ||
    (codePoint >= 0x4e00 && codePoint <= 0x9fff) ||
    (codePoint >= 0xf900 && codePoint <= 0xfaff) ||
    (codePoint >= 0x20000 && codePoint <= 0x2fa1f) ||
    (codePoint >= 0x3040 && codePoint <= 0x30ff) ||
    (codePoint >= 0xac00 && codePoint <= 0xd7af)
  )
}

const trimLineEnd = line => {
  return line.replace(/\s+$/g, '')
}

export const tokenizeWrapLine = line => {
  const text = String(line || '')
  const tokens = []
  let currentWordToken = ''
  let currentWhitespaceToken = ''

  const flushWordToken = () => {
    if (!currentWordToken) return
    tokens.push(currentWordToken)
    currentWordToken = ''
  }

  const flushWhitespaceToken = () => {
    if (!currentWhitespaceToken) return
    tokens.push(currentWhitespaceToken)
    currentWhitespaceToken = ''
  }

  for (const char of text) {
    if (/\s/.test(char)) {
      flushWordToken()
      currentWhitespaceToken += char
      continue
    }

    flushWhitespaceToken()
    if (isCjkChar(char)) {
      flushWordToken()
      tokens.push(char)
    } else {
      currentWordToken += char
    }
  }

  flushWordToken()
  flushWhitespaceToken()

  return tokens
}

export const wrapTextForDisplay = ({ text, maxWidth, measureText }) => {
  const sourceLines =
    text === null || text === undefined
      ? []
      : String(text).split(BREAK_LINE_REGEX)
  const safeMaxWidth = Number(maxWidth) || 0
  let effectiveMaxWidth = safeMaxWidth
  let isMultiLine = sourceLines.length > 1
  const lines = []

  sourceLines.forEach(sourceLine => {
    const tokens = tokenizeWrapLine(sourceLine)
    if (tokens.length <= 0) {
      lines.push('')
      return
    }

    let currentLine = ''
    tokens.forEach(token => {
      const isWhitespace = WHITESPACE_REGEX.test(token)
      if (!isWhitespace) {
        effectiveMaxWidth = Math.max(
          effectiveMaxWidth,
          getMeasuredWidth(measureText(token))
        )
      }

      if (currentLine === '') {
        if (!isWhitespace) {
          currentLine = token
        }
        return
      }

      const nextLine = currentLine + token
      if (getMeasuredWidth(measureText(nextLine)) <= effectiveMaxWidth) {
        currentLine = nextLine
      } else {
        lines.push(trimLineEnd(currentLine))
        currentLine = isWhitespace ? '' : token
      }
    })

    lines.push(trimLineEnd(currentLine))
  })

  if (lines.length > sourceLines.length) {
    isMultiLine = true
  }

  return {
    lines,
    isMultiLine,
    effectiveMaxWidth,
    sourceLineCount: sourceLines.length
  }
}
