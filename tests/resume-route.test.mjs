import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(new URL('../' + path, import.meta.url))
const checksum = (bytes) => createHash('sha256').update(bytes).digest('hex')
const resumePath = 'AJ-Miller-T-Perez-Resume.pdf'

test('résumé opens the existing local asset without relying on a third-party URL', () => {
  const source = read('src/App.jsx').toString('utf8')
  assert.match(source, /resumeUrl:\s*'\/AJ-Miller-T-Perez-Resume\.pdf'/)
  assert.doesNotMatch(source, /raw\.githubusercontent\.com\/peremiller\/aj-miller-t-perez/)
  assert.match(source, /href=\{profile\.resumeUrl\}/)
  assert.match(source, /aria-label="Résumé PDF \(opens in a new tab\)"/)
  assert.match(source, /target="_blank"/)
  assert.match(source, /rel="noreferrer"/)
})

test('mobile navigation moves focus into the opened menu and restores toggle focus on Escape', () => {
  const source = read('src/App.jsx').toString('utf8')
  assert.match(source, /aria-expanded=\{menuOpen\}/)
  assert.match(source, /ref=\{linksRef\}/)
  assert.match(source, /if \(!menuOpen \|\| window\.innerWidth > 720\) return/)
  assert.match(source, /linksRef\.current\?\.querySelector\('a'\)\?\.focus\(\)/)
  assert.match(source, /event\.key === 'Escape'/)
  assert.match(source, /menuButtonRef\.current\?\.focus\(\)/)
})

test('existing résumé PDF is included byte-for-byte in the production Vite build', () => {
  const original = read('public/' + resumePath)
  const bundled = read('dist/' + resumePath)
  assert.ok(original.length > 1000, 'expected an actual PDF, not a placeholder')
  assert.equal(original.subarray(0, 5).toString('ascii'), '%PDF-')
  assert.equal(checksum(bundled), checksum(original))
  const html = read('dist/index.html').toString('utf8')
  assert.match(html, /<html\b/i)
})
