import fs from 'fs'
import path from 'path'

const rootDir = './src' // Change to your root directory

function toCamelCase(str) {
  return str
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .split(' ')
    .map((word, i) =>
      i === 0 ? word.toLowerCase() : word[0].toUpperCase() + word.slice(1).toLowerCase()
    )
    .join('')
}

function pluralize(str) {
  // Simple pluralization: lowercase and add 's'
  if (str.endsWith('y')) return str.slice(0, -1) + 'ies'
  return str + 's'
}

function getEntityFromFilename(filename) {
  const base = path.basename(filename).replace(/DataGrid\.tsx$/, '')
  const camel = toCamelCase(base)
  return pluralize(camel)
}

function processFile(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf-8')
  const entity = getEntityFromFilename(filePath)

  const updatedContent = fileContent.replace(/label:\s*"([^"]+)",/g, (_, labelText) => {
    const key = toCamelCase(labelText)
    return `label: t("${entity}.headers.${key}"),`
  })

  fs.writeFileSync(filePath, updatedContent, 'utf-8')
  console.log(`✅ Updated: ${filePath}`)
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      walk(fullPath)
    } else if (entry.isFile() && entry.name.endsWith('DataGrid.tsx')) {
      processFile(fullPath)
    }
  }
}

walk(rootDir)
