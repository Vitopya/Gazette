import type { Newsletter } from '../sections/workspace/types'

export function newsletterToMarkdown(newsletter: Newsletter): string {
  const lines: string[] = []
  lines.push(`# ${newsletter.title}`)
  lines.push('')

  for (const section of newsletter.sections) {
    lines.push(`## ${section.title}`)
    lines.push('')
    for (const item of section.items) {
      lines.push(`### ${item.title}`)
      if (item.description) {
        lines.push(item.description)
      }
      if (item.bullets.length > 0) {
        lines.push('')
        for (const bullet of item.bullets) {
          if (bullet.trim().length === 0) continue
          lines.push(`- ${bullet}`)
        }
      }
      if (item.imageUrl) {
        lines.push('')
        lines.push(`![](${item.imageUrl})`)
      }
      lines.push('')
      lines.push(`[Source : ${item.sourceName}](${item.sourceUrl})`)
      lines.push('')
    }
  }

  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n'
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function newsletterToHtml(newsletter: Newsletter): string {
  const blocks: string[] = []
  const baseFont =
    "font-family: 'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;"

  blocks.push(
    `<h1 style="${baseFont} font-size: 28px; font-weight: 800; color: #18181b; margin: 0 0 24px;">${escapeHtml(newsletter.title)}</h1>`,
  )

  for (const section of newsletter.sections) {
    blocks.push(
      `<h2 style="${baseFont} font-size: 20px; font-weight: 700; color: #0f172a; margin: 32px 0 12px; padding-bottom: 6px; border-bottom: 1px solid #e4e4e7;">${escapeHtml(section.title)}</h2>`,
    )

    for (const item of section.items) {
      blocks.push('<div style="margin: 0 0 24px;">')
      if (item.imageUrl) {
        blocks.push(
          `<img src="${escapeHtml(item.imageUrl)}" alt="" style="max-width: 100%; height: auto; border-radius: 12px; margin: 0 0 12px; display: block;" />`,
        )
      }
      blocks.push(
        `<h3 style="${baseFont} font-size: 17px; font-weight: 700; color: #18181b; margin: 0 0 6px;">${escapeHtml(item.title)}</h3>`,
      )
      if (item.description) {
        blocks.push(
          `<p style="${baseFont} font-size: 14px; line-height: 1.55; color: #3f3f46; margin: 0 0 10px;">${escapeHtml(item.description)}</p>`,
        )
      }
      const bullets = item.bullets.filter((b) => b.trim().length > 0)
      if (bullets.length > 0) {
        blocks.push('<ul style="margin: 0 0 10px; padding-left: 20px;">')
        for (const bullet of bullets) {
          blocks.push(
            `<li style="${baseFont} font-size: 14px; line-height: 1.5; color: #3f3f46; margin: 0 0 4px;">${escapeHtml(bullet)}</li>`,
          )
        }
        blocks.push('</ul>')
      }
      blocks.push(
        `<p style="${baseFont} font-size: 12px; color: #71717a; margin: 8px 0 0;"><a href="${escapeHtml(item.sourceUrl)}" style="color: #0ea5e9; text-decoration: underline;">Source : ${escapeHtml(item.sourceName)}</a></p>`,
      )
      blocks.push('</div>')
    }
  }

  return `<div style="${baseFont} max-width: 720px; color: #18181b;">${blocks.join('\n')}</div>`
}

export async function copyMarkdownToClipboard(newsletter: Newsletter): Promise<void> {
  const markdown = newsletterToMarkdown(newsletter)
  await navigator.clipboard.writeText(markdown)
}

export async function copyHtmlToClipboard(newsletter: Newsletter): Promise<void> {
  const html = newsletterToHtml(newsletter)
  const markdown = newsletterToMarkdown(newsletter)
  if (typeof window !== 'undefined' && 'ClipboardItem' in window) {
    const item = new window.ClipboardItem({
      'text/html': new Blob([html], { type: 'text/html' }),
      'text/plain': new Blob([markdown], { type: 'text/plain' }),
    })
    await navigator.clipboard.write([item])
    return
  }
  await navigator.clipboard.writeText(html)
}
