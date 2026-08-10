const REGISTERED_NODE_TYPES = new Set([
  'root', 'paragraph', 'text', 'linebreak', 'heading', 'quote', 'list', 'listitem',
  'code', 'code-highlight', 'link', 'autolink', 'horizontalrule', 'table', 'tablerow',
  'tablecell', 'image', 'youtube', 'mermaid',
])

function nodeText(node: Record<string, unknown>): string {
  if (typeof node.text === 'string') return node.text
  if (!Array.isArray(node.children)) return ''
  return node.children.map((child) => child && typeof child === 'object' ? nodeText(child as Record<string, unknown>) : '').join('')
}

function isCodeLikeParagraph(text: string): boolean {
  const value = text.trim()
  return /^(docker compose|docker-compose|npm |pnpm |yarn |git |curl |ssh |psql |java |\.\/|SELECT\b|INSERT\b|UPDATE\b|DELETE\b)/i.test(value) ||
    /^(services|postgres|image|container_name|restart|ports|volumes|environment|networks|depends_on|command|build|healthcheck|[A-Z][A-Z0-9_]+):/.test(value) ||
    /^(docker-compose\.ya?ml|application(-[\w-]+)?\.ya?ml|package\.json|build\.gradle|pom\.xml)$/.test(value)
}

function mergeCodeNodes(nodes: Record<string, unknown>[]): Record<string, unknown>[] {
  const merged: Record<string, unknown>[] = []
  nodes.forEach((node) => {
    const previous = merged[merged.length - 1]
    if (previous?.type === 'code' && node.type === 'code' && Array.isArray(previous.children) && Array.isArray(node.children)) {
      const previousChild = previous.children[previous.children.length - 1] as Record<string, unknown> | undefined
      const nextChild = node.children[0] as Record<string, unknown> | undefined
      if (previousChild && nextChild) {
        previousChild.text = `${String(previousChild.text ?? '')}\n${String(nextChild.text ?? '')}`
        return
      }
    }
    merged.push(node)
  })
  return merged
}

function promoteDocumentStructure(root: Record<string, unknown>): Record<string, unknown> {
  if (!Array.isArray(root.children)) return root
  const output: Record<string, unknown>[] = []
  let codeLines: string[] = []

  const flushCode = () => {
    if (codeLines.length === 0) return
    const source = codeLines.join('\n')
    const language = /^(services|postgres|image|container_name|restart|ports|volumes|environment|networks|depends_on|command|build):/m.test(source) || source.includes('docker-compose') ? 'yaml' : 'plaintext'
    output.push({
      type: 'code', language, theme: null, direction: null, format: '', indent: 0, version: 1,
      children: [{ type: 'code-highlight', detail: 0, format: 0, mode: 'normal', style: '', text: source, version: 1 }],
    })
    codeLines = []
  }

  root.children.forEach((child) => {
    if (!child || typeof child !== 'object') return
    const node = child as Record<string, unknown>
    if (node.type === 'paragraph') {
      const text = nodeText(node)
      if (/^\d+[.)]\s+/.test(text.trim())) {
        flushCode()
        output.push({ ...node, type: 'heading', tag: 'h2' })
        return
      }
      if (isCodeLikeParagraph(text)) {
        codeLines.push(text)
        return
      }
    }
    flushCode()
    output.push(node)
  })
  flushCode()
  return { ...root, children: mergeCodeNodes(output) }
}

function normalizedNode(value: unknown, parentType: string): Record<string, unknown> | null {
  if (!value || typeof value !== 'object') return null
  const source = value as { type?: unknown; text?: unknown; children?: unknown[]; [key: string]: unknown }
  let type = typeof source.type === 'string' && REGISTERED_NODE_TYPES.has(source.type)
    ? source.type
    : undefined

  if (!type && typeof source.text === 'string') {
    if (parentType === 'code') type = 'code-highlight'
    else if (parentType === 'root') type = 'paragraph'
    else type = 'text'
  }
  if (!type && Array.isArray(source.children)) type = 'paragraph'
  if (!type) return null

  if (type === 'paragraph' && !Array.isArray(source.children) && typeof source.text === 'string') {
    return {
      type: 'paragraph', direction: null, format: '', indent: 0, version: 1,
      children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: source.text, version: 1 }],
    }
  }
  if (type === 'text' || type === 'code-highlight') {
    return {
      ...source,
      type,
      text: typeof source.text === 'string' ? source.text : '',
      detail: typeof source.detail === 'number' ? source.detail : 0,
      format: typeof source.format === 'number' ? source.format : 0,
      mode: typeof source.mode === 'string' ? source.mode : 'normal',
      style: typeof source.style === 'string' ? source.style : '',
      version: typeof source.version === 'number' ? source.version : 1,
    }
  }
  if (Array.isArray(source.children)) {
    const children = source.children
      .map((child) => normalizedNode(child, type!))
      .filter((child): child is Record<string, unknown> => Boolean(child))
    if (type === 'paragraph' && children.length > 0) {
      const textChildren = children.filter((child) => child.type === 'text')
      const text = textChildren.map((child) => String(child.text ?? '')).join('')
      const allInlineCode = textChildren.length === children.length &&
        textChildren.every((child) => typeof child.format === 'number' && (child.format & 16) === 16)
      const looksLikeLongCode = text.length >= 24 || /^(https?:\/\/|ssh |curl |npm |pnpm |docker |git )/.test(text)
      if (allInlineCode && looksLikeLongCode) {
        return {
          type: 'code', language: 'plaintext', theme: null, direction: null,
          format: '', indent: 0, version: 1,
          children: textChildren.map((child) => ({ ...child, type: 'code-highlight', format: 0 })),
        }
      }
    }
    return { ...source, type, children }
  }
  return { ...source, type, children: [] }
}

export function normalizeLexicalJson(value: string, promoteStructure = true): string | null {
  try {
    const parsed = JSON.parse(value) as { root?: unknown }
    if (!parsed.root || typeof parsed.root !== 'object') return null
    const root = normalizedNode({ ...(parsed.root as Record<string, unknown>), type: 'root' }, 'root')
    if (!root || !Array.isArray(root.children)) return null
    return JSON.stringify({ ...parsed, root: promoteStructure ? promoteDocumentStructure(root) : root })
  } catch {
    return null
  }
}

function resetNodeFormatting(node: Record<string, unknown>): Record<string, unknown> {
  const type = node.type
  if (type === 'text' || type === 'code-highlight') {
    return { ...node, type: 'text', detail: 0, format: 0, mode: 'normal', style: '' }
  }
  if (type === 'code') {
    const text = Array.isArray(node.children)
      ? node.children.map((child) => (child && typeof child === 'object' ? String((child as Record<string, unknown>).text ?? '') : '')).join('')
      : ''
    return {
      type: 'paragraph', direction: null, format: '', indent: 0, version: 1,
      children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text, version: 1 }],
    }
  }
  const children = Array.isArray(node.children)
    ? node.children.map((child) => child && typeof child === 'object' ? resetNodeFormatting(child as Record<string, unknown>) : child).filter(Boolean)
    : node.children
  return { ...node, children, format: type === 'root' ? node.format : '', indent: 0, direction: node.direction ?? null }
}

export function resetLexicalFormatting(value: string): string | null {
  const normalized = normalizeLexicalJson(value, false)
  if (!normalized) return null
  try {
    const parsed = JSON.parse(normalized) as { root: Record<string, unknown> }
    return JSON.stringify({ ...parsed, root: resetNodeFormatting(parsed.root) })
  } catch {
    return null
  }
}
