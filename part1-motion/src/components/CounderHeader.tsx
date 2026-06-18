import { useRef } from 'react'
import { COUNDER_LINKS } from '../constants/counderLinks'
import { useActiveSection } from '../hooks/useActiveSection'
import { useHeaderScroll } from '../hooks/useHeaderScroll'
import { ScrollLink } from './ScrollLink'
import styles from './CounderHeader.module.css'

function LogoMark() {
  return (
    <svg className={styles.logoMark} viewBox="0 0 35 26" fill="none" aria-hidden="true">
      <circle cx="13" cy="13" r="11.74" stroke="currentColor" strokeWidth="2.39" />
      <circle cx="26" cy="17" r="7.71" stroke="currentColor" strokeWidth="2.44" />
    </svg>
  )
}

function navClass(active: string, id: string) {
  return active === id ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
}

export function CounderHeader() {
  const headerRef = useRef<HTMLElement>(null)
  const active = useActiveSection()
  useHeaderScroll(headerRef)

  return (
    <header ref={headerRef} className={styles.header}>
      <div className={styles.bar}>
        <nav className={`${styles.nav} ${styles.navLeft}`} aria-label="Primary">
          <ScrollLink href="#conference" className={navClass(active, 'conference')}>
            Conference
          </ScrollLink>
          <ScrollLink href="#network" className={navClass(active, 'network')}>
            Network
          </ScrollLink>
          <ScrollLink href="#about" className={navClass(active, 'about')}>
            About
          </ScrollLink>
        </nav>

        <ScrollLink href="#top" className={styles.logoGroup} aria-label="Counder home">
          <LogoMark />
          <span className={styles.wordmark}>Counder</span>
        </ScrollLink>

        <nav className={`${styles.nav} ${styles.navRight}`} aria-label="Secondary">
          <ScrollLink href="#friends" className={`${navClass(active, 'friends')} ${styles.navDesktop}`}>
            Counder &amp; Friends
          </ScrollLink>
          <ScrollLink href="#partners" className={`${navClass(active, 'partners')} ${styles.navDesktop}`}>
            Partner with us
          </ScrollLink>
          <a
            href={COUNDER_LINKS.join}
            className={styles.joinBtn}
            target="_blank"
            rel="noopener noreferrer"
          >
            Join
          </a>
        </nav>
      </div>
    </header>
  )
}
