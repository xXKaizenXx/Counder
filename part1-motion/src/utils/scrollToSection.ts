const HEADER_OFFSET = 72

export function scrollToSection(id: string, behavior: ScrollBehavior = 'smooth') {
  const el = document.getElementById(id)
  if (!el) return false

  const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET
  window.scrollTo({ top: Math.max(0, top), behavior })
  return true
}

export function isHashLink(href: string) {
  return href.startsWith('#') && href.length > 1
}
