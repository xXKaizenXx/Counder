import { useRef } from 'react'
import { COUNDER_LINKS } from '../constants/counderLinks'
import { useActiveSection } from '../hooks/useActiveSection'
import { useHeaderScroll } from '../hooks/useHeaderScroll'
import { CounderLogoMark } from './CounderLogoMark'
import { ScrollLink } from './ScrollLink'
import styles from './CounderHeader.module.css'

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
          <CounderLogoMark className={styles.logoMark} />
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
