const SNAPSHOT_ATTR = 'data-canvas-snapshot'

export function mountCanvasSnapshot(
  wrap: HTMLElement,
  imgClassName: string,
): () => void {
  const glCanvas = wrap.querySelector('canvas')
  if (!glCanvas || !(glCanvas instanceof HTMLCanvasElement)) return () => {}

  const img = document.createElement('img')
  img.className = imgClassName
  img.alt = ''
  img.setAttribute('aria-hidden', 'true')
  img.setAttribute(SNAPSHOT_ATTR, 'true')
  img.decoding = 'sync'

  try {
    img.src = glCanvas.toDataURL('image/png')
  } catch {
    return () => {}
  }

  glCanvas.style.visibility = 'hidden'
  wrap.appendChild(img)

  return () => {
    wrap.querySelector(`img[${SNAPSHOT_ATTR}]`)?.remove()
    glCanvas.style.visibility = ''
  }
}

export function clearCanvasSnapshot(wrap: HTMLElement | null) {
  if (!wrap) return
  const glCanvas = wrap.querySelector('canvas')
  wrap.querySelector(`img[${SNAPSHOT_ATTR}]`)?.remove()
  if (glCanvas instanceof HTMLCanvasElement) {
    glCanvas.style.visibility = ''
  }
}
