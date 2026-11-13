#!/usr/bin/env bun
/**
 * Agent context gate — keeps AGENTS.md authoritative and enforceable.
 *
 * Checks:
 *   1. MISSING_AGENTS      — root AGENTS.md is absent
 *   2. AGENTS_TOO_LONG     — AGENTS.md exceeds 200 lines
 *   3. BROKEN_LINK         — a relative link in an AGENTS.md does not resolve
 *   4. CLAUDE_COPY         — CLAUDE.md exists but is not exactly @AGENTS.md
 *   5. LEGACY_CURSORRULES  — .cursorrules still exists
 *   6. TRACKED_GENERATED   — src/api/generated is tracked
 *   7. TRACKED_SECRET      — a .env* file other than .env.example is tracked
 *   8. SKILL_FRONTMATTER   — .claude/skills/<name>/SKILL.md lacks name/description
 *
 * Usage:
 *   bun run scripts/check_agents.ts
 *   bun run scripts/check_agents.ts --json
 *
 * Exit: 0 = clean, 1 = violations found.
 */

import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { argv, exit } from 'node:process'
import { parseArgs } from 'node:util'

const PROJECT_ROOT = new URL('..', import.meta.url).pathname
const MAX_AGENTS_LINES = 200
const ALLOWED_ENV_FILES: Record<string, true> = { '.env.example': true }

const IGNORED_DIRS: Record<string, true> = {
  '.git': true,
  node_modules: true,
  dist: true,
  coverage: true,
  'playwright-report': true,
  'test-results': true,
  'blob-report': true,
  'src/api/generated': true,
}

const MARKDOWN_LINK = /!?\[[^\]]*\]\(\s*(<[^>]*>|[^)\s]+)(?:\s+["'][^"']*["'])?\s*\)/g

interface Violation {
  check: string
  filepath: string
  line: number
  message: string
}

function collectAgentsFiles(): string[] {
  const files: string[] = []

  function walk(dir: string): void {
    let entries
    try {
      entries = readdirSync(dir, { withFileTypes: true })
    } catch {
      return
    }
    for (const entry of entries) {
      const full = join(dir, entry.name)
      const relPath = relative(PROJECT_ROOT, full)
      if (entry.isDirectory()) {
        if (IGNORED_DIRS[entry.name] || IGNORED_DIRS[relPath]) continue
        walk(full)
      } else if (entry.name === 'AGENTS.md') {
        files.push(full)
      }
    }
  }

  walk(PROJECT_ROOT)
  return files
}

function collectTrackedFiles(): string[] | null {
  const result = spawnSync('git', ['ls-files', '-z'], {
    cwd: PROJECT_ROOT,
    encoding: 'utf-8',
  })
  if (result.status !== 0 || typeof result.stdout !== 'string') return null
  return result.stdout.split('\0').filter(Boolean)
}

function isExternal(target: string): boolean {
  return /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(target)
}

function checkLinks(filepath: string): Violation[] {
  const violations: Violation[] = []
  const text = readFileSync(filepath, 'utf-8')
  const fileDir = dirname(filepath)

  for (const match of text.matchAll(MARKDOWN_LINK)) {
    let target = match[1] ?? ''
    if (target.startsWith('<') && target.endsWith('>')) {
      target = target.slice(1, -1)
    }
    if (!target || isExternal(target)) continue

    const withoutFragment = target.split('#')[0].split('?')[0]
    if (!withoutFragment) continue

    const resolved = withoutFragment.startsWith('/')
      ? join(PROJECT_ROOT, withoutFragment.slice(1))
      : resolve(fileDir, withoutFragment)
    if (existsSync(resolved)) continue

    const line = text.slice(0, match.index ?? 0).split('\n').length
    violations.push({
      check: 'BROKEN_LINK',
      filepath: relative(PROJECT_ROOT, filepath),
      line,
      message: `"${target}" does not resolve`,
    })
  }

  return violations
}

function checkAgentsFiles(): Violation[] {
  const violations: Violation[] = []
  const rootAgents = join(PROJECT_ROOT, 'AGENTS.md')

  if (!existsSync(rootAgents)) {
    violations.push({
      check: 'MISSING_AGENTS',
      filepath: 'AGENTS.md',
      line: 0,
      message: 'root AGENTS.md is missing; it is the single source of agent rules',
    })
  }

  for (const filepath of collectAgentsFiles()) {
    const lines = readFileSync(filepath, 'utf-8').split('\n').length
    if (lines > MAX_AGENTS_LINES) {
      violations.push({
        check: 'AGENTS_TOO_LONG',
        filepath: relative(PROJECT_ROOT, filepath),
        line: MAX_AGENTS_LINES + 1,
        message: `${lines} lines — keep AGENTS.md under ${MAX_AGENTS_LINES} and move detail into docs/`,
      })
    }
    violations.push(...checkLinks(filepath))
  }

  return violations
}

function checkLegacyFiles(): Violation[] {
  const violations: Violation[] = []
  const claudePath = join(PROJECT_ROOT, 'CLAUDE.md')

  if (existsSync(claudePath)) {
    const content = readFileSync(claudePath, 'utf-8').trim()
    if (content !== '@AGENTS.md') {
      violations.push({
        check: 'CLAUDE_COPY',
        filepath: 'CLAUDE.md',
        line: 1,
        message: 'CLAUDE.md must be absent or contain only "@AGENTS.md"',
      })
    }
  }

  if (existsSync(join(PROJECT_ROOT, '.cursorrules'))) {
    violations.push({
      check: 'LEGACY_CURSORRULES',
      filepath: '.cursorrules',
      line: 1,
      message: 'legacy .cursorrules — move the content into AGENTS.md and delete this file',
    })
  }

  return violations
}

function checkTrackedFiles(tracked: string[]): Violation[] {
  const violations: Violation[] = []

  if (
    tracked.some((path) => path === 'src/api/generated' || path.startsWith('src/api/generated/'))
  ) {
    violations.push({
      check: 'TRACKED_GENERATED',
      filepath: 'src/api/generated',
      line: 0,
      message: 'generated client is tracked; it is a build artifact — untrack it',
    })
  }

  for (const path of tracked) {
    const name = path.split('/').pop() ?? path
    if (name.startsWith('.env') && !ALLOWED_ENV_FILES[name]) {
      violations.push({
        check: 'TRACKED_SECRET',
        filepath: path,
        line: 0,
        message: 'environment file is tracked; remove it and keep secrets local',
      })
    }
  }

  return violations
}

function checkSkills(): Violation[] {
  const violations: Violation[] = []
  const skillsDir = join(PROJECT_ROOT, '.claude', 'skills')
  if (!existsSync(skillsDir)) return violations

  for (const entry of readdirSync(skillsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const filepath = join(skillsDir, entry.name, 'SKILL.md')
    const display = relative(PROJECT_ROOT, filepath)

    if (!existsSync(filepath)) {
      violations.push({
        check: 'SKILL_FRONTMATTER',
        filepath: display,
        line: 0,
        message: 'SKILL.md is missing or a broken symlink',
      })
      continue
    }

    const text = readFileSync(filepath, 'utf-8')
    const frontmatter = text.match(/^---\r?\n([\s\S]*?)\r?\n---/)
    const body = frontmatter?.[1] ?? ''
    const missing: string[] = []
    if (!/^name:\s*\S+/m.test(body)) missing.push('name')
    if (!/^description:\s*\S+/m.test(body)) missing.push('description')

    if (missing.length) {
      violations.push({
        check: 'SKILL_FRONTMATTER',
        filepath: display,
        line: 1,
        message: `frontmatter is missing ${missing.join(' and ')}`,
      })
    }
  }

  return violations
}

function main(): number {
  const { values } = parseArgs({
    args: argv.slice(2),
    options: {
      json: { type: 'boolean', default: false },
    },
    strict: false,
  })

  const tracked = collectTrackedFiles()
  const violations: Violation[] = [
    ...checkAgentsFiles(),
    ...checkLegacyFiles(),
    ...(tracked ? checkTrackedFiles(tracked) : []),
    ...checkSkills(),
  ]

  if (values.json) {
    console.log(
      JSON.stringify(
        {
          violations: violations.map((v) => ({
            check: v.check,
            file: v.filepath,
            line: v.line,
            message: v.message,
          })),
          count: violations.length,
        },
        null,
        2
      )
    )
  } else {
    if (violations.length === 0) {
      console.log('All agent context checks passed.')
    }
    for (const v of violations) {
      console.log(`[${v.check}] ${v.filepath}:${v.line} — ${v.message}`)
    }
    console.log(
      violations.length ? `\n${violations.length} violation(s) found.` : '\n0 violations.'
    )
  }

  return violations.length ? 1 : 0
}

exit(main())
