import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from 'react'
import { isHashLink, scrollToSection } from '../utils/scrollToSection'

type ScrollLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode
}

export function ScrollLink({ href = '#', onClick, children, ...rest }: ScrollLinkProps) {
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e)
    if (e.defaultPrevented || !href) return

    if (isHashLink(href)) {
      e.preventDefault()
      scrollToSection(href.slice(1))
    }
  }

  return (
    <a href={href} onClick={handleClick} {...rest}>
      {children}
    </a>
  )
}
