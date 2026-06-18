import { useCallback, useEffect, useLayoutEffect, useRef, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import gsap from 'gsap'
import { CONFERENCE_VIDEO_SRC } from '../constants/media'
import { useScrollLock } from '../hooks/useScrollLock'
import type { ThemeMode } from '../utils/sceneTheme'
import type { TeleportPhase } from '../types/teleport'
import styles from './CapeTownTeleport.module.css'

interface CapeTownTeleportProps {
  phase: TeleportPhase
  theme: ThemeMode
  embedded?: boolean
  isTouch: boolean
  canvasWrapRef: React.RefObject<HTMLDivElement | null>
  sectionRef: React.RefObject<HTMLElement | null>
  onConfirmTeleport: () => void
  onWarpComplete: () => void
  onClose: () => void
  onCancelPrompt: () => void
}

export function CapeTownTeleport({
  phase,
  theme,
  embedded = false,
  isTouch,
  canvasWrapRef,
  sectionRef,
  onConfirmTeleport,
  onWarpComplete,
  onClose,
  onCancelPrompt,
}: CapeTownTeleportProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const curtainRef = useRef<HTMLDivElement>(null)
  const portalRef = useRef<HTMLDivElement>(null)
  const tunnelRef = useRef<HTMLDivElement>(null)
  const flashRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const promptRef = useRef<HTMLDivElement>(null)
  const warpSessionRef = useRef(0)
  const warpHandedOff = useRef(false)
  const captionRef = useRef<HTMLDivElement>(null)

  useScrollLock(phase !== 'idle')

  useEffect(() => {
    if (phase !== 'prompt') return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancelPrompt()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, onCancelPrompt])

  useEffect(() => {
    if (phase !== 'video') return
    const video = videoRef.current
    if (!video) return

    const play = async () => {
      try {
        await video.play()
      } catch {
        /* autoplay may need user gesture — already from double-click */
      }
    }
    void play()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      video.pause()
    }
  }, [phase, onClose])

  useEffect(() => {
    if (!embedded) return
    const page = sectionRef.current?.closest('[data-integration-page]')
    if (!page) return

    if (phase === 'warp' || phase === 'video') {
      page.setAttribute('data-teleporting', '')
    } else {
      page.removeAttribute('data-teleporting')
    }
  }, [phase, embedded, sectionRef])

  useLayoutEffect(() => {
    if (phase !== 'prompt' || !promptRef.current) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        promptRef.current,
        { opacity: 0, y: 24, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.65, ease: 'power3.out' },
      )
      const ring = promptRef.current?.querySelector(`.${styles.promptRing}`)
      if (ring) {
        gsap.to(ring, {
          scale: 1.08,
          opacity: 0.5,
          duration: 1.6,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        })
      }
    }, promptRef)

    return () => ctx.revert()
  }, [phase])

  const runWarpDark = useCallback(
    (
      overlay: HTMLDivElement,
      portal: HTMLDivElement,
      tunnel: HTMLDivElement,
      flash: HTMLDivElement,
      canvas: HTMLDivElement | null,
      section: HTMLElement | null,
    ) => {
      gsap.set(overlay, { opacity: 1, pointerEvents: 'auto' })
      gsap.set(portal, { scale: 0, opacity: 1 })
      gsap.set(tunnel, { opacity: 0, rotation: 0 })
      gsap.set(flash, { opacity: 0, backgroundColor: '#ffffff' })

      const tl = gsap.timeline()

      tl.to(tunnel, { opacity: 1, duration: 0.25, ease: 'power2.out' }, 0)
        .to(tunnel, { rotation: 180, duration: 2.2, ease: 'power2.in' }, 0)
        .to(
          canvas,
          {
            scale: 2.8,
            duration: 2,
            ease: 'power3.in',
            force3D: true,
          },
          0.1,
        )
        .to(section, { backgroundColor: '#000000', duration: 1.2, ease: 'power2.in' }, 0.4)
        .to(portal, { scale: 28, duration: 1.35, ease: 'power4.in', force3D: true }, 0.55)
        .to(
          overlay.querySelectorAll(`.${styles.warpLine}`),
          {
            opacity: 1,
            scaleY: 1.4,
            duration: 0.8,
            stagger: 0.04,
            ease: 'power2.in',
          },
          0.7,
        )
        .to(flash, { opacity: 1, duration: 0.14, ease: 'power2.in' }, 1.68)
        .to(
          flash,
          {
            backgroundColor: '#000000',
            duration: 0.62,
            ease: 'power2.inOut',
          },
          1.82,
        )
        .call(
          () => {
            gsap.set(flash, { opacity: 1, backgroundColor: '#000000' })
            warpHandedOff.current = true
            onWarpComplete()
          },
          [],
          '-=0.18',
        )

      return tl
    },
    [onWarpComplete],
  )

  const runWarpLight = useCallback(
    (
      curtain: HTMLDivElement,
      canvas: HTMLDivElement | null,
    ) => {
      gsap.set(curtain, { opacity: 0 })

      const tl = gsap.timeline()

      if (canvas) {
        tl.to(
          canvas,
          {
            scale: 2.05,
            duration: 2.05,
            ease: 'power1.inOut',
            force3D: true,
          },
          0,
        )
      }

      tl.to(
        curtain,
        {
          opacity: 1,
          duration: 1.85,
          ease: 'power2.inOut',
        },
        0,
      ).call(
        () => {
          gsap.set(curtain, { opacity: 1 })
          warpHandedOff.current = true
          onWarpComplete()
        },
        [],
        '-=0.28',
      )

      return tl
    },
    [onWarpComplete],
  )

  const runWarp = useCallback(() => {
    const overlay = overlayRef.current
    const curtain = curtainRef.current
    const portal = portalRef.current
    const tunnel = tunnelRef.current
    const flash = flashRef.current
    const canvas = canvasWrapRef.current
    const section = sectionRef.current
    if (!overlay) return
    if (theme === 'light' && !curtain) return
    if (theme === 'dark' && (!tunnel || !portal || !flash)) return

    warpHandedOff.current = false

    const ctx = gsap.context(() => {
      gsap.set(overlay, { opacity: 1, pointerEvents: 'auto' })

      if (theme === 'light' && curtain) {
        runWarpLight(curtain, canvas)
      } else if (tunnel && portal && flash) {
        runWarpDark(overlay, portal, tunnel, flash, canvas, section)
      }
    }, overlay)

    return () => {
      if (!warpHandedOff.current) ctx.revert()
    }
  }, [canvasWrapRef, sectionRef, theme, runWarpDark, runWarpLight])

  useLayoutEffect(() => {
    if (phase !== 'warp') return

    const session = ++warpSessionRef.current
    const cleanup = runWarp()

    return () => {
      if (warpSessionRef.current === session) cleanup?.()
    }
  }, [phase, runWarp])

  useLayoutEffect(() => {
    if (phase !== 'video' || !videoRef.current) return

    const video = videoRef.current
    const caption = captionRef.current

    const ctx = gsap.context(() => {
      gsap.set(video, { opacity: 0, scale: theme === 'light' ? 1.02 : 1.05 })
      if (caption) gsap.set(caption, { opacity: 0, y: 14 })

      gsap.to(video, {
        opacity: 1,
        scale: 1,
        duration: theme === 'light' ? 1.2 : 0.95,
        ease: 'power2.out',
      })

      if (caption) {
        gsap.to(caption, {
          opacity: 1,
          y: 0,
          duration: 0.75,
          delay: 0.45,
          ease: 'power2.out',
        })
      }
    }, video)

    return () => ctx.revert()
  }, [phase, theme])

  useEffect(() => {
    if (phase === 'idle') {
      warpHandedOff.current = false
      const canvas = canvasWrapRef.current
      const section = sectionRef.current
      if (canvas) gsap.set(canvas, { clearProps: 'scale,filter' })
      if (section) gsap.set(section, { clearProps: 'backgroundColor' })
      if (curtainRef.current) gsap.set(curtainRef.current, { opacity: 0 })
    }
  }, [phase, canvasWrapRef, sectionRef])

  if (phase === 'idle') return null

  const teleportUi = (
    <>
      {phase === 'prompt' && (
        <div
          className={styles.promptOverlay}
          data-theme={theme}
          role="dialog"
          aria-modal="true"
          aria-labelledby="cape-town-prompt"
        >
          <div ref={promptRef} className={styles.promptCard}>
            <div className={styles.promptRing} aria-hidden="true" />
            <p className={styles.promptEyebrow}>Cape Town · 2027</p>
            <h3 id="cape-town-prompt" className={styles.promptTitle}>
              Ready to explore
              <br />
              Counder Cape Town?
            </h3>
            <p className={styles.promptHint}>
              {isTouch ? 'Tap Cape Town again to enter' : 'Click Cape Town again to enter'}
            </p>
            <button type="button" className={styles.promptEnter} onClick={onConfirmTeleport}>
              Enter Cape Town
            </button>
            <button type="button" className={styles.promptDismiss} onClick={onCancelPrompt}>
              Not yet
            </button>
          </div>
        </div>
      )}

      {(phase === 'warp' || phase === 'video') && (
        <div
          ref={overlayRef}
          className={[
            styles.warpOverlay,
            theme === 'light' ? styles.warpOverlayLight : '',
            phase === 'video' ? styles.warpOverlayDone : '',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-hidden={phase === 'video'}
        >
          <div ref={curtainRef} className={styles.warpCurtain} aria-hidden="true" />
          {theme === 'dark' && (
            <>
              <div ref={tunnelRef} className={styles.tunnel} aria-hidden="true">
                {Array.from({ length: 6 }).map((_, i) => (
                  <span key={i} className={styles.tunnelRing} style={{ '--i': i } as CSSProperties} />
                ))}
              </div>
              {Array.from({ length: 12 }).map((_, i) => (
                <span key={i} className={styles.warpLine} style={{ '--i': i } as CSSProperties} />
              ))}
              <div ref={portalRef} className={styles.portal} aria-hidden="true" />
              <div ref={flashRef} className={styles.flash} aria-hidden="true" />
            </>
          )}
        </div>
      )}

      {phase === 'video' && (
        <div className={styles.videoStage} role="dialog" aria-modal="true" aria-label="Counder Conference Cape Town">
          <button type="button" className={styles.videoClose} onClick={onClose} aria-label="Close video">
            ✕
          </button>
          <div className={styles.videoFrame}>
            <video
              ref={videoRef}
              className={styles.video}
              src={CONFERENCE_VIDEO_SRC}
              playsInline
              controls
              preload="auto"
            />
            <div className={styles.videoScrim} aria-hidden="true" />
            <div ref={captionRef} className={styles.videoCaption}>
              <p className={styles.videoEyebrow}>Counder Conference · Cape Town</p>
              <p className={styles.videoTitle}>You&apos;ve arrived.</p>
            </div>
          </div>
        </div>
      )}
    </>
  )

  return createPortal(teleportUi, document.body)
}
