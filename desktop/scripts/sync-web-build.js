const fs = require('node:fs')
const path = require('node:path')

const rootDir = path.resolve(__dirname, '..', '..')
const sourceIndexPath = path.join(rootDir, 'index.html')
const sourceDistPath = path.join(rootDir, 'dist')
const targetAppPath = path.join(__dirname, '..', 'app')
const targetDistPath = path.join(targetAppPath, 'dist')

const copyDirectory = (sourcePath, targetPath) => {
  fs.mkdirSync(targetPath, {
    recursive: true
  })

  fs.readdirSync(sourcePath, {
    withFileTypes: true
  }).forEach(entry => {
    const sourceEntryPath = path.join(sourcePath, entry.name)
    const targetEntryPath = path.join(targetPath, entry.name)

    if (entry.isDirectory()) {
      copyDirectory(sourceEntryPath, targetEntryPath)
      return
    }

    fs.copyFileSync(sourceEntryPath, targetEntryPath)
  })
}

if (!fs.existsSync(sourceIndexPath) || !fs.existsSync(sourceDistPath)) {
  throw new Error(
    'Web build output is missing. Run "npm run build:web" in desktop first.'
  )
}

fs.rmSync(targetAppPath, {
  recursive: true,
  force: true
})
fs.mkdirSync(targetAppPath, {
  recursive: true
})
fs.copyFileSync(sourceIndexPath, path.join(targetAppPath, 'index.html'))
copyDirectory(sourceDistPath, targetDistPath)
