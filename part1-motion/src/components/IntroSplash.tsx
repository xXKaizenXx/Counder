import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { CounderLogoMark } from './CounderLogoMark'
import styles from './IntroSplash.module.css'

interface IntroSplashProps {
  onComplete: () => void
}

export function IntroSplash({ onComplete }: IntroSplashProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const wordmarkRef = useRef<HTMLParagraphElement>(null)
  const shineRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const overlay = overlayRef.current
    const panel = panelRef.current
    const logo = logoRef.current
    const glow = glowRef.current
    const wordmark = wordmarkRef.current
    const shine = shineRef.current
    if (!overlay || !panel || !logo || !glow || !wordmark || !shine) return

    const tl = gsap.timeline({
      onComplete,
      defaults: { ease: 'power3.out' },
    })

    gsap.set(overlay, { opacity: 1 })
    gsap.set(panel, { xPercent: 0 })
    gsap.set(shine, { xPercent: -120, opacity: 0 })
    gsap.set(logo, { opacity: 0, scale: 0.9, y: 8 })
    gsap.set(glow, { opacity: 0, scale: 0.82 })
    gsap.set(wordmark, { opacity: 0, y: 6 })

    tl.to(glow, { opacity: 1, scale: 1, duration: 0.42, ease: 'sine.out' }, 0)
      .to(logo, { opacity: 1, scale: 1, y: 0, duration: 0.38 }, 0.04)
      .to(wordmark, { opacity: 1, y: 0, duration: 0.32 }, 0.1)
      .to(
        glow,
        {
          scale: 1.08,
          opacity: 0.85,
          duration: 0.2,
          repeat: 1,
          yoyo: true,
          ease: 'sine.inOut',
        },
        0.38,
      )
      .to(shine, { opacity: 0.85, duration: 0.08 }, 0.78)
      .to(
        panel,
        {
          xPercent: 105,
          duration: 0.58,
          ease: 'power4.inOut',
        },
        0.78,
      )
      .to(
        shine,
        {
          xPercent: 30,
          duration: 0.58,
          ease: 'power4.inOut',
        },
        0.78,
      )
      .to(overlay, { opacity: 0, duration: 0.14, ease: 'power2.in' }, '-=0.12')

    return () => {
      tl.kill()
    }
  }, [onComplete])

  return (
    <div ref={overlayRef} className={styles.overlay} aria-hidden="true">
      <div ref={panelRef} className={styles.panel}>
        <div ref={shineRef} className={styles.shine} />
        <div className={styles.center}>
          <div ref={glowRef} className={styles.glow} />
          <div ref={logoRef} className={styles.logoWrap}>
            <CounderLogoMark className={styles.logo} />
          </div>
          <p ref={wordmarkRef} className={styles.wordmark}>
            Counder
          </p>
        </div>
      </div>
    </div>
  )
}
