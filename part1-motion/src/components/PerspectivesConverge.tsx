import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { FocusedNodeInfo } from './NetworkScene'
import type { ThemeMode } from '../utils/sceneTheme'
import { NETWORK_CITIES } from '../utils/networkGraph'
import styles from './PerspectivesConverge.module.css'

const NetworkCanvas = lazy(() =>
  import('./NetworkCanvas').then((m) => ({ default: m.NetworkCanvas })),
)

gsap.registerPlugin(ScrollTrigger)

function CounderRings({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 82 62" fill="none" aria-hidden="true">
      <path
        d="M44.8437 51.9406C40.8525 54.59 36.0635 56.1333 30.914 56.1333C16.9858 56.1333 5.69468 44.8422 5.69468 30.914C5.69468 16.9858 16.9858 5.69468 30.914 5.69468C42.4256 5.69468 52.1358 13.4075 55.1588 23.9474C56.9197 23.3075 58.7987 22.9137 60.7543 22.8078C57.1929 9.66642 45.1823 0 30.914 0C13.8407 0 0 13.8407 0 30.914C0 47.9873 13.8407 61.828 30.914 61.828C37.3863 61.828 43.3941 59.839 48.3594 56.4388C46.9798 55.1238 45.7923 53.6089 44.8437 51.9406Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M61.4212 61.828C72.6537 61.828 81.7594 52.7223 81.7594 41.4898C81.7594 30.2574 72.6537 21.1517 61.4212 21.1517C50.1888 21.1517 41.0831 30.2574 41.0831 41.4898C41.0831 52.7223 50.1888 61.828 61.4212 61.828ZM61.4212 56.1333C69.5086 56.1333 76.0647 49.5772 76.0647 41.4898C76.0647 33.4025 69.5086 26.8464 61.4212 26.8464C53.3339 26.8464 46.7778 33.4025 46.7778 41.4898C46.7778 49.5772 53.3339 56.1333 61.4212 56.1333Z"
        fill="currentColor"
      />
    </svg>
  )
}

function useIsTouchDevice() {
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(pointer: coarse)')
    const update = () => setIsTouch(mq.matches || 'ontouchstart' in window)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  return isTouch
}

export function PerspectivesConverge() {
  const sectionRef = useRef<HTMLElement>(null)
  const eyebrowRef = useRef<HTMLParagraphElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const bodyRef = useRef<HTMLParagraphElement>(null)
  const rolesRef = useRef<HTMLUListElement>(null)
  const hintRef = useRef<HTMLParagraphElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const [theme, setTheme] = useState<ThemeMode>('light')
  const [touchFlash, setTouchFlash] = useState(false)
  const isTouch = useIsTouchDevice()
  const [reducedMotion] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  const handleNodeFocus = (node: FocusedNodeInfo | null) => {
    if (isTouch && node) {
      setTouchFlash(true)
      window.setTimeout(() => setTouchFlash(false), 500)
    }
  }

  const toggleTheme = () => {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'))
  }

  useEffect(() => {
    const section = sectionRef.current
    if (!section || reducedMotion) return

    const ctx = gsap.context(() => {
      gsap.from([eyebrowRef.current, logoRef.current], {
        opacity: 0,
        y: 24,
        duration: 1.1,
        stagger: 0.12,
        ease: 'power3.out',
        delay: 0.2,
      })

      gsap.from(titleRef.current, {
        opacity: 0,
        y: 40,
        duration: 1.2,
        ease: 'power3.out',
        delay: 0.35,
      })

      gsap.from(bodyRef.current, {
        opacity: 0,
        y: 28,
        duration: 1,
        ease: 'power3.out',
        delay: 0.55,
      })

      if (rolesRef.current) {
        gsap.from(rolesRef.current.children, {
          opacity: 0,
          x: -12,
          duration: 0.7,
          stagger: 0.05,
          ease: 'power2.out',
          delay: 0.75,
        })
      }

      gsap.from(hintRef.current, {
        opacity: 0,
        duration: 0.8,
        delay: 1.1,
      })

      gsap.to(logoRef.current, {
        scale: 1.04,
        duration: 2.4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })

      gsap.to(section.querySelector(`.${styles.canvasWrap}`), {
        y: -40,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.2,
        },
      })
    }, section)

    return () => ctx.revert()
  }, [reducedMotion])

  const sectionClass = [
    styles.section,
    theme === 'dark' ? styles.sectionDark : '',
  ]
    .filter(Boolean)
    .join(' ')

  const canvasClass = [
    styles.canvasWrap,
    touchFlash ? styles.canvasTouchFlash : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <section
      ref={sectionRef}
      className={sectionClass}
      aria-label="Interactive network of collective understanding"
      data-theme={theme}
    >
      <button
        type="button"
        className={styles.themeToggle}
        onClick={toggleTheme}
        aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      >
        <span className={styles.themeToggleIcon} aria-hidden="true">
          {theme === 'light' ? '◐' : '◑'}
        </span>
        <span className={styles.themeToggleLabel}>
          {theme === 'light' ? 'Conference mode' : 'Light mode'}
        </span>
      </button>

      <div className={canvasClass}>
        <Suspense fallback={<div className={styles.canvasFallback} aria-hidden="true" />}>
          <NetworkCanvas
            reducedMotion={reducedMotion}
            theme={theme}
            isTouch={isTouch}
            onNodeFocus={handleNodeFocus}
          />
        </Suspense>
        <div className={styles.canvasVignette} aria-hidden="true" />

        <p ref={hintRef} className={styles.interactHint}>
          {isTouch
            ? 'Drag to rotate · Tap a node to connect'
            : 'Drag to rotate · Hover Cape Town to zoom'}
        </p>
      </div>

      <div className={styles.content}>
        <div ref={logoRef} className={styles.logoPulse}>
          <CounderRings className={styles.logo} />
        </div>

        <p ref={eyebrowRef} className={styles.eyebrow}>
          Counder Conference &middot; Cape Town
        </p>

        <h2 ref={titleRef} className={styles.title}>
          When perspectives connect,
          <br />
          <span className={styles.titleAccent}>understanding begins.</span>
        </h2>

        <p ref={bodyRef} className={styles.body}>
          Remarkable people from every continent, every discipline — their insights
          streaming toward one place. Once a year, five hundred voices gather where
          today meets tomorrow.
        </p>

        <ul ref={rolesRef} className={styles.cities} aria-label="Global network cities">
          {NETWORK_CITIES.map((city) => (
            <li key={city}>{city}</li>
          ))}
          <li className={styles.citiesDestination}>→ Cape Town</li>
        </ul>
      </div>

      <div className={styles.scrollHint} aria-hidden="true">
        <span className={styles.scrollLine} />
      </div>
    </section>
  )
}
